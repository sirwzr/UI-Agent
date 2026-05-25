import type { ChatParams, LLMAdapter, LLMCapabilities, StreamChunk } from "./adapter";
import { logger } from "@/lib/logger";

// Google Gemini 使用原生 REST API (SSE)，避免额外 SDK 依赖
export class GeminiAdapter implements LLMAdapter {
  readonly modelId: string;
  readonly capabilities: LLMCapabilities = {
    maxContextTokens: 1_000_000,
    supportsVision: true,
    supportsFunctionCalling: true,
  };

  constructor(modelId = "gemini-2.5-flash") {
    this.modelId = modelId;
  }

  async *chatCompletionStream(params: ChatParams): AsyncIterable<StreamChunk> {
    logger.info({ model: this.modelId, msgCount: params.messages.length }, "Gemini stream start");

    const apiKey = process.env.GEMINI_API_KEY ?? "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:streamGenerateContent?alt=sse&key=${apiKey}`;

    // 转换 OpenAI 格式 → Gemini 格式
    const systemMsg = params.messages.find((m) => m.role === "system");
    const contents = params.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: params.temperature ?? 0.7,
        maxOutputTokens: params.maxTokens ?? 4096,
      },
    };

    if (systemMsg) {
      body.systemInstruction = {
        parts: [{ text: systemMsg.content }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error({ status: response.status, body: errText }, "Gemini API error");
      throw new Error(`Gemini API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Gemini response has no body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
        try {
          const json = JSON.parse(line.slice(6));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            yield { type: "text", content: text };
          }
        } catch {
          // 跳过非 JSON 行
        }
      }
    }

    yield { type: "done" };
  }
}
