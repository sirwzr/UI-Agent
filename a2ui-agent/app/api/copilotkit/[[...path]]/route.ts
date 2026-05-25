import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { createOpenAI } from "@ai-sdk/openai";
import { A2UI_SYSTEM_PROMPT } from "@/lib/a2ui/prompts/system";
import { enrichSystemPrompt } from "@/lib/a2ui/prompts/examples";
import { a2uiDefinitions } from "@/lib/a2ui/catalog-definitions";
import { webSearchTool } from "@/lib/tools/webSearch";

const deepseekProvider = createOpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
});

const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

function resolveModel() {
  const provider = process.env.LLM_PROVIDER ?? "deepseek";
  if (provider === "openai") {
    return openaiProvider.chat(process.env.OPENAI_MODEL ?? "gpt-4o");
  }
  return deepseekProvider.chat("deepseek-chat");
}

const ENRICHED_PROMPT = enrichSystemPrompt(A2UI_SYSTEM_PROMPT);

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: resolveModel(),
      prompt: ENRICHED_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 16384,
      tools: [webSearchTool],
    }),
  },
  a2ui: {
    injectA2UITool: true,
    schema: {
      catalogId: "https://a2ui.org/specification/v0_9/basic_catalog.json",
      components: a2uiDefinitions,
    },
  },
});

const serviceAdapter = new ExperimentalEmptyAdapter();

const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter,
  endpoint: "/api/copilotkit",
});

// 包装 handler 添加日志和错误处理
async function loggedHandler(req: Request) {
  const start = Date.now();
  const url = new URL(req.url);
  console.log(`[copilotkit] ${req.method} ${url.pathname} started`);
  try {
    const res = await handleRequest(req);
    console.log(`[copilotkit] ${req.method} ${url.pathname} → ${res.status} (${Date.now() - start}ms)`);
    if (!res.ok && res.status !== 200) {
      const body = await res.clone().text().catch(() => "<unreadable>");
      console.error(`[copilotkit] ${req.method} ${url.pathname} error body (first 500 chars):`, body.slice(0, 500));
    }
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[copilotkit] ${req.method} ${url.pathname} error (${Date.now() - start}ms):`, msg);
    if (msg.includes("DEEPSEEK") || msg.includes("API") || msg.includes("fetch") || msg.includes("ECONN")) {
      console.error(`[copilotkit] LLM API error suspected — check DEEPSEEK_BASE_URL and DEEPSEEK_API_KEY env vars`);
    }
    throw err;
  }
}

export const POST = loggedHandler;
export const GET = loggedHandler;
