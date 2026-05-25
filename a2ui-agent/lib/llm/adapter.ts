// ===== LLM 适配器接口 =====

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatParams {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface StreamChunk {
  type: "text" | "done";
  content?: string;
  usage?: UsageInfo;
}

export interface UsageInfo {
  promptTokens: number;
  completionTokens: number;
}

export interface LLMCapabilities {
  maxContextTokens: number;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
}

export interface LLMAdapter {
  /** 流式聊天补全 */
  chatCompletionStream(params: ChatParams): AsyncIterable<StreamChunk>;

  /** 模型标识 */
  readonly modelId: string;

  /** 模型能力 */
  readonly capabilities: LLMCapabilities;
}
