// ===== 单元测试：LLM Adapter 接口 =====
import { describe, it, expect } from "vitest";
import type { LLMAdapter, ChatParams, StreamChunk } from "@/lib/llm/adapter";

// Mock adapter 用于测试接口行为
class MockAdapter implements LLMAdapter {
  readonly modelId = "mock-model";
  readonly capabilities = {
    maxContextTokens: 1000,
    supportsVision: false,
    supportsFunctionCalling: false,
  };

  async *chatCompletionStream(_params: ChatParams): AsyncIterable<StreamChunk> {
    yield { type: "text" as const, content: "Hello" };
    yield { type: "text" as const, content: " world" };
    yield {
      type: "done" as const,
      usage: { promptTokens: 5, completionTokens: 2 },
    };
  }
}

describe("LLMAdapter interface", () => {
  it("should emit text chunks and done", async () => {
    const adapter = new MockAdapter();
    const chunks: string[] = [];

    for await (const chunk of adapter.chatCompletionStream({
      messages: [{ role: "user", content: "hi" }],
    })) {
      if (chunk.type === "text") chunks.push(chunk.content!);
      if (chunk.type === "done") {
        expect(chunk.usage).toBeDefined();
        expect(chunk.usage!.promptTokens).toBe(5);
      }
    }

    expect(chunks).toEqual(["Hello", " world"]);
  });

  it("should report capabilities", () => {
    const adapter = new MockAdapter();
    expect(adapter.capabilities.maxContextTokens).toBe(1000);
    expect(adapter.capabilities.supportsVision).toBe(false);
  });
});
