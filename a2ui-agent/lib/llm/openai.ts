import OpenAI from "openai";
import type { ChatParams, LLMAdapter, LLMCapabilities, StreamChunk } from "./adapter";
import { logger } from "@/lib/logger";

export class OpenAIAdapter implements LLMAdapter {
  private client: OpenAI;

  readonly modelId: string;
  readonly capabilities: LLMCapabilities = {
    maxContextTokens: 128_000,
    supportsVision: true,
    supportsFunctionCalling: true,
  };

  constructor(modelId = "gpt-4o") {
    this.modelId = modelId;
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? "",
    });
  }

  async *chatCompletionStream(params: ChatParams): AsyncIterable<StreamChunk> {
    logger.info({ model: this.modelId, msgCount: params.messages.length }, "OpenAI stream start");

    const stream = await this.client.chat.completions.create({
      model: this.modelId,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 4096,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield { type: "text", content: delta.content };
      }
      if (chunk.usage) {
        yield {
          type: "done",
          usage: {
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
          },
        };
      }
    }
  }
}
