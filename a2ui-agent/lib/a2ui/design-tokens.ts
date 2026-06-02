// ===== A2UI 设计 Token 引擎 =====
// 按页面类型自动组合设计 Token，替代静态配色方案
// 支持用户偏好覆盖，实现动态主题生成

export type PageType =
  | "dashboard"
  | "product"
  | "landing"
  | "form"
  | "datamanage"
  | "social"
  | "custom";

export interface DesignTokens {
  /** 品牌主色 — Button.primary、Chart、强调元素 */
  primaryColor: string;
  /** 页面背景色 */
  bgColor: string;
  /** 次级背景 — Card、面板 */
  bgSecondary: string;
  /** 主文本色 */
  textPrimary: string;
  /** 辅助文本色 — caption、描述 */
  textSecondary: string;
  /** 边框色 */
  borderColor: string;
  /** 间距（px） */
  spacing: {
    /** 区块间间距 */
    section: number;
    /** 同组元素间距 */
    item: number;
    /** 页面内边距 */
    page: number;
  };
  /** 字号（px） */
  fontSize: {
    h1: number;
    h2: number;
    body: number;
    caption: number;
  };
  /** 圆角（px） */
  borderRadius: number;
  /** 卡片阴影 */
  shadow: string;
  /** 图表配色序列 */
  chartColors: string[];
  /** 最大内容宽度（px） */
  maxWidth: number;
}

// ===== 预置页面类型 Token =====

const TOKENS_DASHBOARD: DesignTokens = {
  primaryColor: "#06b6d4",
  bgColor: "#0f172a",
  bgSecondary: "#1e293b",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  borderColor: "#334155",
  spacing: { section: 20, item: 12, page: 24 },
  fontSize: { h1: 26, h2: 18, body: 14, caption: 12 },
  borderRadius: 8,
  shadow: "0 4px 6px rgba(0,0,0,0.3)",
  chartColors: ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
  maxWidth: 1200,
};

const TOKENS_PRODUCT: DesignTokens = {
  primaryColor: "#2563eb",
  bgColor: "#ffffff",
  bgSecondary: "#f8fafc",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  borderColor: "#e2e8f0",
  spacing: { section: 24, item: 16, page: 24 },
  fontSize: { h1: 24, h2: 18, body: 14, caption: 12 },
  borderRadius: 12,
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
  chartColors: ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2"],
  maxWidth: 960,
};

const TOKENS_LANDING: DesignTokens = {
  primaryColor: "#7c3aed",
  bgColor: "#ffffff",
  bgSecondary: "#faf5ff",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  borderColor: "#e9d5ff",
  spacing: { section: 32, item: 20, page: 32 },
  fontSize: { h1: 28, h2: 20, body: 15, caption: 13 },
  borderRadius: 16,
  shadow: "0 4px 20px rgba(0,0,0,0.06)",
  chartColors: ["#7c3aed", "#a855f7", "#c084fc", "#e9d5ff", "#2563eb", "#db2777"],
  maxWidth: 1100,
};

const TOKENS_FORM: DesignTokens = {
  primaryColor: "#2563eb",
  bgColor: "#f1f5f9",
  bgSecondary: "#ffffff",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  borderColor: "#e2e8f0",
  spacing: { section: 20, item: 12, page: 24 },
  fontSize: { h1: 22, h2: 16, body: 14, caption: 12 },
  borderRadius: 10,
  shadow: "0 2px 8px rgba(0,0,0,0.06)",
  chartColors: ["#2563eb", "#7c3aed", "#db2777"],
  maxWidth: 600,
};

const TOKENS_DATAMANAGE: DesignTokens = {
  primaryColor: "#2563eb",
  bgColor: "#f8fafc",
  bgSecondary: "#ffffff",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  borderColor: "#e2e8f0",
  spacing: { section: 16, item: 8, page: 16 },
  fontSize: { h1: 20, h2: 16, body: 13, caption: 11 },
  borderRadius: 6,
  shadow: "0 1px 2px rgba(0,0,0,0.04)",
  chartColors: ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#0891b2"],
  maxWidth: 1200,
};

const TOKENS_SOCIAL: DesignTokens = {
  primaryColor: "#f59e0b",
  bgColor: "#fefce8",
  bgSecondary: "#ffffff",
  textPrimary: "#422006",
  textSecondary: "#78716c",
  borderColor: "#fde68a",
  spacing: { section: 20, item: 14, page: 20 },
  fontSize: { h1: 24, h2: 18, body: 14, caption: 12 },
  borderRadius: 12,
  shadow: "0 1px 4px rgba(0,0,0,0.04)",
  chartColors: ["#f59e0b", "#d97706", "#fbbf24", "#fcd34d", "#ec4899", "#10b981"],
  maxWidth: 800,
};

const TOKENS_MAP: Record<Exclude<PageType, "custom">, DesignTokens> = {
  dashboard: TOKENS_DASHBOARD,
  product: TOKENS_PRODUCT,
  landing: TOKENS_LANDING,
  form: TOKENS_FORM,
  datamanage: TOKENS_DATAMANAGE,
  social: TOKENS_SOCIAL,
};

// ===== 从用户输入推断页面类型 =====

const PAGE_TYPE_KEYWORDS: Record<string, Exclude<PageType, "custom">> = {
  "仪表盘": "dashboard", "监控": "dashboard", "看板": "dashboard", "大屏": "dashboard",
  "dashboard": "dashboard", "monitor": "dashboard",
  "产品": "product", "商品": "product", "展示": "product", "详情": "product",
  "product": "product", "shop": "product", "store": "product",
  "落地页": "landing", "营销": "landing", "推广": "landing", "landing": "landing",
  "hero": "landing",
  "表单": "form", "注册": "form", "登录": "form", "问卷": "form", "调查": "form",
  "form": "form", "register": "form", "login": "form",
  "管理": "datamanage", "后台": "datamanage", "列表": "datamanage", "表格": "datamanage",
  "admin": "datamanage", "crud": "datamanage",
  "社交": "social", "个人": "social", "主页": "social", "profile": "social",
  "社区": "social", "social": "social",
};

export function inferPageType(userInput: string): Exclude<PageType, "custom"> {
  const lower = userInput.toLowerCase();
  let bestMatch: Exclude<PageType, "custom"> = "product";
  let bestScore = 0;

  for (const [keyword, pageType] of Object.entries(PAGE_TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      // 更长的关键词匹配 = 更精确
      const score = keyword.length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pageType;
      }
    }
  }

  return bestMatch;
}

// ===== 公开 API =====

export function getTokensForPageType(
  type: PageType,
  overrides?: Partial<DesignTokens>,
): DesignTokens {
  if (type === "custom") {
    return { ...TOKENS_PRODUCT, ...overrides };
  }
  const base = TOKENS_MAP[type] ?? TOKENS_PRODUCT;
  return { ...base, ...overrides };
}

/**
 * 从用户输入中提取颜色偏好
 * 支持: 色名(红/蓝/绿/紫/橙)、十六进制色值
 */
export function extractColorPreference(userInput: string): string | null {
  const hexMatch = userInput.match(/#[0-9a-fA-F]{6}/);
  if (hexMatch) return hexMatch[0];

  const colorMap: Record<string, string> = {
    "红": "#dc2626", "红色": "#dc2626",
    "蓝": "#2563eb", "蓝色": "#2563eb",
    "绿": "#16a34a", "绿色": "#16a34a",
    "紫": "#7c3aed", "紫色": "#7c3aed",
    "橙": "#ea580c", "橙色": "#ea580c", "橘": "#ea580c",
    "粉": "#ec4899", "粉色": "#ec4899",
    "青": "#06b6d4", "青色": "#06b6d4", "天蓝": "#06b6d4",
    "黄": "#eab308", "黄色": "#eab308",
    "灰": "#6b7280", "灰色": "#6b7280",
    "黑": "#0f172a", "黑色": "#0f172a",
    "深色": "#0f172a", "暗色": "#0f172a", "dark": "#0f172a",
  };

  for (const [keyword, color] of Object.entries(colorMap)) {
    if (userInput.includes(keyword)) return color;
  }

  return null;
}

/**
 * 生成给 Agent 的 Token 选择指令（注入 system prompt 用的简短版本）
 */
export function generateTokenPrompt(): string {
  return `
## 设计 Token 选择规则

根据页面类型自动选择配色和布局参数。以下为各类型的关键 Token 值，生成界面时参照使用：

| 页面类型 | 主色 | 背景 | 区块间距 | 最大宽度 | 圆角 |
|----------|------|------|----------|----------|------|
| 仪表盘 | ${TOKENS_DASHBOARD.primaryColor} | ${TOKENS_DASHBOARD.bgColor} | ${TOKENS_DASHBOARD.spacing.section}px | ${TOKENS_DASHBOARD.maxWidth}px | ${TOKENS_DASHBOARD.borderRadius}px |
| 产品展示 | ${TOKENS_PRODUCT.primaryColor} | ${TOKENS_PRODUCT.bgColor} | ${TOKENS_PRODUCT.spacing.section}px | ${TOKENS_PRODUCT.maxWidth}px | ${TOKENS_PRODUCT.borderRadius}px |
| 落地页 | ${TOKENS_LANDING.primaryColor} | ${TOKENS_LANDING.bgColor} | ${TOKENS_LANDING.spacing.section}px | ${TOKENS_LANDING.maxWidth}px | ${TOKENS_LANDING.borderRadius}px |
| 表单 | ${TOKENS_FORM.primaryColor} | ${TOKENS_FORM.bgColor} | ${TOKENS_FORM.spacing.section}px | ${TOKENS_FORM.maxWidth}px | ${TOKENS_FORM.borderRadius}px |
| 数据管理 | ${TOKENS_DATAMANAGE.primaryColor} | ${TOKENS_DATAMANAGE.bgColor} | ${TOKENS_DATAMANAGE.spacing.section}px | ${TOKENS_DATAMANAGE.maxWidth}px | ${TOKENS_DATAMANAGE.borderRadius}px |
| 社交/个人 | ${TOKENS_SOCIAL.primaryColor} | ${TOKENS_SOCIAL.bgColor} | ${TOKENS_SOCIAL.spacing.section}px | ${TOKENS_SOCIAL.maxWidth}px | ${TOKENS_SOCIAL.borderRadius}px |

如果用户在对话中指定了颜色偏好，优先采用用户选择并相应调整。
`;
}
