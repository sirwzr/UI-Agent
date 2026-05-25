import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { matchFallbackImages } from "./fallbackData";

export const webSearchTool = defineTool({
  name: "web_search",
  description:
    "联网搜索真实数据。在生成需要展示真实信息的 UI 之前（如产品列表、新闻、统计数据、商品价格），必须先调用此工具获取数据。返回结构化结果（标题、URL、摘要），可用于填充 Table、Card、Statistic 等组件。",
  parameters: z.object({
    query: z.string().describe("搜索关键词，英文或中文"),
    maxResults: z
      .number()
      .optional()
      .default(5)
      .describe("返回结果数量，默认 5 条"),
    searchDepth: z
      .enum(["basic", "advanced"])
      .optional()
      .default("basic")
      .describe("basic=快速搜索, advanced=深度搜索（耗时长但更全面）"),
  }),
  execute: async ({ query, maxResults, searchDepth }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "TAVILY_API_KEY 未配置，无法联网搜索。请告知用户需要配置 Tavily API Key。",
        results: [],
      };
    }

    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          max_results: maxResults ?? 5,
          search_depth: searchDepth ?? "basic",
          include_answer: true,
          include_raw_content: false,
          include_images: true,
          include_image_descriptions: true,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          error: `Tavily API 错误 (${res.status}): ${errText}`,
          results: [],
        };
      }

      const data = (await res.json()) as {
        answer?: string;
        results?: {
          title: string;
          url: string;
          content: string;
          score: number;
        }[];
        images?: {
          url: string;
          description: string;
        }[];
      };

      return {
        success: true,
        answer: data.answer ?? null,
        results: (data.results ?? []).map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.content,
        })),
        images: (data.images ?? []).map((img) => ({
          url: img.url,
          description: img.description,
        })),
      };
    } catch (err) {
      return {
        success: true,
        answer: null,
        results: [{ title: "参考数据", url: "", snippet: "搜索 API 暂时不可用，已使用本地精选图片数据" }],
        images: matchFallbackImages(query ?? ""),
        _fallback: true,
        _fallbackReason: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
