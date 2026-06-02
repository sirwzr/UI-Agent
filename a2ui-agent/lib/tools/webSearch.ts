import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { matchFallbackImages, matchFallbackTextContent } from "./fallbackData";
import { searchPexelsPhotos, searchPexelsVideos } from "./pexelsSearch";
import { appendLog } from "@/lib/debug/serverLogs";

const TEXT_TIMEOUT_MS = 12000; // Qwen 搜索需要更多时间（模型推理 + 联网搜索）

interface TextResult {
  title: string;
  url: string;
  snippet: string;
}

const QWEN_SEARCH_SYSTEM_PROMPT = `你是一个专业搜索助手。请针对搜索关键词进行互联网搜索，返回高质量结果。

## 搜索策略
1. 优先搜索权威来源：官方网站、百科、知名媒体、行业门户
2. 如果关键词是产品类，搜索产品评测、参数规格、价格、用户评价
3. 如果关键词是数据类，搜索最新统计数据、行业报告、趋势分析
4. 如果关键词是美食/旅行类，搜索推荐榜单、攻略、评分、特色介绍
5. 如果关键词是商务/企业类，搜索公司介绍、业务范围、行业地位

## 结果筛选标准
- 时效性：优先最近 1 年的信息
- 信息密度：包含具体数字、事实、案例的结果优先
- 避开：纯广告、低质量聚合站、过时信息、内容农场

## 输出格式
返回 JSON 数组，每条包含：
- title: 简短准确的标题（≤30字）
- url: 真实链接，不知道填"无"
- snippet: 摘要 80-200 字，必须包含具体数据和事实（数字、百分比、日期、案例等），不要泛泛而谈

如果搜索结果质量不高或数量不足（< 3 条），在最后一条的 snippet 中标注 "[搜索建议：建议改用关键词 XXX 重新搜索]"

只返回 JSON 数组，不要返回其他文字。`;

/**
 * 通过通义千问原生联网搜索获取文本数据
 * DashScope 的 enable_search 参数让 Qwen 自动搜索互联网并返回最新信息
 * 无需额外注册任何搜索 API，使用已有的 DASHSCOPE_API_KEY
 */
async function searchViaQwen(query: string, retryCount = 0): Promise<TextResult[]> {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) return [];

  async function doSearch(q: string): Promise<TextResult[]> {
    try {
      const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen-plus",
          messages: [
            { role: "system", content: QWEN_SEARCH_SYSTEM_PROMPT },
            { role: "user", content: `搜索关键词：${q}` },
          ],
          max_tokens: 3000,
          temperature: 0.1,
          enable_search: true,
        }),
        signal: AbortSignal.timeout(TEXT_TIMEOUT_MS),
      });

      if (!res.ok) return [];

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content ?? "";
      if (!content) return [];

      // 尝试从响应中提取 JSON 数组
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as { title: string; url?: string; snippet: string }[];
          return parsed
            .filter((r) => r.snippet && r.snippet.length >= 30)
            .map((r) => ({
              title: r.title || q,
              url: r.url || "",
              snippet: r.snippet,
            }));
        } catch {
          // JSON 解析失败，回退到全文拆分
        }
      }

      // 回退：将全文作为一条结果
      if (content.length >= 30) {
        return [{ title: q, url: "", snippet: content.slice(0, 800) }];
      }

      return [];
    } catch {
      return [];
    }
  }

  const results = await doSearch(query);

  // 如果结果不足且还有重试次数，简化 query 重试
  if (results.length < 3 && retryCount < 1) {
    const simplifiedQuery = query
      .split(" ")
      .filter((w) => w.length > 1)
      .slice(0, 5)
      .join(" ");
    if (simplifiedQuery && simplifiedQuery !== query) {
      const retryResults = await doSearch(simplifiedQuery);
      if (retryResults.length > 0) {
        // 合并去重
        const seen = new Set(results.map((r) => r.url));
        for (const r of retryResults) {
          if (!seen.has(r.url)) {
            seen.add(r.url);
            results.push(r);
          }
        }
      }
    }
  }

  return results;
}

/**
 * 合并去重模式：所有文本源并行请求，按 URL 去重合并
 * 当前主源：通义千问原生搜索（DASHSCOPE_API_KEY）
 */
async function mergeTextSearch(query: string): Promise<{ results: TextResult[]; source: string }> {
  const sources: [string, () => Promise<TextResult[]>][] = [
    ["qwen", () => searchViaQwen(query)],
  ];

  const settled = await Promise.allSettled(
    sources.map(async ([name, fn]) => {
      const results = await fn();
      return { name, results };
    }),
  );

  const merged: TextResult[] = [];
  const seenUrls = new Set<string>();
  const activeSources: string[] = [];

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    const { name, results } = result.value;
    if (results.length === 0) continue;
    activeSources.push(name);
    for (const item of results) {
      if (!item.snippet || item.snippet.length < 20) continue;
      if (seenUrls.has(item.url)) continue;
      seenUrls.add(item.url);
      merged.push(item);
    }
  }

  if (merged.length > 0) {
    return { results: merged, source: activeSources.join("+") };
  }

  return { results: [], source: "none" };
}

export const webSearchTool = defineTool({
  name: "web_search",
  description:
    "搜索图片和文本数据。图片来自 Pexels 图库，文本通过通义千问联网搜索获取。若返回 _textAvailable: false，使用 _fallbackContent 中的结构化数据填充界面。搜索完成后必须用 RichText 告知用户搜索状态，然后立即调用 render_a2ui。",
  parameters: z.object({
    query: z.string().describe("搜索关键词，英文或中文，尽量具体"),
    maxResults: z.number().optional().default(5).describe("返回结果数量"),
    searchDepth: z.enum(["basic", "advanced"]).optional().default("basic").describe("搜索深度"),
    location: z.string().optional().describe("城市名，用于本地化搜索"),
  }),
  execute: async ({ query, maxResults, searchDepth, location }) => {
    const startTs = Date.now();
    const effectiveQuery = location ? `${query} ${location}` : query;

    // 图片搜索和文本搜索并行
    const [pexelsResult, textMerge] = await Promise.all([
      searchPexelsPhotos(effectiveQuery, 10),
      mergeTextSearch(effectiveQuery),
    ]);

    const searchSources: string[] = [];
    const textAvailable = textMerge.results.length > 0;
    if (textAvailable) searchSources.push(textMerge.source);

    // 图片：Pexels 优先 + Unsplash 备用 + 本地 fallback
    let images: { url: string; description: string }[] = [];
    if (pexelsResult.success && pexelsResult.photos.length > 0) {
      images = pexelsResult.photos.map((p) => ({ url: p.url, description: p.alt || `照片 by ${p.photographer}` }));
      searchSources.push("pexels");
    }
    if (images.length === 0) {
      images = matchFallbackImages(effectiveQuery);
      searchSources.push("unsplash_fallback");
    }

    // 视频
    let videos: { url: string; duration: number; width: number; height: number; poster: string }[] = [];
    const videoResult = await searchPexelsVideos(effectiveQuery, 5);
    if (videoResult.success && videoResult.videos.length > 0) {
      videos = videoResult.videos;
    }

    // 文本 fallback：Qwen 搜索失败时提供结构化内容模板
    const fallbackContent = textAvailable ? null : matchFallbackTextContent(effectiveQuery);

    const duration = Date.now() - startTs;

    const statusParts: string[] = [];
    if (images.length > 0) statusParts.push(`${images.length} 张图片`);
    if (videos.length > 0) statusParts.push(`${videos.length} 个视频`);
    if (textAvailable) statusParts.push(`${textMerge.results.length} 条文本（千问搜索）`);

    const searchStatus =
      textAvailable && images.length > 0
        ? `已获取到 ${statusParts.join("，")} ✓`
        : images.length > 0
          ? `已获取到 ${statusParts.join("，")}，文本搜索暂不可用，将使用内置知识生成内容 ⚠️`
          : `搜索返回结果有限，将使用内置知识生成内容 ⚠️`;

    // 图片搜索诊断
    const pexelsSuccess = pexelsResult.success && pexelsResult.photos.length > 0;
    const pexelsCount = pexelsResult.success ? pexelsResult.photos.length : 0;
    const usedFallbackImages = images.length > 0 && !pexelsSuccess;
    const imageDiagnostics = {
      originalQuery: effectiveQuery,
      pexelsQuery: pexelsResult.success ? pexelsResult.pexelsQuery : effectiveQuery,
      pexelsSuccess,
      pexelsCount,
      usedFallbackImages,
      totalImages: images.length,
      videoCount: videos.length,
    };

    // 构建智能 _hint：根据搜索质量给 Agent 不同的指引
    const resultsPoor = images.length < 3 || textMerge.results.length < 3;
    const resultsOk = images.length >= 5 && textMerge.results.length >= 3;

    let hint: string;
    if (!textAvailable && images.length < 3) {
      hint = `⚠️ 搜索结果很少（图片:${images.length}, 文本:0）。不要重试搜索，直接用 _fallbackContent（如果存在）或自身知识生成界面。RichText ≥150字，Table ≥6行，Chart ≥8数据点。`;
    } else if (resultsPoor && textAvailable) {
      hint = `搜索结果偏少（图片:${images.length}, 文本:${textMerge.results.length}）。你可以选择：(1) 用不同角度的关键词再搜一轮（如换英文关键词），或 (2) 直接用现有素材 + _fallbackContent 生成。最多再搜 1 轮。`;
    } else if (resultsOk) {
      hint = `搜索成功：${searchStatus}。先用 RichText 告知用户搜索状态，然后使用搜索结果中的真实数据填充界面。图片 URL 已就绪可直接使用。`;
    } else {
      hint = `${searchStatus}。先用 RichText 告知用户状态，然后生成界面。图片 URL 可直接使用，文字内容优先用搜索结果，不足的用自身知识补充。`;
    }

    appendLog({
      ts: startTs,
      type: "tool_call",
      detail: `web_search: ${effectiveQuery} (images: ${images.length}, text: ${textAvailable ? `${textMerge.results.length}条(${textMerge.source})` : "unavailable"}, ${duration}ms)`,
      duration,
      success: true,
    });

    return {
      query: effectiveQuery,
      results: textAvailable ? textMerge.results : [],
      images,
      videos,
      _textAvailable: textAvailable,
      _textSource: textMerge.source,
      _imageCount: images.length,
      _videoCount: videos.length,
      _searchSources: searchSources,
      _searchStatus: searchStatus,
      _fallbackContent: fallbackContent,
      _imageDiagnostics: imageDiagnostics,
      _hint: hint,
      _contentGuideline: textAvailable
        ? null
        : "⚠️ 文本搜索不可用。请使用 _fallbackContent 中的结构化数据填充界面内容。如果 _fallbackContent 为 null（无匹配模板），请基于 query 主题用你自己的知识生成丰富内容——每个 RichText 至少 150 字，每个 Table 至少 6 行，每个 Chart 至少 8 个数据点。禁止使用占位文本如「在这里描述...」「数值一」「属性一」。",
    };
  },
});
