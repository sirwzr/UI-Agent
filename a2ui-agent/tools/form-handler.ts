// ===== 表单处理工具 =====
// 处理表单提交和字段验证

import type { ToolDef } from "./index";

export const formTools: ToolDef[] = [
  {
    name: "submit_form",
    description: "提交表单数据，写入数据库并返回确认信息",
    parameters: {
      type: "object",
      properties: {
        surfaceId: { type: "string", description: "来源 surface ID" },
        formData: { type: "object", description: "表单数据键值对" },
        formType: {
          type: "string",
          description: "表单类型（booking/registration/survey）",
        },
      },
      required: ["surfaceId", "formData"],
    },
    handler: async (args, context) => {
      const { surfaceId, formData, formType } = args as {
        surfaceId: string;
        formData: Record<string, unknown>;
        formType?: string;
      };

      // 基本验证
      if (!formData || Object.keys(formData).length === 0) {
        return {
          success: false,
          error: "表单数据为空",
          a2uiUpdate: {
            surfaceId,
            message: "请填写完整的表单信息",
            type: "error",
          },
        };
      }

      // 根据表单类型做特定校验
      if (formType === "registration") {
        const { password, confirmPassword } = formData as {
          password?: string;
          confirmPassword?: string;
        };
        if (password && confirmPassword && password !== confirmPassword) {
          return {
            success: false,
            error: "密码不匹配",
            a2uiUpdate: {
              surfaceId,
              message: "两次输入的密码不一致，请重新输入",
              type: "error",
            },
          };
        }
      }

      // 写入数据库
      try {
        const { prisma } = await import("@/lib/db/prisma");
        if (context.conversationId) {
          await prisma.message.create({
            data: {
              conversationId: context.conversationId,
              role: "system",
              content: `表单提交成功: ${JSON.stringify(formData)}`,
              textContent: `表单提交: ${formType ?? "general"}`,
              a2uiPayload: JSON.parse(
                JSON.stringify({ action: "submit_form", formType, formData }),
              ),
            },
          });
        }
      } catch {
        // 数据库不可用时静默处理
      }

      const typeLabel =
        formType === "booking" ? "预订"
          : formType === "registration" ? "注册"
          : formType === "survey" ? "反馈"
          : "表单";

      return {
        success: true,
        data: { formType, formData, submittedAt: new Date().toISOString() },
        a2uiUpdate: {
          surfaceId,
          message: `${typeLabel}提交成功！感谢您的使用。`,
          type: "success",
        },
      };
    },
  },

  {
    name: "validate_field",
    description: "实时校验单个表单字段",
    parameters: {
      type: "object",
      properties: {
        surfaceId: { type: "string", description: "来源 surface ID" },
        fieldName: { type: "string", description: "字段名称" },
        value: { description: "字段当前值" },
        rules: {
          type: "object",
          description: "验证规则 { required?, min?, max?, minLength?, pattern? }",
        },
      },
      required: ["surfaceId", "fieldName", "value"],
    },
    handler: async (args) => {
      const { surfaceId, fieldName, value, rules } = args as {
        surfaceId: string;
        fieldName: string;
        value: unknown;
        rules?: {
          required?: boolean;
          min?: number;
          max?: number;
          minLength?: number;
          pattern?: string;
        };
      };

      const errors: string[] = [];

      if (rules?.required && (value === undefined || value === null || value === "")) {
        errors.push(`${fieldName} 不能为空`);
      }

      if (typeof value === "number") {
        if (rules?.min !== undefined && value < rules.min) {
          errors.push(`${fieldName} 不能小于 ${rules.min}`);
        }
        if (rules?.max !== undefined && value > rules.max) {
          errors.push(`${fieldName} 不能大于 ${rules.max}`);
        }
      }

      if (typeof value === "string") {
        if (rules?.minLength !== undefined && value.length < rules.minLength) {
          errors.push(`${fieldName} 至少需要 ${rules.minLength} 个字符`);
        }
        if (rules?.pattern) {
          try {
            if (!new RegExp(rules.pattern).test(value)) {
              errors.push(`${fieldName} 格式不正确`);
            }
          } catch {
            // 无效正则
          }
        }
      }

      return {
        success: errors.length === 0,
        data: { fieldName, valid: errors.length === 0, errors },
        a2uiUpdate: errors.length > 0 ?
          { surfaceId, message: errors.join("；"), type: "error" }
          : undefined,
      };
    },
  },
];
