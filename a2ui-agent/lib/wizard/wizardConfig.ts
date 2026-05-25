// ===== 模板向导配置 =====
// 每个模板类别的 3 步引导：场景 → 内容 → 风格

export interface WizardChoice {
  key: string;
  label: string;
  icon: string;
  promptSuffix: string;
}

export interface ContentOption {
  key: string;
  label: string;
}

export interface StylePreset {
  key: string;
  label: string;
  emoji: string;
  description: string;
  promptSuffix: string;
  visualPreview: { bg: string; accent: string; text: string };
}

export interface CategoryWizardConfig {
  step1: {
    title: string;
    description: string;
    choices: WizardChoice[];
    allowCustom: boolean;
  };
  step2: {
    title: string;
    description: string;
    contentOptions: ContentOption[];
  };
  step3: {
    title: string;
    description: string;
    styles: StylePreset[];
  };
}

const STYLES: StylePreset[] = [
  {
    key: "dark-tech", label: "深色科技风", emoji: "🌌",
    description: "深色背景 + 霓虹色强调 + 数据可视化强化",
    promptSuffix: "，使用深色科技风格：深色背景配霓虹蓝紫色调，芯片感边框和发光数据指示器",
    visualPreview: { bg: "#0f172a", accent: "#38bdf8", text: "#e2e8f0" },
  },
  {
    key: "light-clean", label: "浅色简洁风", emoji: "✨",
    description: "白色背景 + 柔和色彩 + 卡片式布局",
    promptSuffix: "，使用浅色简洁风格：白色背景配淡蓝灰色卡片，圆角和柔和阴影",
    visualPreview: { bg: "#ffffff", accent: "#3b82f6", text: "#0f172a" },
  },
  {
    key: "corporate", label: "企业商务风", emoji: "🏢",
    description: "蓝色主色调 + 专业排版 + 信息密度高",
    promptSuffix: "，使用企业商务风格：深蓝色主色调，专业数据排版，适合管理层查看",
    visualPreview: { bg: "#f8fafc", accent: "#1e40af", text: "#1e293b" },
  },
  {
    key: "warm", label: "暖色生活风", emoji: "🌅",
    description: "暖橙色调 + 生活化场景 + 轻松氛围",
    promptSuffix: "，使用暖色生活风格：暖橙米色调，轻松自然的视觉感受",
    visualPreview: { bg: "#fff7ed", accent: "#ea580c", text: "#431407" },
  },
];

// ---- 所有类别共享风格选项（少数类别微调）----
const DEFAULT_STYLES = STYLES;

export const WIZARD_CONFIG: Record<string, CategoryWizardConfig> = {
  "数据分析": {
    step1: {
      title: "确认场景",
      description: "这个数据面板用于什么业务场景？",
      choices: [
        { key: "sales", label: "销售监控", icon: "💰", promptSuffix: "，用于日常销售数据监控，CEO和销售VP每日查看" },
        { key: "ops", label: "运维监控", icon: "🖥", promptSuffix: "，用于运维团队实时监控服务器和API状态" },
        { key: "marketing", label: "营销分析", icon: "📈", promptSuffix: "，用于市场营销团队追踪广告投放和转化效果" },
        { key: "product", label: "产品分析", icon: "📱", promptSuffix: "，用于产品团队分析用户行为和使用数据" },
      ],
      allowCustom: true,
    },
    step2: {
      title: "定制内容",
      description: "需要重点展示哪些数据维度？",
      contentOptions: [
        { key: "revenue", label: "收入指标" },
        { key: "users", label: "用户数据" },
        { key: "orders", label: "订单统计" },
        { key: "trends", label: "趋势图表" },
        { key: "alerts", label: "预警提示" },
        { key: "ranking", label: "排行列表" },
      ],
    },
    step3: { title: "选择风格", description: "偏好哪种视觉风格？", styles: DEFAULT_STYLES },
  },

  "电商": {
    step1: {
      title: "确认场景",
      description: "这是什么类型的电商页面？",
      choices: [
        { key: "product-detail", label: "商品详情", icon: "🛍", promptSuffix: "，一个电商商品详情页，突出产品卖点" },
        { key: "category", label: "分类列表", icon: "📋", promptSuffix: "，一个商品分类列表页面" },
        { key: "flash-sale", label: "限时抢购", icon: "⚡", promptSuffix: "，一个限时抢购/闪购促销页面，突出紧迫感" },
        { key: "brand-story", label: "品牌故事", icon: "🏷", promptSuffix: "，一个品牌故事介绍页面，强调品牌理念" },
      ],
      allowCustom: true,
    },
    step2: {
      title: "定制内容",
      description: "需要突出哪些元素？",
      contentOptions: [
        { key: "images", label: "商品图片" },
        { key: "price", label: "价格信息" },
        { key: "reviews", label: "用户评价" },
        { key: "specs", label: "规格参数" },
        { key: "promo", label: "促销标签" },
        { key: "cta", label: "购买按钮" },
      ],
    },
    step3: {
      title: "选择风格", description: "偏好哪种呈现风格？", styles: [
        {
          key: "minimal-luxe", label: "极简轻奢", emoji: "💎",
          description: "大面积留白 + 精致字体 + 产品大图",
          promptSuffix: "，使用极简轻奢风格：大面积留白，精致衬线字体，产品摄影大片",
          visualPreview: { bg: "#fafafa", accent: "#d4af37", text: "#1a1a1a" },
        },
        {
          key: "bold-modern", label: "大胆现代", emoji: "🔥",
          description: "高饱和色彩 + 大字标题 + 强烈对比",
          promptSuffix: "，使用大胆现代风格：高饱和主色，超大标题字体，强烈视觉冲击",
          visualPreview: { bg: "#ffffff", accent: "#dc2626", text: "#171717" },
        },
        ...STYLES.slice(0, 2),
      ],
    },
  },

  "营销": {
    step1: {
      title: "确认场景",
      description: "这是哪种类型的营销页面？",
      choices: [
        { key: "saas-landing", label: "SaaS 落地页", icon: "🚀", promptSuffix: "，一个 SaaS 产品营销落地页" },
        { key: "pricing", label: "定价方案", icon: "💎", promptSuffix: "，一个定价/套餐对比页面" },
        { key: "coming-soon", label: "即将上线", icon: "⏳", promptSuffix: "，一个产品即将上线的预告页面" },
        { key: "newsletter", label: "内容营销", icon: "📰", promptSuffix: "，一个内容营销/博客落地页" },
      ],
      allowCustom: true,
    },
    step2: {
      title: "定制内容",
      description: "需要包含哪些内容区块？",
      contentOptions: [
        { key: "hero", label: "Hero 主视觉" },
        { key: "features", label: "特性介绍" },
        { key: "video", label: "产品视频" },
        { key: "testimonials", label: "客户口碑" },
        { key: "pricing", label: "价格卡片" },
        { key: "faq", label: "常见问题" },
        { key: "cta", label: "行动号召" },
      ],
    },
    step3: { title: "选择风格", description: "偏好哪种视觉风格？", styles: DEFAULT_STYLES },
  },

  "数据管理": {
    step1: {
      title: "确认场景",
      description: "需要管理什么类型的数据？",
      choices: [
        { key: "crud", label: "CRUD 列表", icon: "🗄", promptSuffix: "，一个完整的数据管理列表页面，含搜索和操作" },
        { key: "detail", label: "详情展示", icon: "🧾", promptSuffix: "，一个数据详情展示页面" },
        { key: "import-export", label: "导入导出", icon: "📥", promptSuffix: "，一个数据导入导出操作面板" },
        { key: "log-viewer", label: "日志查看", icon: "📜", promptSuffix: "，一个系统日志查看面板" },
      ],
      allowCustom: true,
    },
    step2: {
      title: "定制内容",
      description: "需要哪些数据操作功能？",
      contentOptions: [
        { key: "search", label: "搜索过滤" },
        { key: "table", label: "数据表格" },
        { key: "pagination", label: "分页导航" },
        { key: "batch", label: "批量操作" },
        { key: "export", label: "导出功能" },
        { key: "stats", label: "统计汇总" },
      ],
    },
    step3: { title: "选择风格", description: "偏好哪种视觉风格？", styles: DEFAULT_STYLES },
  },

  "社交": {
    step1: {
      title: "确认场景",
      description: "这是哪种类型的社交页面？",
      choices: [
        { key: "profile", label: "个人主页", icon: "👤", promptSuffix: "，一个用户个人资料主页" },
        { key: "team", label: "团队介绍", icon: "👥", promptSuffix: "，一个团队成员介绍页面" },
        { key: "community", label: "社区动态", icon: "💬", promptSuffix: "，一个社区动态信息流页面" },
        { key: "creator", label: "创作者主页", icon: "🎨", promptSuffix: "，一个内容创作者的作品展示主页" },
      ],
      allowCustom: true,
    },
    step2: {
      title: "定制内容",
      description: "需要展示哪些信息？",
      contentOptions: [
        { key: "avatar", label: "头像/形象" },
        { key: "bio", label: "个人简介" },
        { key: "stats", label: "数据统计" },
        { key: "badges", label: "成就徽章" },
        { key: "links", label: "社交链接" },
        { key: "gallery", label: "作品集" },
      ],
    },
    step3: { title: "选择风格", description: "偏好哪种视觉风格？", styles: DEFAULT_STYLES },
  },

  "表单": {
    step1: {
      title: "确认场景",
      description: "表单的用途是什么？",
      choices: [
        { key: "register", label: "用户注册", icon: "📝", promptSuffix: "，一个用户注册/创建账号表单" },
        { key: "survey", label: "问卷调查", icon: "📋", promptSuffix: "，一个满意度调查或反馈问卷" },
        { key: "booking", label: "预约登记", icon: "📅", promptSuffix: "，一个在线预约/登记表单" },
        { key: "checkout", label: "结账支付", icon: "💳", promptSuffix: "，一个结账/支付信息表单" },
      ],
      allowCustom: true,
    },
    step2: {
      title: "定制内容",
      description: "需要哪些表单字段类型？",
      contentOptions: [
        { key: "text", label: "文本输入" },
        { key: "email", label: "邮箱验证" },
        { key: "password", label: "密码设置" },
        { key: "select", label: "下拉选择" },
        { key: "date", label: "日期选择" },
        { key: "upload", label: "文件上传" },
        { key: "agreement", label: "协议勾选" },
      ],
    },
    step3: { title: "选择风格", description: "偏好哪种视觉风格？", styles: DEFAULT_STYLES },
  },

  "项目管理": {
    step1: {
      title: "确认场景",
      description: "需要哪种项目管理视图？",
      choices: [
        { key: "kanban", label: "看板视图", icon: "📌", promptSuffix: "，一个项目看板，按状态分列展示任务卡片" },
        { key: "timeline", label: "时间线", icon: "📅", promptSuffix: "，一个活动/项目时间线页面" },
        { key: "gantt", label: "甘特图", icon: "📊", promptSuffix: "，一个项目甘特图视图" },
        { key: "sprint", label: "Sprint 仪表盘", icon: "🏃", promptSuffix: "，一个敏捷开发 Sprint 进度面板" },
      ],
      allowCustom: true,
    },
    step2: {
      title: "定制内容",
      description: "需要展示哪些项目信息？",
      contentOptions: [
        { key: "tasks", label: "任务卡片" },
        { key: "priority", label: "优先级标签" },
        { key: "assignees", label: "负责人" },
        { key: "deadlines", label: "截止日期" },
        { key: "progress", label: "进度指示" },
        { key: "milestones", label: "里程碑" },
      ],
    },
    step3: { title: "选择风格", description: "偏好哪种视觉风格？", styles: DEFAULT_STYLES },
  },

  "金融": {
    step1: {
      title: "确认场景",
      description: "这是哪种金融数据页面？",
      choices: [
        { key: "overview", label: "财务概览", icon: "💰", promptSuffix: "，一个月度财务概览面板" },
        { key: "portfolio", label: "投资组合", icon: "📈", promptSuffix: "，一个投资组合/资产配置视图" },
        { key: "transactions", label: "交易记录", icon: "🧾", promptSuffix: "，一个银行/钱包交易记录列表" },
        { key: "budget", label: "预算管理", icon: "🎯", promptSuffix: "，一个个人/企业预算管理面板" },
      ],
      allowCustom: true,
    },
    step2: {
      title: "定制内容",
      description: "需要哪些财务指标？",
      contentOptions: [
        { key: "income", label: "收入统计" },
        { key: "expense", label: "支出统计" },
        { key: "balance", label: "余额/资产" },
        { key: "trends", label: "趋势对比" },
        { key: "transactions", label: "交易明细" },
        { key: "budget", label: "预算执行" },
      ],
    },
    step3: { title: "选择风格", description: "偏好哪种视觉风格？", styles: DEFAULT_STYLES },
  },
};

/** 未匹配类别的默认配置 */
export const DEFAULT_WIZARD_CONFIG: CategoryWizardConfig = {
  step1: {
    title: "确认场景",
    description: "你想用这个模板做什么？",
    choices: [
      { key: "general", label: "通用场景", icon: "🎯", promptSuffix: "" },
    ],
    allowCustom: true,
  },
  step2: {
    title: "定制内容",
    description: "需要重点展示哪些内容？",
    contentOptions: [
      { key: "visual", label: "视觉元素" },
      { key: "data", label: "数据展示" },
      { key: "interactive", label: "交互操作" },
    ],
  },
  step3: { title: "选择风格", description: "偏好哪种视觉风格？", styles: DEFAULT_STYLES },
};

export function getWizardConfig(category: string): CategoryWizardConfig {
  return WIZARD_CONFIG[category] ?? DEFAULT_WIZARD_CONFIG;
}

/** 将向导选择组合为最终 prompt */
export function composePrompt(
  basePrompt: string,
  scene: string | null,
  customScene: string,
  content: string[],
  style: string | null,
  config: CategoryWizardConfig,
): string {
  const parts = [basePrompt];

  const sceneSuffix = customScene
    ? customScene
    : config.step1.choices.find((c) => c.key === scene)?.promptSuffix ?? "";
  if (sceneSuffix) parts.push(sceneSuffix);

  if (content.length > 0) {
    const labels = content
      .map((k) => config.step2.contentOptions.find((o) => o.key === k)?.label)
      .filter(Boolean);
    if (labels.length > 0) parts.push(`重点展示：${labels.join("、")}`);
  }

  const styleSuffix = config.step3.styles.find((s) => s.key === style)?.promptSuffix ?? "";
  if (styleSuffix) parts.push(styleSuffix);

  return parts.join("。");
}

/** 组合对话标题："模板名 · 风格名" */
export function composeTitle(templateTitle: string, style: string | null, config: CategoryWizardConfig): string {
  const styleLabel = config.step3.styles.find((s) => s.key === style)?.label;
  return styleLabel ? `${templateTitle} · ${styleLabel}` : templateTitle;
}
