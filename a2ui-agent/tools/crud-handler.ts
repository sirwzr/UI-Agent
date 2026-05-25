// ===== CRUD 工具 =====
// 通用增删改查操作，支持产品/用户/文章等任意实体

import type { ToolDef, ToolContext, ToolResult } from "./index";
import { prisma } from "@/lib/db/prisma";

// 内存模拟数据存储（用于快速演示）
const memoryStore = new Map<string, Map<string, Record<string, unknown>>>();

function getStore(entity: string): Map<string, Record<string, unknown>> {
  if (!memoryStore.has(entity)) {
    memoryStore.set(entity, new Map());
    // 初始化演示数据
    const store = memoryStore.get(entity)!;
    if (entity === "products") {
      store.set("1", { id: "1", name: "产品 A", price: 99, stock: 120, status: "在售" });
      store.set("2", { id: "2", name: "产品 B", price: 199, stock: 45, status: "在售" });
      store.set("3", { id: "3", name: "产品 C", price: 299, stock: 0, status: "缺货" });
      store.set("4", { id: "4", name: "产品 D", price: 149, stock: 67, status: "在售" });
      store.set("5", { id: "5", name: "产品 E", price: 89, stock: 200, status: "在售" });
    } else if (entity === "users") {
      store.set("1", { id: "1", name: "张三", email: "zhangsan@example.com", role: "管理员", status: "活跃" });
      store.set("2", { id: "2", name: "李四", email: "lisi@example.com", role: "编辑", status: "活跃" });
      store.set("3", { id: "3", name: "王五", email: "wangwu@example.com", role: "用户", status: "禁用" });
    } else if (entity === "articles") {
      store.set("1", { id: "1", title: "A2UI 入门指南", category: "技术", status: "已发布", views: 1230 });
      store.set("2", { id: "2", title: "产品发布公告", category: "公告", status: "已发布", views: 890 });
      store.set("3", { id: "3", title: "最佳实践总结", category: "技术", status: "草稿", views: 45 });
    }
  }
  return memoryStore.get(entity)!;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const crudTools: ToolDef[] = [
  {
    name: "list_records",
    description: "查询记录列表，支持搜索和分页",
    parameters: {
      type: "object",
      properties: {
        entity: {
          type: "string",
          description: "实体类型: products / users / articles",
        },
        keyword: { type: "string", description: "搜索关键词（可选）" },
        page: { type: "number", description: "页码，默认 1" },
        pageSize: { type: "number", description: "每页数量，默认 10" },
      },
      required: ["entity"],
    },
    handler: async (args) => {
      const { entity, keyword, page = 1, pageSize = 10 } = args as {
        entity: string;
        keyword?: string;
        page?: number;
        pageSize?: number;
      };

      const store = getStore(entity);
      let records = Array.from(store.values());

      // 搜索过滤
      if (keyword) {
        const kw = keyword.toLowerCase();
        records = records.filter((r) =>
          Object.values(r).some(
            (v) => typeof v === "string" && v.toLowerCase().includes(kw),
          ),
        );
      }

      // 分页
      const total = records.length;
      const start = (page - 1) * pageSize;
      const paged = records.slice(start, start + pageSize);

      return {
        success: true,
        data: {
          records: paged,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    },
  },

  {
    name: "create_record",
    description: "创建新记录",
    parameters: {
      type: "object",
      properties: {
        entity: { type: "string", description: "实体类型" },
        data: { type: "object", description: "记录数据" },
      },
      required: ["entity", "data"],
    },
    handler: async (args, context) => {
      const { entity, data } = args as {
        entity: string;
        data: Record<string, unknown>;
      };

      const store = getStore(entity);
      const id = generateId();
      const record = { id, ...data };
      store.set(id, record);

      // 持久化到数据库
      try {
        if (context.conversationId) {
          await prisma.message.create({
            data: {
              conversationId: context.conversationId,
              role: "system",
              content: `创建记录: ${entity} ${JSON.stringify(record)}`,
              textContent: `创建 ${entity} 记录`,
              a2uiPayload: { action: "create_record", entity, data: record },
            },
          });
        }
      } catch {
        // 静默
      }

      return {
        success: true,
        data: record,
        a2uiUpdate: {
          surfaceId: context.surfaceId ?? "crud",
          message: `记录创建成功`,
          type: "success",
        },
      };
    },
  },

  {
    name: "update_record",
    description: "更新已有记录",
    parameters: {
      type: "object",
      properties: {
        entity: { type: "string", description: "实体类型" },
        id: { type: "string", description: "记录 ID" },
        data: { type: "object", description: "要更新的字段" },
      },
      required: ["entity", "id", "data"],
    },
    handler: async (args, context) => {
      const { entity, id, data } = args as {
        entity: string;
        id: string;
        data: Record<string, unknown>;
      };

      const store = getStore(entity);
      const existing = store.get(id);
      if (!existing) {
        return {
          success: false,
          error: "记录不存在",
          a2uiUpdate: {
            surfaceId: context.surfaceId ?? "crud",
            message: "记录不存在",
            type: "error",
          },
        };
      }

      const updated = { ...existing, ...data };
      store.set(id, updated);

      return {
        success: true,
        data: updated,
        a2uiUpdate: {
          surfaceId: context.surfaceId ?? "crud",
          message: "记录更新成功",
          type: "success",
        },
      };
    },
  },

  {
    name: "delete_record",
    description: "删除记录",
    parameters: {
      type: "object",
      properties: {
        entity: { type: "string", description: "实体类型" },
        id: { type: "string", description: "记录 ID" },
      },
      required: ["entity", "id"],
    },
    handler: async (args, context) => {
      const { entity, id } = args as { entity: string; id: string };

      const store = getStore(entity);
      if (!store.has(id)) {
        return {
          success: false,
          error: "记录不存在",
          a2uiUpdate: {
            surfaceId: context.surfaceId ?? "crud",
            message: "记录不存在",
            type: "error",
          },
        };
      }

      store.delete(id);

      return {
        success: true,
        data: { id },
        a2uiUpdate: {
          surfaceId: context.surfaceId ?? "crud",
          message: "记录已删除",
          type: "success",
        },
      };
    },
  },
];
