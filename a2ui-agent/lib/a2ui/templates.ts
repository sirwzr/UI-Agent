import type { A2UIComponent } from "./render-surface";

export interface TemplateDef {
  id: string;
  title: string;
  emoji: string;
  description: string;
  prompt: string;
  category: string;
  styleHint: string;
  components: A2UIComponent[];
}

const PICSUM = (seed: string, w = 800, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const TEMPLATES: TemplateDef[] = [
  // ===== 数据分析 =====
  {
    id: "analytics-dashboard",
    title: "数据仪表盘",
    emoji: "📊",
    description: "指标卡片 + 趋势图 + 数据表格",
    category: "数据分析",
    prompt:
      "用户选择了数据仪表盘模板。你需要：\n1. 先用 QuickActionRow 询问仪表盘类型，提供选项：销售数据、系统监控、财务概览、用户分析、自定义\n2. 用户选择后，追问风格偏好，提供选项：深色专业风、浅色企业风、极简浅色风\n3. 用户确认后，构造搜索 query：\"{类型} {业务} dashboard metrics\"（中英混合，如\"销售数据 dashboard metrics\"）\n4. 调用 web_search → 反馈状态 → 渲染。搜索 query 必须 ≥3 个词，不能直接把用户原话当 query。",
    styleHint: "浅色企业风，蓝色主调，卡片式布局",
    components: [
      { id: "root", component: "Column", children: ["title", "stats-row", "chart", "table"], gap: 20 },
      { id: "title", component: "Text", text: "数据仪表盘", variant: "h1" },
      { id: "stats-row", component: "Row", children: ["stat-1", "stat-2", "stat-3", "stat-4"], gap: 12 },
      { id: "stat-1", component: "Statistic", title: "指标一", value: 1234 },
      { id: "stat-2", component: "Statistic", title: "指标二", value: 89200 },
      { id: "stat-3", component: "Statistic", title: "指标三", value: 5678 },
      { id: "stat-4", component: "Statistic", title: "指标四", value: 12.5, suffix: "%" },
      {
        id: "chart", component: "Chart", title: "趋势图", type: "bar",
        data: [
          { month: "1月", value: 42000 }, { month: "2月", value: 38000 }, { month: "3月", value: 51000 },
          { month: "4月", value: 47000 }, { month: "5月", value: 55000 }, { month: "6月", value: 62000 },
          { month: "7月", value: 58000 }, { month: "8月", value: 65000 },
        ],
        xField: "month", yField: "value", color: "#3b82f6", height: 280,
      },
      {
        id: "table", component: "Table",
        columns: [{ title: "名称", dataIndex: "name" }, { title: "数值", dataIndex: "value" }, { title: "状态", dataIndex: "status" }],
        dataSource: { records: [
          { id: "1", name: "移动端应用", value: "¥42,000", status: "正常" },
          { id: "2", name: "网页端", value: "¥38,500", status: "正常" },
          { id: "3", name: "API 服务", value: "¥29,800", status: "正常" },
          { id: "4", name: "数据分析平台", value: "¥15,200", status: "维护中" },
          { id: "5", name: "小程序", value: "¥22,100", status: "正常" },
          { id: "6", name: "后台管理", value: "¥8,900", status: "正常" },
        ]},
      },
    ],
  },
  {
    id: "weather-dashboard",
    title: "天气看板",
    emoji: "🌤",
    description: "实时天气 + 温度趋势 + 逐小时预报",
    category: "数据分析",
    prompt:
      "用户选择了天气看板模板。你需要：\n1. 先调用 get_user_location 获取用户位置。如果成功，用该城市；如果失败，用 QuickActionRow 询问城市，提供选项：北京、上海、广州、深圳、其他\n2. 追问关注哪些气象指标，提供选项：温度+湿度、风速+气压、紫外线+空气质量、全部指标\n3. 确认城市和指标后，调用 get_weather（不是 web_search！天气数据来自 get_weather tool）\n4. 根据天气数据生成面板。不需要 web_search，用 get_weather 返回的真实数据填充。",
    styleHint: "浅色清新风，橙蓝渐变，卡片式气象指标",
    components: [
      { id: "root", component: "Column", children: ["title", "stats-row", "chart", "timeline"], gap: 20 },
      { id: "title", component: "Text", text: "天气看板", variant: "h1" },
      { id: "stats-row", component: "Row", children: ["stat-temp", "stat-hum", "stat-wind", "stat-uv"], gap: 12 },
      { id: "stat-temp", component: "Statistic", title: "温度", value: "26°C" },
      { id: "stat-hum", component: "Statistic", title: "湿度", value: "65%" },
      { id: "stat-wind", component: "Statistic", title: "风速", value: "12 km/h" },
      { id: "stat-uv", component: "Statistic", title: "紫外线", value: "5 级" },
      {
        id: "chart", component: "Chart", title: "温度趋势", type: "line",
        data: [
          { day: "今天", temp: 26 }, { day: "明天", temp: 28 }, { day: "后天", temp: 24 },
          { day: "第4天", temp: 29 }, { day: "第5天", temp: 31 }, { day: "第6天", temp: 27 },
          { day: "第7天", temp: 25 }, { day: "第8天", temp: 30 },
        ],
        xField: "day", yField: "temp", color: "#f59e0b", height: 240,
      },
      {
        id: "timeline", component: "Timeline",
        items: [
          { label: "08:00", content: "晴天，18°C，适合晨练" },
          { label: "14:00", content: "多云，28°C，注意防晒" },
          { label: "20:00", content: "微风，22°C，适合散步" },
        ],
      },
    ],
  },
  {
    id: "realtime-dashboard",
    title: "监控大屏",
    emoji: "📡",
    description: "深色主题 + 实时指标 + 进度条 + 告警时间线",
    category: "数据分析",
    prompt:
      "用户选择了实时监控大屏模板。你需要：\n1. 先用 QuickActionRow 询问监控对象类型，提供选项：服务器集群、API 网关、数据库、CDN 节点、自定义\n2. 追问关键指标偏好，提供选项：QPS+延迟、CPU+内存、错误率+可用性、全部指标\n3. 用户确认后，构造搜索 query：\"{监控对象} monitoring dashboard real-time\"（中英混合）\n4. 调用 web_search → 反馈状态 → 生成深色主题监控面板。搜索 query 必须 ≥3 个词。",
    styleHint: "深色大屏风，青蓝强调色，数字滚动动画",
    components: [
      { id: "root", component: "Column", children: ["title", "global-stats", "main-row", "alerts"], gap: 20 },
      { id: "title", component: "Text", text: "实时监控中心", variant: "h1" },
      { id: "global-stats", component: "Row", children: ["stat-a", "stat-b", "stat-c", "stat-d"], gap: 12 },
      { id: "stat-a", component: "NumberAnimation", label: "在线用户", value: 12847, duration: 2000 },
      { id: "stat-b", component: "Statistic", title: "请求量", value: "3842/s", trend: "up" },
      { id: "stat-c", component: "Statistic", title: "响应时间", value: "45ms", trend: "down" },
      { id: "stat-d", component: "StatusBadge", text: "系统健康度 99.7%", status: "success" },
      { id: "main-row", component: "Row", children: ["chart-col", "progress-col"], gap: 16 },
      {
        id: "chart-col", component: "Column", children: ["chart-title", "main-chart"], gap: 12,
      },
      { id: "chart-title", component: "Text", text: "请求趋势", variant: "h2" },
      {
        id: "main-chart", component: "Chart", title: "过去 24 小时", type: "area",
        data: [
          { time: "00:00", qps: 120 }, { time: "03:00", qps: 95 }, { time: "06:00", qps: 180 },
          { time: "09:00", qps: 420 }, { time: "12:00", qps: 580 }, { time: "15:00", qps: 650 },
          { time: "18:00", qps: 720 }, { time: "21:00", qps: 340 },
        ],
        xField: "time", yField: "qps", color: "#06b6d4", height: 280,
      },
      {
        id: "progress-col", component: "Column", children: ["prog-title", "prog-1", "prog-2", "prog-3"], gap: 12,
      },
      { id: "prog-title", component: "Text", text: "服务负载", variant: "h2" },
      { id: "prog-1", component: "Progress", percent: 78, status: "normal", showInfo: true },
      { id: "prog-2", component: "Progress", percent: 92, status: "active", showInfo: true },
      { id: "prog-3", component: "Progress", percent: 45, status: "normal", showInfo: true },
      {
        id: "alerts", component: "Timeline",
        items: [
          { label: "14:32", content: "服务自动扩容完成" },
          { label: "13:15", content: "连接池使用率达 85%" },
          { label: "09:45", content: "安全扫描完成，无风险" },
        ],
      },
    ],
  },

  // ===== 电商与内容 =====
  {
    id: "product-showcase",
    title: "产品展示页",
    emoji: "🛍",
    description: "图片轮播 + 产品描述 + 购买按钮",
    category: "电商与内容",
    prompt:
      "用户选择了产品展示页模板。你需要：\n1. 先用 QuickActionRow 询问产品类型，提供选项：数码电子、服装时尚、美妆护肤、食品饮料、运动户外、其他\n2. 追问视觉风格偏好，提供选项：极简白色风、深色科技风、温暖暖色风、渐变潮流风\n3. 用户确认后，构造搜索 query：\"{产品类型} 产品展示 product photography\"（中英混合，如\"数码电子 产品展示 electronics product photography\"）\n4. 调用 web_search → 反馈状态 → 渲染。图片必须 ≥3 张用于 Carousel，文本用于产品描述 RichText（≥150 字）。",
    styleHint: "极简白色背景，大图轮播突出",
    components: [
      { id: "root", component: "Column", children: ["carousel", "info-card", "actions"], gap: 20 },
      {
        id: "carousel", component: "Carousel",
        items: [
          { url: PICSUM("product-1"), caption: "产品展示图一" },
          { url: PICSUM("product-2"), caption: "产品展示图二" },
          { url: PICSUM("product-3"), caption: "产品展示图三" },
        ],
        autoplay: true, interval: 3000,
      },
      { id: "info-card", component: "Card", children: ["name", "divider", "desc", "price-row"] },
      { id: "name", component: "Text", text: "产品名称", variant: "h1" },
      { id: "divider", component: "Divider" },
      { id: "desc", component: "RichText", content: "本产品采用先进工艺制造，通过 ISO 9001 质量认证。\\n\\n### 核心特性\\n- 高性能处理器，0.1 秒极速响应\\n- 5000mAh 大容量电池，满足全天使用\\n- IP68 防尘防水，无惧恶劣环境\\n- 支持 iOS、Android、Windows 全平台\\n\\n### 用户口碑\\n全球超过 50 万用户选择，好评率 96%，复购率行业领先。" },
      { id: "price-row", component: "Row", children: ["price", "rating"], gap: 24 },
      { id: "price", component: "NumberAnimation", label: "价格", value: 299, prefix: "¥", duration: 1500 },
      { id: "rating", component: "Rating", label: "评分", value: 4.5, max: 5, allowHalf: true },
      {
        id: "actions", component: "QuickActionRow",
        actions: [
          { label: "立即购买", name: "buy_now", primary: true },
          { label: "加入收藏", name: "add_cart" },
        ],
      },
    ],
  },
  {
    id: "recipe-detail",
    title: "图文内容页",
    emoji: "📰",
    description: "头图 + 富文本 + 信息卡片 + 操作按钮",
    category: "电商与内容",
    prompt:
      "用户选择了图文内容页模板。你需要：\n1. 先用 QuickActionRow 询问内容类型，提供选项：菜谱教程、旅行攻略、产品评测、技术文章、新闻资讯、其他\n2. 追问色调偏好，提供选项：温暖暖色、清新冷色、黑白极简、活力彩色\n3. 用户确认后，构造搜索 query：\"{内容主题} 图文 content article\"（中英混合，如\"川菜教程 图文 food recipe\"）\n4. 调用 web_search → 反馈状态 → 渲染。RichText 必须 ≥150 字，Carousel 至少 2 张图。",
    styleHint: "温暖暖色调，卡片式布局，图片突出",
    components: [
      { id: "root", component: "Column", children: ["carousel", "info-card", "details", "actions"], gap: 20 },
      {
        id: "carousel", component: "Carousel",
        items: [
          { url: PICSUM("content-1", 800, 350), caption: "封面图" },
          { url: PICSUM("content-2", 800, 350), caption: "细节图" },
        ],
        autoplay: false,
      },
      { id: "info-card", component: "Card", children: ["title-row", "divider", "desc"] },
      { id: "title-row", component: "Row", children: ["name", "rating"], gap: 16 },
      { id: "name", component: "Text", text: "内容标题", variant: "h1" },
      { id: "rating", component: "Rating", label: "评分", value: 4, max: 5 },
      { id: "divider", component: "Divider" },
      { id: "desc", component: "RichText", content: "本文详细介绍了主题的核心要点和背景信息。\\n\\n### 背景概述\\n在当今快速发展的行业中，了解最新趋势和最佳实践至关重要。本文从多角度分析了关键议题。\\n\\n### 核心观点\\n- 技术创新持续推动行业变革\\n- 用户体验成为产品竞争力的核心\\n- 数据驱动决策已从趋势变为标配\\n\\n### 总结与展望\\n未来 3-5 年，行业将继续向智能化和个性化方向发展，值得持续关注。" },
      {
        id: "details", component: "CollapsibleSection", title: "详细信息", defaultOpen: true,
        children: ["detail-content"],
      },
      {
        id: "detail-content", component: "RichText",
        content: "| 项目 | 详情 |\\n|------|------|\\n| 发布日期 | 2026-05-29 |\\n| 作者 | 行业研究团队 |\\n| 分类 | 技术趋势分析 |\\n| 阅读时长 | 约 8 分钟 |\\n| 标签 | 创新、数字化、用户体验 |\\n| 相关领域 | AI、云计算、物联网 |",
      },
      {
        id: "actions", component: "QuickActionRow",
        actions: [
          { label: "收藏", name: "save_recipe", primary: true },
          { label: "分享", name: "share" },
        ],
      },
    ],
  },

  // ===== 表单 =====
  {
    id: "register-form",
    title: "用户注册表单",
    emoji: "📝",
    description: "完整表单 + 输入验证 + 协议确认",
    category: "表单",
    prompt:
      "用户选择了注册表单模板。你需要：\n1. 先用 QuickActionRow 询问表单用途，提供选项：用户注册、活动报名、信息登记、订阅 newsletter、其他\n2. 追问布局偏好，提供选项：居中卡片式、全宽式、分步式（多步骤）\n3. 根据用途确定需要的字段（注册用：用户名+邮箱+密码+确认密码；报名用：姓名+手机+公司+备注）\n4. 简单表单无需搜索，直接生成。不要编造公司名或默认值。",
    styleHint: "浅色表单风，居中白色卡片，品牌蓝按钮",
    components: [
      { id: "root", component: "Form", children: ["title", "username", "email", "password", "confirm", "agree", "register-btn"], title: "创建账号" },
      { id: "title", component: "RichText", content: "填写以下信息创建你的账号。" },
      { id: "username", component: "TextField", label: "用户名", inputType: "text", placeholder: "请输入用户名", validation: { required: true } },
      { id: "email", component: "TextField", label: "邮箱", inputType: "email", placeholder: "请输入邮箱", validation: { required: true } },
      { id: "password", component: "TextField", label: "密码", inputType: "password", placeholder: "至少 8 位", validation: { required: true, min: 8 } },
      { id: "confirm", component: "TextField", label: "确认密码", inputType: "password", placeholder: "再次输入密码", validation: { required: true } },
      { id: "agree", component: "CheckBox", label: "我已阅读并同意用户协议和隐私政策" },
      { id: "register-btn", component: "Button", child: "btn-text", action: { name: "register" }, primary: true },
      { id: "btn-text", component: "Text", text: "立即注册" },
    ],
  },
  {
    id: "survey-form",
    title: "调查问卷",
    emoji: "📋",
    description: "评分 + 选择题 + 开放题 + 提交",
    category: "表单",
    prompt:
      "用户选择了调查问卷模板。你需要：\n1. 先用 QuickActionRow 询问调查主题，提供选项：产品满意度、服务评价、员工反馈、市场调研、活动反馈、其他\n2. 追问需要的问题类型组合，提供选项：评分+选择+填空（完整）、仅评分+选择（快速）、仅选择（极简）\n3. 确认后直接生成问卷。简单表单无需搜索，用用户确认的主题定制问题和选项文字。",
    styleHint: "浅色问卷风，星评分突出，温暖引导语",
    components: [
      { id: "root", component: "Form", children: ["title", "q1", "q2", "q3", "q4", "submit-btn"], title: "问卷调查" },
      { id: "title", component: "RichText", content: "感谢参与！请花几分钟分享你的反馈。" },
      { id: "q1", component: "Rating", label: "整体满意度", value: 0, max: 5, allowHalf: true },
      { id: "q2", component: "Slider", label: "推荐可能性（0-10）", min: 0, max: 10 },
      { id: "q3", component: "ChoicePicker", label: "最喜欢的功能", options: ["功能 A", "功能 B", "功能 C", "功能 D"] },
      { id: "q4", component: "TextField", label: "改进建议", inputType: "text", placeholder: "请分享你的建议..." },
      { id: "submit-btn", component: "Button", child: "btn-text", action: { name: "submit_survey" }, primary: true },
      { id: "btn-text", component: "Text", text: "提交问卷" },
    ],
  },

  // ===== 数据管理 =====
  {
    id: "crud",
    title: "数据管理后台",
    emoji: "🗄",
    description: "搜索栏 + 数据表格 + 标签筛选 + 操作",
    category: "数据管理",
    prompt:
      "用户选择了数据管理后台模板。你需要：\n1. 先用 QuickActionRow 询问数据类型，提供选项：产品/商品、用户/客户、订单/交易、内容/文章、项目/任务、其他\n2. 追问视图偏好，提供选项：表格视图、卡片视图、列表视图\n3. 用户确认后，构造搜索 query：\"{数据类型} 管理后台 data management\"（中英混合）\n4. 调用 web_search → 反馈状态 → 渲染。Table 必须 ≥6 行，每行数据真实感强。",
    styleHint: "浅色管理风，紧凑表格布局，标签筛选",
    components: [
      { id: "root", component: "Column", children: ["title", "toolbar", "tags", "table"], gap: 16 },
      { id: "title", component: "Text", text: "数据管理", variant: "h2" },
      { id: "toolbar", component: "Row", children: ["search", "add-btn"], gap: 12 },
      { id: "search", component: "SearchBar", placeholder: "搜索...", action: { name: "search_products" } },
      { id: "add-btn", component: "Button", child: "add-text", action: { name: "create_record" }, primary: true },
      { id: "add-text", component: "Text", text: "新增" },
      { id: "tags", component: "Row", children: ["tag-a", "tag-b", "tag-c"], gap: 8 },
      { id: "tag-a", component: "Tag", text: "分类 A", color: "blue" },
      { id: "tag-b", component: "Tag", text: "分类 B", color: "green" },
      { id: "tag-c", component: "Tag", text: "分类 C", color: "orange" },
      {
        id: "table", component: "Table",
        columns: [
          { title: "名称", dataIndex: "name" }, { title: "分类", dataIndex: "category" },
          { title: "数值", dataIndex: "value" }, { title: "状态", dataIndex: "status" },
        ],
        dataSource: {
          records: [
            { id: "1", name: "移动端应用", category: "分类 A", value: "¥6,999", status: "正常" },
            { id: "2", name: "网页端重构", category: "分类 B", value: "¥8,999", status: "正常" },
            { id: "3", name: "API 网关升级", category: "分类 A", value: "¥699", status: "促销" },
            { id: "4", name: "数据中台", category: "分类 C", value: "¥128", status: "正常" },
            { id: "5", name: "用户中心", category: "分类 B", value: "¥3,200", status: "正常" },
            { id: "6", name: "监控告警平台", category: "分类 A", value: "¥5,500", status: "维护中" },
          ],
        },
      },
    ],
  },
  {
    id: "finance-overview",
    title: "财务概览",
    emoji: "💰",
    description: "收支图表 + 指标卡片 + 交易列表",
    category: "数据管理",
    prompt:
      "用户选择了财务概览面板模板。你需要：\n1. 先用 QuickActionRow 询问财务场景，提供选项：个人理财、企业财报、项目预算、投资组合、其他\n2. 追问时间范围，提供选项：本月、本季度、近半年、全年\n3. 追问风格偏好，提供选项：浅色金融风、深色专业风、极简数据风\n4. 用户确认后，构造搜索 query：\"{场景} 财务数据 financial overview\"（中英混合）。调用 web_search → 反馈状态 → 渲染。不要编造公司名和具体金额数字。",
    styleHint: "浅色金融风，绿色增长指标，专业严谨",
    components: [
      { id: "root", component: "Column", children: ["title", "stats-row", "chart", "divider", "section-title", "table"], gap: 20 },
      { id: "title", component: "Text", text: "财务概览", variant: "h1" },
      { id: "stats-row", component: "Row", children: ["stat-income", "stat-expense", "stat-balance", "stat-growth"], gap: 12 },
      { id: "stat-income", component: "Statistic", title: "收入", value: "¥156,200", trend: "up" },
      { id: "stat-expense", component: "Statistic", title: "支出", value: "¥87,400", trend: "down" },
      { id: "stat-balance", component: "Statistic", title: "余额", value: "¥468,500" },
      { id: "stat-growth", component: "Statistic", title: "增长率", value: "23.5", suffix: "%", trend: "up" },
      {
        id: "chart", component: "Chart", title: "月度趋势", type: "area",
        data: [
          { month: "1月", income: 120000, expense: 90000 }, { month: "2月", income: 135000, expense: 95000 },
          { month: "3月", income: 142000, expense: 88000 }, { month: "4月", income: 128000, expense: 92000 },
          { month: "5月", income: 156000, expense: 87000 }, { month: "6月", income: 148000, expense: 91000 },
          { month: "7月", income: 162000, expense: 85000 }, { month: "8月", income: 175000, expense: 82000 },
        ],
        xField: "month", yField: "income", color: "#3b82f6", height: 240,
      },
      { id: "divider", component: "Divider" },
      { id: "section-title", component: "Text", text: "最近记录", variant: "h2" },
      {
        id: "table", component: "Table",
        columns: [
          { title: "日期", dataIndex: "date" }, { title: "描述", dataIndex: "desc" },
          { title: "分类", dataIndex: "category" }, { title: "金额", dataIndex: "amount" },
        ],
        dataSource: {
          records: [
            { id: "1", date: "06-15", desc: "订阅收入", category: "收入", amount: "¥42,000" },
            { id: "2", date: "06-14", desc: "云服务费用", category: "支出", amount: "-¥8,500" },
            { id: "3", date: "06-12", desc: "许可费", category: "收入", amount: "¥28,000" },
            { id: "4", date: "06-10", desc: "员工薪资", category: "支出", amount: "-¥35,000" },
            { id: "5", date: "06-08", desc: "咨询服务", category: "收入", amount: "¥15,000" },
            { id: "6", date: "06-05", desc: "市场推广", category: "支出", amount: "-¥12,000" },
          ],
        },
      },
    ],
  },

  // ===== 营销 =====
  {
    id: "media-landing",
    title: "产品落地页",
    emoji: "🚀",
    description: "Hero 区 + 特性介绍 + CTA 按钮",
    category: "营销",
    prompt:
      "用户选择了产品落地页模板。你需要：\n1. 先用 QuickActionRow 询问产品/服务类型，提供选项：SaaS 工具、电商产品、咨询服务、教育培训、App 下载、其他\n2. 追问核心卖点方向（选 1-2 个），提供选项：高性能、低成本、易上手、安全可靠、团队协作\n3. 追问视觉风格，提供选项：现代企业风+渐变 Hero、极简白色风、深色科技风\n4. 用户确认后，构造搜索 query：\"{产品类型} landing page hero {卖点关键词}\"（中英混合，如\"SaaS 工具 landing page hero performance\"）\n5. 调用 web_search → 反馈状态 → 渲染。Hero 区 RichText ≥150 字，包含 3 个 Statistic 指标。",
    styleHint: "现代企业风，渐变 Hero 区，深色 CTA 按钮",
    components: [
      { id: "root", component: "Column", children: ["hero", "features", "faq", "cta"], gap: 24 },
      { id: "hero", component: "Card", children: ["hero-title", "hero-sub"] },
      { id: "hero-title", component: "Text", text: "构建更好的产品", variant: "h1" },
      { id: "hero-sub", component: "RichText", content: "用 AI 驱动的工具，将开发效率**提升 10 倍**。\\n\\n支持团队协作、自动化测试和一键部署。无需编写复杂配置，5 分钟即可完成项目初始化。\\n\\n### 为什么选择我们\\n- 智能代码补全：上下文感知，准确率 92%\\n- 自动化测试：AI 生成测试用例，覆盖率提升 40%\\n- 一键部署：支持 AWS、Azure、阿里云等主流云平台" },
      { id: "features", component: "Row", children: ["feat-1", "feat-2", "feat-3"], gap: 12 },
      { id: "feat-1", component: "Statistic", title: "响应延迟", value: "10", suffix: "ms" },
      { id: "feat-2", component: "Statistic", title: "服务可用性", value: "99.99", suffix: "%" },
      { id: "feat-3", component: "Statistic", title: "全球节点", value: "30+", suffix: "区域" },
      {
        id: "faq", component: "CollapsibleSection", title: "常见问题", defaultOpen: false, children: ["faq-content"],
      },
      {
        id: "faq-content", component: "RichText",
        content: "**Q: 支持哪些平台？**\nA: 支持 Web、iOS、Android。\n\n**Q: 如何开始使用？**\nA: 注册后即可免费试用 14 天。",
      },
      {
        id: "cta", component: "QuickActionRow",
        actions: [
          { label: "免费开始使用", name: "get_started", primary: true },
          { label: "预约演示", name: "book_demo" },
        ],
      },
    ],
  },

  // ===== 社交与协作 =====
  {
    id: "user-profile",
    title: "个人主页",
    emoji: "👤",
    description: "头像 + 统计卡片 + 可展开详情",
    category: "社交与协作",
    prompt:
      "用户选择了个人主页模板。你需要：\n1. 先用 QuickActionRow 询问主页用途，提供选项：个人简介、作品集展示、团队介绍、品牌主页、其他\n2. 追问色调偏好，提供选项：浅色社交风、深色简约风、暖色温馨风、品牌定制色\n3. 追问需要展示的信息模块，提供选项：头像+简介+统计、头像+简介+统计+详细资料、完整展示（含技能标签）\n4. 简单个人主页无需搜索，直接生成。头像用 Avatar 组件，统计用 Statistic 组件，详细资料用 CollapsibleSection。",
    styleHint: "浅色社交风，圆形头像，统计数字突出",
    components: [
      { id: "root", component: "Column", children: ["profile-card", "details"], gap: 16 },
      { id: "profile-card", component: "Card", children: ["avatar-row", "div", "stats-row"] },
      { id: "avatar-row", component: "Row", children: ["avatar", "name-block"], gap: 16 },
      { id: "avatar", component: "Avatar", name: "用户", size: 64 },
      { id: "name-block", component: "Column", children: ["user-name", "user-bio", "user-badge"], gap: 4 },
      { id: "user-name", component: "Text", text: "用户名称", variant: "h1" },
      { id: "user-bio", component: "Text", text: "个人简介", variant: "caption" },
      { id: "user-badge", component: "StatusBadge", text: "认证用户", status: "success" },
      { id: "div", component: "Divider" },
      { id: "stats-row", component: "Row", children: ["stat-posts", "stat-followers", "stat-following", "stat-stars"], gap: 12 },
      { id: "stat-posts", component: "Statistic", title: "内容", value: 128 },
      { id: "stat-followers", component: "Statistic", title: "关注者", value: 3456 },
      { id: "stat-following", component: "Statistic", title: "正在关注", value: 256 },
      { id: "stat-stars", component: "Statistic", title: "获赞", value: "8.9k" },
      {
        id: "details", component: "CollapsibleSection", title: "详细资料", defaultOpen: false, children: ["detail-content"],
      },
      {
        id: "detail-content", component: "RichText",
        content: "- **所在地**：北京 · 朝阳区\\n- **技能标签**：产品设计、用户体验、数据分析、项目管理\\n- **关于我**：拥有 8 年互联网产品经验，主导过多个从 0 到 1 的核心项目。专注于用户增长和体验优化，相信数据驱动的决策方式。\\n- **教育背景**：清华大学 · 计算机科学与技术\\n- **语言**：中文（母语）、英语（流利）、日语（基础）",
      },
    ],
  },
  {
    id: "project-kanban",
    title: "任务看板",
    emoji: "📌",
    description: "三列看板 + 任务卡片 + 优先级标签",
    category: "社交与协作",
    prompt:
      "用户选择了任务看板模板。你需要：\n1. 先用 QuickActionRow 询问看板用途，提供选项：软件研发、内容制作、活动筹备、销售跟进、自定义\n2. 追问需要哪些状态列，提供选项：待办→进行中→已完成（经典三列）、待办→进行中→审核→已完成（四列）、自定义\n3. 追问是否需要优先级标签，提供选项：需要（高/中/低）、不需要\n4. 简单看板无需搜索，直接生成。每列至少 2 张任务卡片，用 Tag 区分优先级，用 StatusBadge 显示列状态。",
    styleHint: "浅色看板风，三列布局，颜色标签区分优先级",
    components: [
      { id: "root", component: "Column", children: ["title", "board"], gap: 20 },
      { id: "title", component: "Text", text: "任务看板", variant: "h1" },
      { id: "board", component: "Row", children: ["col-todo", "col-progress", "col-done"], gap: 16 },
      // 待办
      { id: "col-todo", component: "Card", children: ["todo-header", "todo-1", "todo-2"], title: "待办" },
      { id: "todo-header", component: "StatusBadge", text: "2 个任务", status: "warning" },
      { id: "todo-1", component: "Card", children: ["t1-tag", "t1-text"], title: "任务一" },
      { id: "t1-tag", component: "Tag", text: "高优先级", color: "red" },
      { id: "t1-text", component: "Text", text: "任务描述", variant: "caption" },
      { id: "todo-2", component: "Card", children: ["t2-tag", "t2-text"], title: "任务二" },
      { id: "t2-tag", component: "Tag", text: "中优先级", color: "orange" },
      { id: "t2-text", component: "Text", text: "任务描述", variant: "caption" },
      // 进行中
      { id: "col-progress", component: "Card", children: ["prog-header", "prog-1"], title: "进行中" },
      { id: "prog-header", component: "StatusBadge", text: "1 个任务", status: "info" },
      { id: "prog-1", component: "Card", children: ["p1-tag", "p1-text"], title: "任务三" },
      { id: "p1-tag", component: "Tag", text: "高优先级", color: "red" },
      { id: "p1-text", component: "Text", text: "任务描述", variant: "caption" },
      // 已完成
      { id: "col-done", component: "Card", children: ["done-header", "done-1", "done-2"], title: "已完成" },
      { id: "done-header", component: "StatusBadge", text: "2 个任务", status: "success" },
      { id: "done-1", component: "Card", children: ["d1-tag", "d1-text"], title: "任务四" },
      { id: "d1-tag", component: "Tag", text: "已完成", color: "green" },
      { id: "d1-text", component: "Text", text: "任务描述", variant: "caption" },
      { id: "done-2", component: "Card", children: ["d2-tag", "d2-text"], title: "任务五" },
      { id: "d2-tag", component: "Tag", text: "已完成", color: "green" },
      { id: "d2-text", component: "Text", text: "任务描述", variant: "caption" },
    ],
  },
];
