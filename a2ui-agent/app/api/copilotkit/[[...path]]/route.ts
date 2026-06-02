import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { A2UI_SYSTEM_PROMPT } from "@/lib/a2ui/prompts/system";
import { enrichSystemPrompt } from "@/lib/a2ui/prompts/examples";
import { a2uiDefinitions } from "@/lib/a2ui/catalog-definitions";
import { generateComponentDocs } from "@/lib/a2ui/catalog-generator";
import { generateTokenPrompt } from "@/lib/a2ui/design-tokens";
import { allTools } from "@/lib/tools";
import { appendLog } from "@/lib/debug/serverLogs";

// ===== LLM Providers =====

const deepseekProvider = createOpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
});

const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const aliyunProvider = createOpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.DASHSCOPE_API_KEY ?? "",
});

const geminiProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
});

function resolveModel() {
  const provider = process.env.LLM_PROVIDER ?? "deepseek";
  switch (provider) {
    case "openai":
      return openaiProvider.chat(process.env.OPENAI_MODEL ?? "gpt-4o");
    case "aliyun":
      return aliyunProvider.chat(process.env.ALIYUN_MODEL ?? "qwen-plus");
    case "gemini":
      return geminiProvider.chat(process.env.GEMINI_MODEL ?? "gemini-2.5-flash");
    default:
      return deepseekProvider.chat("deepseek-chat");
  }
}

// ===== 动态注入组件目录和设计 Token 到 System Prompt =====
const catalogDocs = generateComponentDocs();
const tokenGuide = generateTokenPrompt();
const BASE_PROMPT = A2UI_SYSTEM_PROMPT.replace("{{CATALOG_DOCS}}", catalogDocs);
const PROMPT_WITH_TOKENS = `${BASE_PROMPT}\n${tokenGuide}`;
const ENRICHED_PROMPT = enrichSystemPrompt(PROMPT_WITH_TOKENS);

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: resolveModel(),
      prompt: ENRICHED_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 16384,
      tools: allTools,
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
    const duration = Date.now() - start;
    console.log(`[copilotkit] ${req.method} ${url.pathname} → ${res.status} (${duration}ms)`);
    appendLog({
      ts: start,
      type: "api_call",
      detail: `${req.method} ${url.pathname}`,
      duration,
      success: res.ok || res.status === 200,
    });
    if (!res.ok && res.status !== 200) {
      const body = await res.clone().text().catch(() => "<unreadable>");
      console.error(`[copilotkit] ${req.method} ${url.pathname} error body (first 500 chars):`, body.slice(0, 500));
    }
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const duration = Date.now() - start;
    console.error(`[copilotkit] ${req.method} ${url.pathname} error (${duration}ms):`, msg);
    appendLog({
      ts: start,
      type: "api_call",
      detail: `${req.method} ${url.pathname} ERROR: ${msg.slice(0, 100)}`,
      duration,
      success: false,
    });
    if (msg.includes("API") || msg.includes("fetch") || msg.includes("ECONN")) {
      console.error(`[copilotkit] LLM API error — check provider env vars (DEEPSEEK/DASHSCOPE/GEMINI/OPENAI)`);
    }
    throw err;
  }
}

export const POST = loggedHandler;
export const GET = loggedHandler;
