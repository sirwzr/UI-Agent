import type { LLMAdapter } from "./adapter";
import { DeepSeekAdapter } from "./deepseek";
import { OpenAIAdapter } from "./openai";
import { GeminiAdapter } from "./gemini";
import { logger } from "@/lib/logger";

export type LLMProvider = "deepseek" | "openai" | "gemini";

let cachedAdapter: LLMAdapter | null = null;

export function createLLMAdapter(provider?: LLMProvider): LLMAdapter {
  const p = provider ?? (process.env.LLM_PROVIDER as LLMProvider) ?? "deepseek";

  logger.info({ provider: p }, "Creating LLM adapter");

  switch (p) {
    case "deepseek":
      return new DeepSeekAdapter();
    case "openai":
      return new OpenAIAdapter(process.env.OPENAI_MODEL ?? "gpt-4o");
    case "gemini":
      return new GeminiAdapter(process.env.GEMINI_MODEL ?? "gemini-2.5-flash");
    default:
      logger.warn({ provider: p }, "Unknown provider, falling back to DeepSeek");
      return new DeepSeekAdapter();
  }
}

// 获取缓存的适配器（避免重复创建）
export function getLLMAdapter(): LLMAdapter {
  if (!cachedAdapter) {
    cachedAdapter = createLLMAdapter();
  }
  return cachedAdapter;
}

// 测试用：重置缓存
export function resetLLMAdapter(): void {
  cachedAdapter = null;
}
