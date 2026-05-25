import type { A2UIComponent } from "./render-surface";

export interface TemplateDef {
  id: string;
  title: string;
  emoji: string;
  description: string;
  prompt: string;
  category: string;
  components: A2UIComponent[];
}

const PICSUM = (seed: string, w = 800, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const TEMPLATES: TemplateDef[] = [
  // ===== 数据分析 =====
  {
    id: "analytics-dashboard",
    title: "销售战报 · 经营驾驶舱",
    emoji: "📊",
    description: "统计卡片 + 趋势图表 + 数据表格",
    category: "数据分析",
    prompt: "做一个销售数据仪表盘，展示今日订单数、总收入、活跃用户等关键指标，附带月度趋势图和最近订单列表",
    components: [
      { id: "root", component: "Column", children: ["title", "stats-row", "chart", "table"], gap: 20 },
      { id: "title", component: "Text", text: "销售仪表盘", variant: "h1" },
      { id: "stats-row", component: "Row", children: ["stat-1", "stat-2", "stat-3", "stat-4"], gap: 12 },
      { id: "stat-1", component: "Statistic", title: "今日订单", value: "1,234", prefix: "¥", trend: "up" },
      { id: "stat-2", component: "Statistic", title: "总收入", value: "89,200", prefix: "¥", trend: "up" },
      { id: "stat-3", component: "Statistic", title: "活跃用户", value: "5,678", trend: "up" },
      { id: "stat-4", component: "Statistic", title: "转化率", value: "12.5", suffix: "%", trend: "down" },
      {
        id: "chart", component: "Chart", title: "月度销售趋势", type: "bar",
        data: [
          { month: "1月", sales: 42000 }, { month: "2月", sales: 38000 },
          { month: "3月", sales: 51000 }, { month: "4月", sales: 47000 },
          { month: "5月", sales: 63000 }, { month: "6月", sales: 58000 },
        ],
        xField: "month", yField: "sales", color: "#3b82f6", height: 280,
      },
      {
        id: "table", component: "Table",
        columns: [
          { title: "订单号", dataIndex: "id" }, { title: "客户", dataIndex: "customer" },
          { title: "金额", dataIndex: "amount" }, { title: "状态", dataIndex: "status" },
        ],
        dataSource: {
          records: [
            { id: "ORD-001", customer: "张三", amount: "¥1,200", status: "已完成" },
            { id: "ORD-002", customer: "李四", amount: "¥890", status: "配送中" },
            { id: "ORD-003", customer: "王五", amount: "¥2,450", status: "已完成" },
            { id: "ORD-004", customer: "赵六", amount: "¥560", status: "待付款" },
            { id: "ORD-005", customer: "孙七", amount: "¥3,100", status: "已完成" },
          ],
        },
      },
    ],
  },
  {
    id: "status-monitor",
    title: "运维雷达 · 服务监控",
    emoji: "🖥",
    description: "状态徽章 + 性能指标 + 面积图 + 时间线",
    category: "数据分析",
    prompt: "做一个系统状态监控面板，展示各服务的运行状态、关键性能指标和最近的事件时间线",
    components: [
      { id: "root", component: "Column", children: ["title", "badges-row", "stats-row", "chart", "timeline"], gap: 20 },
      { id: "title", component: "Text", text: "系统状态监控", variant: "h1" },
      { id: "badges-row", component: "Row", children: ["badge-api", "badge-db", "badge-cache", "badge-queue"], gap: 8 },
      { id: "badge-api", component: "StatusBadge", text: "API 服务", status: "success" },
      { id: "badge-db", component: "StatusBadge", text: "数据库", status: "success" },
      { id: "badge-cache", component: "StatusBadge", text: "缓存服务", status: "warning" },
      { id: "badge-queue", component: "StatusBadge", text: "消息队列", status: "error" },
      { id: "stats-row", component: "Row", children: ["stat-cpu", "stat-mem", "stat-disk", "stat-uptime"], gap: 12 },
      { id: "stat-cpu", component: "Statistic", title: "CPU", value: "67", suffix: "%" },
      { id: "stat-mem", component: "Statistic", title: "内存", value: "82", suffix: "%" },
      { id: "stat-disk", component: "Statistic", title: "磁盘", value: "45", suffix: "%" },
      { id: "stat-uptime", component: "Statistic", title: "运行时间", value: "127", suffix: "天" },
      {
        id: "chart", component: "Chart", title: "过去 6 小时请求量", type: "area",
        data: [
          { time: "12:00", requests: 320 }, { time: "13:00", requests: 450 },
          { time: "14:00", requests: 580 }, { time: "15:00", requests: 490 },
          { time: "16:00", requests: 720 }, { time: "17:00", requests: 650 },
        ],
        xField: "time", yField: "requests", color: "#7c3aed", height: 220,
      },
      {
        id: "timeline", component: "Timeline",
        items: [
          { label: "10:30", content: "API 服务自动扩容完成 — 实例数 4→8" },
          { label: "09:15", content: "缓存服务延迟升高至 200ms，已触发告警" },
          { label: "08:00", content: "每日全量备份完成，耗时 12 分钟" },
          { label: "07:00", content: "SSL 证书自动续期成功" },
        ],
      },
    ],
  },
  {
    id: "weather-dashboard",
    title: "气象站 · 多日天气看板",
    emoji: "🌤",
    description: "温度折线图 + 气象指标 + 预警",
    category: "数据分析",
    prompt: "做一个天气数据面板，展示城市未来一周温度趋势图，附带湿度、风速、能见度等指标",
    components: [
      { id: "root", component: "Column", children: ["title", "stats-row", "chart", "alerts-row"], gap: 20 },
      { id: "title", component: "Text", text: "上海市 7天天气", variant: "h1" },
      { id: "stats-row", component: "Row", children: ["stat-hum", "stat-wind", "stat-vis", "stat-uv"], gap: 12 },
      { id: "stat-hum", component: "Statistic", title: "湿度", value: "78", suffix: "%" },
      { id: "stat-wind", component: "Statistic", title: "风速", value: "12", suffix: "km/h" },
      { id: "stat-vis", component: "Statistic", title: "能见度", value: "8.5", suffix: "km" },
      { id: "stat-uv", component: "Statistic", title: "UV 指数", value: "6", suffix: "级" },
      {
        id: "chart", component: "Chart", title: "温度趋势", type: "line",
        data: [
          { day: "周一", temp: 26 }, { day: "周二", temp: 28 }, { day: "周三", temp: 31 },
          { day: "周四", temp: 33 }, { day: "周五", temp: 29 }, { day: "周六", temp: 25 }, { day: "周日", temp: 24 },
        ],
        xField: "day", yField: "temp", color: "#f59e0b", height: 240,
      },
      { id: "alerts-row", component: "Row", children: ["alert-1", "alert-2"], gap: 8 },
      { id: "alert-1", component: "StatusBadge", text: "高温黄色预警 周三~周四", status: "warning" },
      { id: "alert-2", component: "StatusBadge", text: "强降雨提醒 周六", status: "info" },
    ],
  },

  // ===== 电商 =====
  {
    id: "product-showcase",
    title: "爆品橱窗 · 沉浸式展示",
    emoji: "🛍",
    description: "图片轮播 + 描述 + 快捷购买",
    category: "电商",
    prompt: "做一个高端智能手表产品展示页，包含产品轮播图、产品名称、详细描述、价格和购买按钮",
    components: [
      { id: "root", component: "Column", children: ["carousel", "info-card", "actions"], gap: 20 },
      {
        id: "carousel", component: "Carousel",
        items: [
          { url: PICSUM("watch-1"), caption: "极简设计 · 流畅曲线" },
          { url: PICSUM("watch-2"), caption: "多色可选 · 彰显个性" },
          { url: PICSUM("watch-3"), caption: "精工细作 · 品质之选" },
        ],
        autoplay: true, interval: 3000,
      },
      { id: "info-card", component: "Card", children: ["name", "divider", "desc", "price-row"] },
      { id: "name", component: "Text", text: "A2UI Pro 智能手表", variant: "h1" },
      { id: "divider", component: "Divider" },
      {
        id: "desc", component: "RichText",
        content: `## 产品亮点\n\n- **1.43\" AMOLED 高清屏** — 466×466 分辨率，强光下清晰可见\n- **14 天超长续航** — 日常使用无需频繁充电\n- **100+ 运动模式** — 跑步、游泳、骑行等全场景覆盖\n- **全天候健康监测** — 心率、血氧、睡眠、压力实时追踪`,
      },
      { id: "price-row", component: "Row", children: ["price", "rating"], gap: 24 },
      { id: "price", component: "NumberAnimation", label: "售价", value: 1299, prefix: "¥", duration: 1500 },
      { id: "rating", component: "Rating", label: "用户评分", value: 4.5, max: 5, allowHalf: true },
      {
        id: "actions", component: "QuickActionRow",
        actions: [
          { label: "立即购买", name: "buy_now", primary: true },
          { label: "加入购物车", name: "add_cart" },
          { label: "咨询客服", name: "contact" },
        ],
      },
    ],
  },
  {
    id: "recipe-detail",
    title: "美食工坊 · 图文菜谱",
    emoji: "🍳",
    description: "美食图片 + 步骤 + 评分",
    category: "电商",
    prompt: "做一个菜谱详情页，展示菜品图片轮播、菜名、烹饪时间、难度评级、食材清单和烹饪步骤",
    components: [
      { id: "root", component: "Column", children: ["carousel", "info-card", "ingredients", "actions"], gap: 20 },
      {
        id: "carousel", component: "Carousel",
        items: [
          { url: PICSUM("dish-1", 800, 350), caption: "成品展示" },
          { url: PICSUM("dish-2", 800, 350), caption: "食材准备" },
          { url: PICSUM("dish-3", 800, 350), caption: "烹饪过程" },
        ],
        autoplay: false, interval: 3000,
      },
      { id: "info-card", component: "Card", children: ["name-row", "divider", "desc"] },
      { id: "name-row", component: "Row", children: ["name", "rate"], gap: 16 },
      { id: "name", component: "Text", text: "红烧排骨", variant: "h1" },
      { id: "rate", component: "Rating", label: "难度", value: 3, max: 5 },
      { id: "divider", component: "Divider" },
      {
        id: "desc", component: "RichText",
        content: "红烧排骨是一道经典中式菜肴，色泽红亮，肉质酥烂，酱香浓郁。这道菜的关键在于**炒糖色**和**收汁**的火候把控。\n\n🕐 烹饪时间：45 分钟\n👥 份量：2-3 人份",
      },
      {
        id: "ingredients", component: "CollapsibleSection", title: "食材清单", defaultOpen: true,
        children: ["ingredient-content"],
      },
      {
        id: "ingredient-content", component: "RichText",
        content: "| 食材 | 用量 |\n|------|------|\n| 排骨 | 500g |\n| 生抽 | 2 汤匙 |\n| 老抽 | 1 汤匙 |\n| 料酒 | 1 汤匙 |\n| 冰糖 | 20g |\n| 姜片 | 5 片 |\n| 八角 | 2 个 |\n| 盐 | 适量 |",
      },
      {
        id: "actions", component: "QuickActionRow",
        actions: [
          { label: "收藏菜谱", name: "save_recipe", primary: true },
          { label: "分享好友", name: "share" },
          { label: "加入购物清单", name: "add_shopping" },
        ],
      },
    ],
  },

  // ===== 媒体 =====
  {
    id: "audio-podcast",
    title: "声波电台 · 播客播放间",
    emoji: "🎧",
    description: "音频播放器 + 节目信息 + 操作",
    category: "营销",
    prompt: "做一个播客节目播放页面，包含音频播放器、节目信息、简介和收听操作按钮",
    components: [
      { id: "root", component: "Column", children: ["title", "audio-card", "actions"], gap: 20 },
      { id: "title", component: "Text", text: "最新播客", variant: "h1" },
      {
        id: "audio-card", component: "Card", children: ["episode-title", "episode-desc", "audio-player"],
      },
      { id: "episode-title", component: "Text", text: "EP.42 — AI 驱动的前端开发新范式", variant: "h2" },
      {
        id: "episode-desc", component: "RichText",
        content: "本期我们邀请了 A2UI 核心团队，聊聊**自然语言生成 UI** 背后的技术原理和工程实践。\n\n🎙 主播：张明 | 🕐 时长：42 分钟 | 📅 2024年6月15日",
      },
      {
        id: "audio-player", component: "Audio", title: "播客播放器",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        controls: true,
      },
      {
        id: "actions", component: "QuickActionRow",
        actions: [
          { label: "订阅播客", name: "subscribe_podcast", primary: true },
          { label: "下载音频", name: "download_audio" },
          { label: "分享", name: "share" },
        ],
      },
    ],
  },

  // ===== 营销 =====
  {
    id: "media-landing",
    title: "引力登陆 · SaaS 转化页",
    emoji: "🚀",
    description: "视频 + 特性介绍 + CTA",
    category: "营销",
    prompt: "做一个 SaaS 产品落地页，包含醒目的标题、产品介绍视频、核心特性卡片和行动号召按钮",
    components: [
      { id: "root", component: "Column", children: ["hero", "video", "features", "faq", "cta"], gap: 24 },
      { id: "hero", component: "Card", children: ["hero-title", "hero-sub"] },
      { id: "hero-title", component: "Text", text: "构建下一代 AI 应用", variant: "h1" },
      {
        id: "hero-sub", component: "RichText",
        content: "A2UI Platform 让开发者用**自然语言**生成界面，无需手写布局代码。从仪表盘到落地页，**一句话搞定**。",
      },
      {
        id: "video", component: "Video", title: "产品演示",
        src: "https://res.cloudinary.com/demo/video/upload/vc_h265/dog.mp4",
        poster: PICSUM("video-poster"), controls: true,
      },
      { id: "features", component: "Row", children: ["feat-1", "feat-2", "feat-3"], gap: 12 },
      { id: "feat-1", component: "Statistic", title: "平均响应延迟", value: "10", suffix: "ms" },
      { id: "feat-2", component: "Statistic", title: "服务可用性", value: "99.99", suffix: "%" },
      { id: "feat-3", component: "Statistic", title: "全球边缘节点", value: "30+", suffix: "区域" },
      {
        id: "faq", component: "CollapsibleSection", title: "常见问题", defaultOpen: false, children: ["faq-content"],
      },
      {
        id: "faq-content", component: "RichText",
        content: "**Q: 支持哪些前端框架？**\nA: 支持 React、Vue、Angular 等主流框架。\n\n**Q: 能否对接私有部署的 LLM？**\nA: 支持，只需配置 API 端点即可。",
      },
      {
        id: "cta", component: "QuickActionRow",
        actions: [
          { label: "免费开始使用", name: "get_started", primary: true },
          { label: "预约演示", name: "watch_demo" },
          { label: "查看文档", name: "view_docs" },
        ],
      },
    ],
  },
  {
    id: "subscription-plans",
    title: "方案工坊 · 灵活定价",
    emoji: "💎",
    description: "价格卡片 + 特性对比 + CTA",
    category: "营销",
    prompt: "做一个 SaaS 订阅套餐对比页面，展示免费版、专业版和企业版的价格和功能差异",
    components: [
      { id: "root", component: "Column", children: ["title", "plans-row", "faq", "cta"], gap: 20 },
      { id: "title", component: "Text", text: "选择适合你的方案", variant: "h1" },
      {
        id: "plans-row", component: "Row", children: ["plan-free", "plan-pro", "plan-enterprise"], gap: 16,
      },
      // 免费版
      {
        id: "plan-free", component: "Card", children: ["free-title", "free-price", "free-divider", "free-features", "free-btn"], title: "免费版",
      },
      { id: "free-title", component: "Text", text: "适合个人开发者", variant: "caption" },
      { id: "free-price", component: "NumberAnimation", label: "价格", value: 0, prefix: "¥", suffix: "/月" },
      { id: "free-divider", component: "Divider" },
      {
        id: "free-features", component: "RichText",
        content: "- 5 个项目\n- 基础组件库\n- 社区支持\n- 100 次/月 API 调用",
      },
      { id: "free-btn", component: "Button", child: "free-btn-text", primary: false },
      { id: "free-btn-text", component: "Text", text: "免费试用" },
      // 专业版
      {
        id: "plan-pro", component: "Card", children: ["pro-title", "pro-price", "pro-divider", "pro-features", "pro-btn"], title: "专业版",
      },
      { id: "pro-title", component: "Text", text: "适合小团队", variant: "caption" },
      { id: "pro-price", component: "NumberAnimation", label: "价格", value: 199, prefix: "¥", suffix: "/月" },
      { id: "pro-divider", component: "Divider" },
      {
        id: "pro-features", component: "RichText",
        content: "- 20 个项目\n- 全部组件库\n- 优先邮件支持\n- 1000 次/月 API 调用\n- 自定义主题",
      },
      { id: "pro-btn", component: "Button", child: "pro-btn-text", primary: true },
      { id: "pro-btn-text", component: "Text", text: "立即订阅" },
      // 企业版
      {
        id: "plan-enterprise", component: "Card", children: ["ent-title", "ent-price", "ent-divider", "ent-features", "ent-btn"], title: "企业版",
      },
      { id: "ent-title", component: "Text", text: "适合大型企业", variant: "caption" },
      { id: "ent-price", component: "NumberAnimation", label: "价格", value: 999, prefix: "¥", suffix: "/月" },
      { id: "ent-divider", component: "Divider" },
      {
        id: "ent-features", component: "RichText",
        content: "- 无限制项目\n- 全部组件库\n- 专属客户经理\n- 无限制 API 调用\n- 私有化部署\n- SLA 99.9% 保障",
      },
      { id: "ent-btn", component: "Button", child: "ent-btn-text", primary: true },
      { id: "ent-btn-text", component: "Text", text: "联系我们" },
      // FAQ + CTA
      {
        id: "faq", component: "CollapsibleSection", title: "常见问题", defaultOpen: false, children: ["faq-content"],
      },
      {
        id: "faq-content", component: "RichText",
        content: "**Q: 可以随时切换套餐吗？**\nA: 可以，升级立即生效，降级在下个账单周期生效。\n\n**Q: 是否支持按年付费？**\nA: 支持，年付享 8 折优惠。",
      },
      {
        id: "cta", component: "QuickActionRow",
        actions: [
          { label: "开始免费试用", name: "start_trial", primary: true },
          { label: "预约演示", name: "book_demo" },
        ],
      },
    ],
  },

  // ===== 数据管理 =====
  {
    id: "crud",
    title: "库存中枢 · 数据管家",
    emoji: "🗄",
    description: "搜索栏 + 数据表格 + 操作",
    category: "数据管理",
    prompt: "做一个产品管理页面，包含搜索栏和产品列表表格，表格包含产品名称、分类、价格、库存等列",
    components: [
      { id: "root", component: "Column", children: ["title", "toolbar", "tags", "table"], gap: 16 },
      { id: "title", component: "Text", text: "产品管理", variant: "h2" },
      { id: "toolbar", component: "Row", children: ["search", "add-btn"], gap: 12 },
      { id: "search", component: "SearchBar", placeholder: "搜索产品名称...", action: { name: "search_products" } },
      { id: "add-btn", component: "Button", child: "add-text", action: { name: "create_record" }, primary: true },
      { id: "add-text", component: "Text", text: "新增产品" },
      { id: "tags", component: "Row", children: ["tag-electronics", "tag-clothing", "tag-food"], gap: 8 },
      { id: "tag-electronics", component: "Tag", text: "电子产品", color: "blue" },
      { id: "tag-clothing", component: "Tag", text: "服装", color: "green" },
      { id: "tag-food", component: "Tag", text: "食品", color: "orange" },
      {
        id: "table", component: "Table",
        columns: [
          { title: "产品名称", dataIndex: "name" }, { title: "分类", dataIndex: "category" },
          { title: "价格", dataIndex: "price" }, { title: "库存", dataIndex: "stock" },
          { title: "状态", dataIndex: "status" },
        ],
        dataSource: {
          records: [
            { id: "1", name: "iPhone 15 Pro", category: "电子产品", price: "¥8,999", stock: 156, status: "在售" },
            { id: "2", name: "MacBook Air M3", category: "电子产品", price: "¥10,499", stock: 89, status: "在售" },
            { id: "3", name: "冬季羽绒服", category: "服装", price: "¥699", stock: 320, status: "促销中" },
            { id: "4", name: "有机坚果礼盒", category: "食品", price: "¥128", stock: 500, status: "在售" },
            { id: "5", name: "AirPods Pro", category: "电子产品", price: "¥1,899", stock: 0, status: "缺货" },
          ],
        },
      },
    ],
  },
  {
    id: "invoice-detail",
    title: "票据通 · 发票明细",
    emoji: "🧾",
    description: "公司信息 + 明细表格 + 汇总",
    category: "数据管理",
    prompt: "做一个发票详情页面，展示发票抬头信息、明细列表和金额汇总",
    components: [
      { id: "root", component: "Column", children: ["title", "company-info", "table", "summary-row"], gap: 20 },
      { id: "title", component: "Text", text: "发票详情 INV-2024-0882", variant: "h1" },
      {
        id: "company-info", component: "Card", children: ["company-detail"],
      },
      {
        id: "company-detail", component: "RichText",
        content: "**开票方：** A2UI 科技有限公司\n**税号：** 91110108MA01XXXXX\n**地址：** 北京市海淀区中关村软件园 A 座\n**日期：** 2024-06-15\n**发票类型：** 增值税电子普通发票",
      },
      {
        id: "table", component: "Table",
        columns: [
          { title: "项目", dataIndex: "item" }, { title: "数量", dataIndex: "qty" },
          { title: "单价", dataIndex: "unitPrice" }, { title: "金额", dataIndex: "amount" },
        ],
        dataSource: {
          records: [
            { id: "1", item: "A2UI Pro 许可证（年付）", qty: 2, unitPrice: "¥1,999", amount: "¥3,998" },
            { id: "2", item: "技术支持服务", qty: 1, unitPrice: "¥5,000", amount: "¥5,000" },
            { id: "3", item: "定制开发", qty: 40, unitPrice: "¥500", amount: "¥20,000" },
          ],
        },
      },
      { id: "summary-row", component: "Row", children: ["stat-subtotal", "stat-tax", "stat-total"], gap: 12 },
      { id: "stat-subtotal", component: "Statistic", title: "小计", value: "28,998", prefix: "¥" },
      { id: "stat-tax", component: "Statistic", title: "税额（6%）", value: "1,740", prefix: "¥" },
      { id: "stat-total", component: "NumberAnimation", label: "合计", value: 30738, prefix: "¥", duration: 1200 },
    ],
  },

  // ===== 社交 =====
  {
    id: "user-profile",
    title: "个人名片 · 社交主页",
    emoji: "👤",
    description: "头像 + 个人统计 + 资料卡",
    category: "社交",
    prompt: "做一个用户个人主页，展示用户头像、基本信息、数据统计和可折叠的详细资料区域",
    components: [
      { id: "root", component: "Column", children: ["profile-card", "details"], gap: 16 },
      { id: "profile-card", component: "Card", children: ["avatar-row", "div", "stats-row"] },
      { id: "avatar-row", component: "Row", children: ["avatar", "name-block"], gap: 16 },
      { id: "avatar", component: "Avatar", name: "张三", size: 64 },
      { id: "name-block", component: "Column", children: ["user-name", "user-bio", "user-badge"], gap: 4 },
      { id: "user-name", component: "Text", text: "张三", variant: "h1" },
      { id: "user-bio", component: "Text", text: "全栈工程师 @ A2UI Team", variant: "caption" },
      { id: "user-badge", component: "StatusBadge", text: "核心贡献者", status: "success" },
      { id: "div", component: "Divider" },
      { id: "stats-row", component: "Row", children: ["stat-posts", "stat-followers", "stat-following", "stat-stars"], gap: 12 },
      { id: "stat-posts", component: "Statistic", title: "文章", value: 128 },
      { id: "stat-followers", component: "Statistic", title: "关注者", value: "3,456" },
      { id: "stat-following", component: "Statistic", title: "正在关注", value: 256 },
      { id: "stat-stars", component: "Statistic", title: "获赞", value: "8.9k" },
      {
        id: "details", component: "CollapsibleSection", title: "详细资料", defaultOpen: false, children: ["detail-content"],
      },
      {
        id: "detail-content", component: "RichText",
        content: "- **所在地**：北京\n- **公司**：A2UI Inc.\n- **GitHub**：github.com/zhangsan\n- **技术栈**：React / TypeScript / Node.js / Python\n- **关于我**：热爱前端开发与开源社区，A2UI 框架核心贡献者",
      },
    ],
  },
  {
    id: "team-members",
    title: "团队聚光 · 核心成员",
    emoji: "👥",
    description: "头像卡片 + 角色标签 + 统计",
    category: "社交",
    prompt: "做一个团队介绍页面，展示多名团队成员的头像、姓名、角色和贡献统计",
    components: [
      { id: "root", component: "Column", children: ["title", "team-row-1", "team-row-2", "summary-row"], gap: 20 },
      { id: "title", component: "Text", text: "核心团队", variant: "h1" },
      // Row 1
      { id: "team-row-1", component: "Row", children: ["member-1", "member-2", "member-3"], gap: 16 },
      {
        id: "member-1", component: "Card", children: ["m1-avatar", "m1-name", "m1-badge", "m1-div", "m1-stats"],
      },
      { id: "m1-avatar", component: "Avatar", name: "张明", size: 56, shape: "circle" },
      { id: "m1-name", component: "Text", text: "张明", variant: "h2" },
      { id: "m1-badge", component: "StatusBadge", text: "CEO · 创始人", status: "success" },
      { id: "m1-div", component: "Divider" },
      { id: "m1-stats", component: "Statistic", title: "贡献值", value: "12,450" },
      // member 2
      {
        id: "member-2", component: "Card", children: ["m2-avatar", "m2-name", "m2-badge", "m2-div", "m2-stats"],
      },
      { id: "m2-avatar", component: "Avatar", name: "李芳", size: 56, shape: "circle" },
      { id: "m2-name", component: "Text", text: "李芳", variant: "h2" },
      { id: "m2-badge", component: "StatusBadge", text: "CTO", status: "info" },
      { id: "m2-div", component: "Divider" },
      { id: "m2-stats", component: "Statistic", title: "贡献值", value: "9,820" },
      // member 3
      {
        id: "member-3", component: "Card", children: ["m3-avatar", "m3-name", "m3-badge", "m3-div", "m3-stats"],
      },
      { id: "m3-avatar", component: "Avatar", name: "王磊", size: 56, shape: "circle" },
      { id: "m3-name", component: "Text", text: "王磊", variant: "h2" },
      { id: "m3-badge", component: "StatusBadge", text: "首席设计师", status: "warning" },
      { id: "m3-div", component: "Divider" },
      { id: "m3-stats", component: "Statistic", title: "贡献值", value: "8,320" },
      // Row 2
      { id: "team-row-2", component: "Row", children: ["member-4", "member-5"], gap: 16 },
      {
        id: "member-4", component: "Card", children: ["m4-avatar", "m4-name", "m4-badge", "m4-div", "m4-stats"],
      },
      { id: "m4-avatar", component: "Avatar", name: "陈静", size: 56, shape: "circle" },
      { id: "m4-name", component: "Text", text: "陈静", variant: "h2" },
      { id: "m4-badge", component: "StatusBadge", text: "后端架构师", status: "info" },
      { id: "m4-div", component: "Divider" },
      { id: "m4-stats", component: "Statistic", title: "贡献值", value: "7,650" },
      {
        id: "member-5", component: "Card", children: ["m5-avatar", "m5-name", "m5-badge", "m5-div", "m5-stats"],
      },
      { id: "m5-avatar", component: "Avatar", name: "刘洋", size: 56, shape: "circle" },
      { id: "m5-name", component: "Text", text: "刘洋", variant: "h2" },
      { id: "m5-badge", component: "StatusBadge", text: "前端工程师", status: "info" },
      { id: "m5-div", component: "Divider" },
      { id: "m5-stats", component: "Statistic", title: "贡献值", value: "6,100" },
      // 汇总
      { id: "summary-row", component: "Row", children: ["stat-members", "stat-code", "stat-commits"], gap: 12 },
      { id: "stat-members", component: "Statistic", title: "团队成员", value: "5" },
      { id: "stat-code", component: "Statistic", title: "代码行数", value: "128k" },
      { id: "stat-commits", component: "Statistic", title: "总提交", value: "3,420" },
    ],
  },

  // ===== 表单 =====
  {
    id: "register-form",
    title: "极速入驻 · 新用户注册",
    emoji: "📝",
    description: "完整用户注册 + 协议",
    category: "表单",
    prompt: "做一个用户注册表单，包含用户名、邮箱、密码、确认密码字段和注册按钮",
    components: [
      { id: "root", component: "Form", children: ["title", "username", "email", "password", "confirm", "agree", "register-btn"], title: "创建账号" },
      { id: "title", component: "RichText", content: "欢迎加入 A2UI 社区！填写下方信息创建你的账号。", variant: "hint" },
      { id: "username", component: "TextField", label: "用户名", inputType: "text", placeholder: "请输入用户名", validation: { required: true } },
      { id: "email", component: "TextField", label: "邮箱", inputType: "email", placeholder: "请输入邮箱地址", validation: { required: true } },
      { id: "password", component: "TextField", label: "密码", inputType: "password", placeholder: "至少 8 位，含字母和数字", validation: { required: true, min: 8 } },
      { id: "confirm", component: "TextField", label: "确认密码", inputType: "password", placeholder: "再次输入密码", validation: { required: true } },
      { id: "agree", component: "CheckBox", label: "我已阅读并同意《用户协议》和《隐私政策》" },
      { id: "register-btn", component: "Button", child: "btn-text", action: { name: "register" }, primary: true },
      { id: "btn-text", component: "Text", text: "立即注册" },
    ],
  },
  {
    id: "survey-form",
    title: "心声采集 · 满意度调研",
    emoji: "📋",
    description: "评分 + 选择 + 开放题 + 提交",
    category: "表单",
    prompt: "做一个满意度调查问卷，包含整体评分、推荐可能性、喜欢的功能选择和改进建议输入",
    components: [
      { id: "root", component: "Form", children: ["title", "q1", "q2", "q3", "q4", "submit-btn"], title: "产品满意度调查" },
      { id: "title", component: "RichText", content: "感谢使用我们的产品！请花 2 分钟分享您的使用体验。", variant: "hint" },
      { id: "q1", component: "Rating", label: "1. 整体满意度", value: 0, max: 5, allowHalf: true },
      { id: "q2", component: "Slider", label: "2. 推荐可能性（0-10）", min: 0, max: 10 },
      { id: "q3", component: "ChoicePicker", label: "3. 您最喜欢的功能", options: ["A2UI 组件", "AI 对话生成", "模板库", "组件动画", "数据图表"] },
      { id: "q4", component: "TextField", label: "4. 改进建议", inputType: "text", placeholder: "请分享您的建议..." },
      { id: "submit-btn", component: "Button", child: "btn-text", action: { name: "submit_survey" }, primary: true },
      { id: "btn-text", component: "Text", text: "提交问卷" },
    ],
  },

  // ===== 项目管理 =====
  {
    id: "project-kanban",
    title: "任务航线 · 看板视图",
    emoji: "📌",
    description: "任务列 + 状态卡片 + 优先级标签",
    category: "项目管理",
    prompt: "做一个项目看板，展示待办、进行中、已完成三列任务卡片，每个卡片标注优先级",
    components: [
      { id: "root", component: "Column", children: ["title", "board"], gap: 20 },
      { id: "title", component: "Text", text: "项目看板 · A2UI v2.0", variant: "h1" },
      { id: "board", component: "Row", children: ["col-todo", "col-progress", "col-done"], gap: 16 },
      // 待办列
      { id: "col-todo", component: "Card", children: ["todo-header", "todo-1", "todo-2"], title: "待办" },
      { id: "todo-header", component: "StatusBadge", text: "2 个任务", status: "warning" },
      {
        id: "todo-1", component: "Card", children: ["t1-tag", "t1-text"], title: "用户登录页面",
      },
      { id: "t1-tag", component: "Tag", text: "高优先级", color: "red" },
      { id: "t1-text", component: "Text", text: "实现 OAuth 2.0 登录流程", variant: "caption" },
      {
        id: "todo-2", component: "Card", children: ["t2-tag", "t2-text"], title: "数据导出功能",
      },
      { id: "t2-tag", component: "Tag", text: "中优先级", color: "orange" },
      { id: "t2-text", component: "Text", text: "支持 CSV 和 Excel 格式导出", variant: "caption" },
      // 进行中列
      { id: "col-progress", component: "Card", children: ["prog-header", "prog-1"], title: "进行中" },
      { id: "prog-header", component: "StatusBadge", text: "1 个任务", status: "info" },
      {
        id: "prog-1", component: "Card", children: ["p1-tag", "p1-text"], title: "API 性能优化",
      },
      { id: "p1-tag", component: "Tag", text: "高优先级", color: "red" },
      { id: "p1-text", component: "Text", text: "优化数据库查询，目标 50ms 内", variant: "caption" },
      // 已完成列
      { id: "col-done", component: "Card", children: ["done-header", "done-1", "done-2"], title: "已完成" },
      { id: "done-header", component: "StatusBadge", text: "2 个任务", status: "success" },
      {
        id: "done-1", component: "Card", children: ["d1-tag", "d1-text"], title: "首页重设计",
      },
      { id: "d1-tag", component: "Tag", text: "已完成", color: "green" },
      { id: "d1-text", component: "Text", text: "新版首页已上线，用户反馈良好", variant: "caption" },
      {
        id: "done-2", component: "Card", children: ["d2-tag", "d2-text"], title: "暗色模式",
      },
      { id: "d2-tag", component: "Tag", text: "已完成", color: "green" },
      { id: "d2-text", component: "Text", text: "支持系统级和手动切换暗色模式", variant: "caption" },
    ],
  },
  {
    id: "event-schedule",
    title: "大会议程 · 活动时间线",
    emoji: "📅",
    description: "时间线 + 会场卡片 + 快捷操作",
    category: "项目管理",
    prompt: "做一个技术大会活动日程页面，以时间线形式展示各时段的活动安排",
    components: [
      { id: "root", component: "Column", children: ["title", "event-card", "timeline", "actions"], gap: 20 },
      { id: "title", component: "Text", text: "A2UI 开发者大会 2024", variant: "h1" },
      {
        id: "event-card", component: "Card", children: ["event-info"],
      },
      {
        id: "event-info", component: "RichText",
        content: "📅 **2024 年 8 月 18 日（周日）**\n📍 上海世博中心 · 3 楼宴会厅\n🎯 主题：AI 驱动的前端开发新范式",
      },
      {
        id: "timeline", component: "Timeline",
        items: [
          { label: "09:00", content: "签到入场 & 早餐交流" },
          { label: "10:00", content: "主题演讲：A2UI 的过去与未来 — 张明（CEO）" },
          { label: "11:30", content: "工作坊：用自然语言生成复杂仪表盘 — 李芳（CTO）" },
          { label: "12:30", content: "午餐 & 产品体验区开放" },
          { label: "14:00", content: "圆桌讨论：AI 与前端工程的融合之路" },
          { label: "16:00", content: "闪电演讲 × 5 个团队分享" },
          { label: "17:30", content: "抽奖 & 闭幕致辞" },
        ],
      },
      {
        id: "actions", component: "QuickActionRow",
        actions: [
          { label: "立即报名", name: "register", primary: true },
          { label: "加入日程", name: "add_calendar" },
          { label: "分享好友", name: "share" },
        ],
      },
    ],
  },

  // ===== 金融 =====
  {
    id: "finance-overview",
    title: "财务罗盘 · 月度经营",
    emoji: "💰",
    description: "收入支出图表 + 指标卡片 + 交易列表",
    category: "金融",
    prompt: "做一个财务概览页面，展示本月收支对比、关键财务指标和最近交易记录",
    components: [
      { id: "root", component: "Column", children: ["title", "stats-row", "chart", "divider", "section-title", "table"], gap: 20 },
      { id: "title", component: "Text", text: "财务概览 · 2024年6月", variant: "h1" },
      { id: "stats-row", component: "Row", children: ["stat-income", "stat-expense", "stat-balance", "stat-growth"], gap: 12 },
      { id: "stat-income", component: "Statistic", title: "本月收入", value: "¥156,200", trend: "up" },
      { id: "stat-expense", component: "Statistic", title: "本月支出", value: "¥87,400", trend: "down" },
      { id: "stat-balance", component: "Statistic", title: "账户余额", value: "¥468,500" },
      { id: "stat-growth", component: "Statistic", title: "同比增长", value: "23.5", suffix: "%", trend: "up" },
      {
        id: "chart", component: "Chart", title: "月度收支趋势", type: "area",
        data: [
          { month: "1月", income: 120000, expense: 90000 },
          { month: "2月", income: 135000, expense: 95000 },
          { month: "3月", income: 142000, expense: 88000 },
          { month: "4月", income: 148000, expense: 92000 },
          { month: "5月", income: 152000, expense: 85000 },
          { month: "6月", income: 156200, expense: 87400 },
        ],
        xField: "month", yField: "income", color: "#3b82f6", height: 240,
      },
      { id: "divider", component: "Divider" },
      { id: "section-title", component: "Text", text: "最近交易", variant: "h2" },
      {
        id: "table", component: "Table",
        columns: [
          { title: "日期", dataIndex: "date" }, { title: "描述", dataIndex: "desc" },
          { title: "分类", dataIndex: "category" }, { title: "金额", dataIndex: "amount" },
        ],
        dataSource: {
          records: [
            { id: "1", date: "06-15", desc: "A2UI 年度订阅收入", category: "收入", amount: "¥42,000" },
            { id: "2", date: "06-14", desc: "云服务月度费用", category: "支出", amount: "-¥8,500" },
            { id: "3", date: "06-12", desc: "企业版许可费", category: "收入", amount: "¥28,000" },
            { id: "4", date: "06-10", desc: "员工差旅报销", category: "支出", amount: "-¥3,200" },
            { id: "5", date: "06-08", desc: "技术支持合同", category: "收入", amount: "¥15,000" },
          ],
        },
      },
    ],
  },
];
