// ===== 业务工具注册表 =====
// 所有 Agent 可调用的工具在此注册

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { toolCallsTotal, toolCallDuration } from "@/lib/metrics";
import { formTools } from "./form-handler";
import { dashboardTools } from "./dashboard-data";
import { crudTools } from "./crud-handler";

export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
}

export interface ToolContext {
  userId?: string;
  surfaceId?: string;
  conversationId?: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  // 是否应该发送 A2UI 更新作为响应
  a2uiUpdate?: {
    surfaceId: string;
    message: string;
    type: "success" | "error" | "info";
  };
}

// ===== 工具定义 =====

export const tools: ToolDef[] = [
  ...formTools,
  ...dashboardTools,
  ...crudTools,
  {
    name: "confirm_booking",
    description: "确认餐厅预订",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "预订日期 (YYYY-MM-DD)" },
        time: { type: "string", description: "预订时间 (HH:mm)" },
        count: { type: "number", description: "用餐人数" },
      },
      required: ["date", "time", "count"],
    },
    handler: async (args, context) => {
      logger.info({ args, userId: context.userId }, "confirm_booking called");

      // 参数校验
      const { date, time, count } = args as { date?: string; time?: string; count?: number };

      if (!date || !time || !count) {
        return {
          success: false,
          error: "缺少必要参数：date, time, count",
          a2uiUpdate: {
            surfaceId: context.surfaceId ?? "booking",
            message: "请填写完整的预订信息（日期、时间、人数）",
            type: "error",
          },
        };
      }

      if (count < 1 || count > 20) {
        return {
          success: false,
          error: "人数必须在 1-20 之间",
          a2uiUpdate: {
            surfaceId: context.surfaceId ?? "booking",
            message: "人数必须在 1-20 之间",
            type: "error",
          },
        };
      }

      // 写入数据库 (如果数据库可用)
      try {
        if (context.conversationId) {
          await prisma.message.create({
            data: {
              conversationId: context.conversationId,
              role: "system",
              content: `预订确认: ${date} ${time}, ${count}人`,
              textContent: `预订确认: ${date} ${time}, ${count}人`,
              a2uiPayload: { action: "confirm_booking", date, time, count },
            },
          });
        }
      } catch (dbError) {
        logger.warn({ err: dbError }, "Failed to persist booking (DB may be unavailable)");
      }

      return {
        success: true,
        data: { date, time, count, bookingId: `BK-${Date.now()}` },
        a2uiUpdate: {
          surfaceId: context.surfaceId ?? "booking",
          message: `预订成功！${date} ${time}，${count}位客人。您的预订编号：BK-${Date.now()}`,
          type: "success",
        },
      };
    },
  },

  {
    name: "search_restaurants",
    description: "搜索餐厅",
    parameters: {
      type: "object",
      properties: {
        keyword: { type: "string", description: "搜索关键词" },
        cuisine: { type: "string", description: "菜系类型" },
      },
      required: ["keyword"],
    },
    handler: async (args, context) => {
      const { keyword, cuisine } = args as { keyword: string; cuisine?: string };
      logger.info({ keyword, cuisine }, "search_restaurants called");

      // 模拟搜索结果（实际应查询数据库或外部 API）
      const mockResults = [
        { id: "1", name: `${keyword}精品餐厅`, rating: 4.8, cuisine: cuisine ?? "综合" },
        { id: "2", name: `${keyword}家常菜馆`, rating: 4.5, cuisine: cuisine ?? "中餐" },
        { id: "3", name: `${keyword}西餐厅`, rating: 4.3, cuisine: cuisine ?? "西餐" },
      ];

      return {
        success: true,
        data: mockResults,
      };
    },
  },
];

// ===== 工具注册表 =====

export const toolRegistry = Object.fromEntries(
  tools.map((t) => [
    t.name,
    {
      description: t.description,
      parameters: t.parameters,
      handler: t.handler,
    },
  ]),
);

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolContext = {},
): Promise<ToolResult> {
  const start = Date.now();
  const tool = tools.find((t) => t.name === name);

  if (!tool) {
    toolCallsTotal.inc({ toolName: name, status: "not_found" });
    return { success: false, error: `未知工具: ${name}` };
  }

  try {
    const result = await tool.handler(args, context);
    toolCallsTotal.inc({ toolName: name, status: result.success ? "success" : "error" });
    toolCallDuration.observe({ toolName: name }, (Date.now() - start) / 1000);
    return result;
  } catch (error) {
    toolCallsTotal.inc({ toolName: name, status: "exception" });
    logger.error({ err: error, toolName: name }, "Tool execution failed");
    return { success: false, error: error instanceof Error ? error.message : "工具执行异常" };
  }
}
