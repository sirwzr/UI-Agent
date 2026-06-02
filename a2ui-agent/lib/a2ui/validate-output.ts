// ===== A2UI 输出校验 =====
// Server 端校验生成的 A2UI JSON，不阻断生成，仅追加 warning
// 参考 Gemini 3 Pro Generative UI 的后处理管道设计

import type { A2UIComponent } from "./render-surface";
import { appendLog } from "@/lib/debug/serverLogs";

export interface ValidationResult {
  pass: boolean;
  warnings: string[];
  errors: string[];
}

// 每个页面类型的最小组件数要求
const MIN_COMPONENTS_BY_TYPE: Record<string, number> = {
  dashboard: 18,
  product: 12,
  landing: 10,
  form: 8,
  datamanage: 15,
  social: 15,
  default: 10,
};

// 合法的图片域名白名单
const ALLOWED_IMAGE_DOMAINS = [
  "images.pexels.com",
  "images.unsplash.com",
  "source.unsplash.com",
  "picsum.photos",
  "via.placeholder.com",
  "cdn.soundhelix.com",
];

function isAllowedImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return ALLOWED_IMAGE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

function countComponents(components: A2UIComponent[]): number {
  return components.length;
}

function findTableRowCount(comp: A2UIComponent): number | null {
  if (comp.component !== "Table" || !comp.dataSource) return null;
  const ds = comp.dataSource as { records?: unknown[] };
  if (Array.isArray(ds)) return ds.length;
  return Array.isArray(ds.records) ? ds.records.length : null;
}

function findChartDataPointCount(comp: A2UIComponent): number | null {
  if (comp.component !== "Chart" || !comp.data) return null;
  return Array.isArray(comp.data) ? comp.data.length : null;
}

function findRichTextLength(comp: A2UIComponent): number | null {
  if (comp.component !== "RichText") return null;
  return (comp.content ?? comp.text ?? "").length;
}

function findAllImageUrls(components: A2UIComponent[]): { compId: string; url: string }[] {
  const urls: { compId: string; url: string }[] = [];
  for (const comp of components) {
    if (comp.component === "Image" && comp.url) {
      urls.push({ compId: comp.id, url: comp.url });
    }
    if (comp.component === "Carousel" && comp.items) {
      for (const item of comp.items) {
        const carItem = item as { url?: string };
        if (carItem.url) urls.push({ compId: comp.id, url: carItem.url });
      }
    }
    if (comp.component === "Video" && comp.src) {
      urls.push({ compId: comp.id, url: comp.src });
    }
  }
  return urls;
}

export function validateA2UIOutput(
  components: A2UIComponent[],
  pageType: string = "default",
): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. root 组件必须存在
  const hasRoot = components.some((c) => c.id === "root");
  if (!hasRoot) {
    errors.push("缺少 root 组件 — UI 无法渲染");
  }

  // 2. 组件数量检查
  const count = countComponents(components);
  const minExpected = MIN_COMPONENTS_BY_TYPE[pageType] ?? MIN_COMPONENTS_BY_TYPE.default;
  if (count < minExpected) {
    warnings.push(`组件数量偏少: 实际 ${count}，建议 ≥ ${minExpected}（页面类型: ${pageType}）`);
  }

  // 3. 图片 URL 域名白名单
  const imageUrls = findAllImageUrls(components);
  for (const { compId, url } of imageUrls) {
    if (!isAllowedImageUrl(url)) {
      warnings.push(`组件 ${compId} 的 URL 不在白名单中: ${url.slice(0, 80)}...`);
    }
  }

  // 4. 数据充足性检查
  for (const comp of components) {
    const tableRows = findTableRowCount(comp);
    if (tableRows !== null && tableRows < 6) {
      warnings.push(`Table ${comp.id} 仅 ${tableRows} 行，建议 ≥ 6 行`);
    }
    const chartPoints = findChartDataPointCount(comp);
    if (chartPoints !== null && chartPoints < 8) {
      warnings.push(`Chart ${comp.id} 仅 ${chartPoints} 个数据点，建议 ≥ 8`);
    }
    const rtLen = findRichTextLength(comp);
    if (rtLen !== null && rtLen < 100) {
      warnings.push(`RichText ${comp.id} 仅 ${rtLen} 字，建议 ≥ 100 字`);
    }
  }

  // 5. 图表数量检查
  const chartCount = components.filter((c) => c.component === "Chart").length;
  if (chartCount > 2) {
    warnings.push(`Chart 数量: ${chartCount}，建议 ≤ 2 个`);
  }

  const pass = errors.length === 0;

  if (warnings.length > 0 || errors.length > 0) {
    appendLog({
      ts: Date.now(),
      type: "validation",
      detail: `A2UI validation: ${errors.length} errors, ${warnings.length} warnings`,
      duration: 0,
      success: pass,
    });
  }

  return { pass, warnings, errors };
}
