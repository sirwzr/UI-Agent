import { z } from "zod";
import type { A2UIEnvelope } from "./types";
import { a2uiLogger, logger } from "@/lib/logger";
import { a2uiValidationErrors } from "@/lib/metrics";

// ===== A2UI v0.9 JSON Schema 校验规则 =====

const dynamicValueSchema = z.object({
  path: z.string().optional(),
  literalString: z.string().optional(),
  literalNumber: z.number().optional(),
  literalBool: z.boolean().optional(),
}).optional();

const actionDefSchema = z.object({
  name: z.string(),
  context: z.record(z.unknown()).optional(),
}).optional();

const validationDefSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
}).optional();

const tabDefSchema = z.object({
  label: z.string(),
  child: z.string(),
});

const componentDefSchema = z.object({
  id: z.string(),
  component: z.string(),
  weight: z.number().optional(),
  children: z.array(z.string()).optional(),
  child: z.string().optional(),
  text: z.string().optional(),
  variant: z.string().optional(),
  label: z.string().optional(),
  url: z.string().optional(),
  alt: z.string().optional(),
  action: actionDefSchema,
  primary: z.boolean().optional(),
  disabled: z.boolean().optional(),
  value: dynamicValueSchema,
  inputType: z.string().optional(),
  placeholder: z.string().optional(),
  validation: validationDefSchema,
  enableDate: z.boolean().optional(),
  enableTime: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  align: z.string().optional(),
  gap: z.number().optional(),
  title: z.string().optional(),
  tabs: z.array(tabDefSchema).optional(),
  steps: z.array(z.string()).optional(),
  currentStep: z.number().optional(),
  actions: z.array(z.string()).optional(),
  center: z.object({ lat: z.number(), lng: z.number() }).optional(),
  markers: dynamicValueSchema,
  data: dynamicValueSchema,
  type: z.string().optional(),
  fit: z.string().optional(),
  name: z.string().optional(),
  size: z.number().optional(),
});

const createSurfaceSchema = z.object({
  surfaceId: z.string(),
  catalogId: z.string(),
});

const updateComponentsSchema = z.object({
  surfaceId: z.string(),
  components: z.array(componentDefSchema).min(1, "至少需要一个组件"),
});

const updateDataModelSchema = z.object({
  surfaceId: z.string(),
  path: z.string().optional(),
  value: z.unknown().optional(),
  op: z.enum(["replace", "add", "remove"]).optional(),
});

const deleteSurfaceSchema = z.object({
  surfaceId: z.string(),
});

const envelopeSchema = z.object({
  version: z.literal("v0.9"),
  createSurface: createSurfaceSchema.optional(),
  updateComponents: updateComponentsSchema.optional(),
  updateDataModel: updateDataModelSchema.optional(),
  deleteSurface: deleteSurfaceSchema.optional(),
}).refine(
  (data) => {
    const keys = ["createSurface", "updateComponents", "updateDataModel", "deleteSurface"];
    const present = keys.filter((k) => data[k as keyof typeof data] != null);
    return present.length === 1;
  },
  { message: "必须包含且仅包含一个消息类型" },
);

// ===== 校验函数 =====

export interface ValidationResult {
  ok: boolean;
  error?: string;
  errorType?: "schema" | "no_root" | "duplicate_id" | "missing_version";
}

export function validateA2UIEnvelope(data: unknown): ValidationResult {
  const result = envelopeSchema.safeParse(data);
  if (!result.success) {
    const msg = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    a2uiValidationErrors.inc({ errorType: "schema" });
    return { ok: false, error: msg, errorType: "schema" };
  }

  // 额外校验 updateComponents
  if (result.data.updateComponents) {
    const comps = result.data.updateComponents.components;

    // 检查是否有 root
    const hasRoot = comps.some((c) => c.id === "root");
    if (!hasRoot) {
      a2uiValidationErrors.inc({ errorType: "no_root" });
      return { ok: false, error: "updateComponents 必须包含 id 为 'root' 的组件", errorType: "no_root" };
    }

    // 检查是否有重复 ID
    const ids = comps.map((c) => c.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length > 0) {
      a2uiValidationErrors.inc({ errorType: "duplicate_id" });
      return { ok: false, error: `存在重复组件 ID: ${dupes.join(", ")}`, errorType: "duplicate_id" };
    }
  }

  return { ok: true };
}

// 批量校验 JSONL 流中的一行
export function validateA2UILine(line: string): { ok: true; envelope: A2UIEnvelope } | { ok: false; error: string; errorType: string } {
  const trimmed = line.trim();
  if (!trimmed) return { ok: false, error: "空行", errorType: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    a2uiValidationErrors.inc({ errorType: "json_parse" });
    return { ok: false, error: "JSON 解析错误", errorType: "json_parse" };
  }

  const result = validateA2UIEnvelope(parsed);
  if (!result.ok) {
    return { ok: false, error: result.error!, errorType: result.errorType! };
  }

  return { ok: true, envelope: parsed as A2UIEnvelope };
}

// 校验整个 JSONL 流
export function validateA2UIStream(lines: string[]): { ok: boolean; envelopes: A2UIEnvelope[]; errors: string[] } {
  const envelopes: A2UIEnvelope[] = [];
  const errors: string[] = [];
  const seenSurfaces = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    const result = validateA2UILine(trimmed);
    if (!result.ok) {
      errors.push(`行 ${i + 1}: ${result.error}`);
      continue;
    }

    const env = result.envelope;

    // 业务规则：deleteSurface 引用的 surfaceId 之前必须 create 过
    if (env.createSurface) {
      seenSurfaces.add(env.createSurface.surfaceId);
    }
    if (env.updateComponents && !seenSurfaces.has(env.updateComponents.surfaceId)) {
      errors.push(`行 ${i + 1}: surfaceId '${env.updateComponents.surfaceId}' 未经过 createSurface`);
    }
    if (env.updateDataModel && !seenSurfaces.has(env.updateDataModel.surfaceId)) {
      errors.push(`行 ${i + 1}: surfaceId '${env.updateDataModel.surfaceId}' 未经过 createSurface`);
    }
    if (env.deleteSurface) {
      if (!seenSurfaces.has(env.deleteSurface.surfaceId)) {
        errors.push(`行 ${i + 1}: 要删除的 surfaceId '${env.deleteSurface.surfaceId}' 不存在`);
      }
      seenSurfaces.delete(env.deleteSurface.surfaceId);
    }

    envelopes.push(env);
  }

  logger.info(
    { envelopeCount: envelopes.length, errorCount: errors.length },
    "A2UI stream validation complete",
  );

  return { ok: errors.length === 0, envelopes, errors };
}
