// ===== Few-shot A2UI 示例 =====
// 每个布局模式提供完整 JSON 示例，展示「充足数据」的标准

export const DASHBOARD_EXAMPLE = `
## 仪表盘示例 — 销售数据看板

布局模式: Column(StatisticRow×4 + Row(Chart + Table) + Timeline)
数据标准: Table ≥ 6 行, Chart ≥ 8 数据点, 组件 18-28 个

surfaceId: "sales-dashboard"
components: [
  {"id": "root", "component": "Column", "children": ["header", "stats-row", "main-row", "timeline"], "gap": 20},
  {"id": "header", "component": "Text", "text": "销售仪表盘", "variant": "h1"},

  // 4 个 KPI 卡片，全带 trend
  {"id": "stats-row", "component": "Row", "children": ["stat-sales", "stat-orders", "stat-users", "stat-rate"], "gap": 12},
  {"id": "stat-sales", "component": "Statistic", "title": "总销售额", "value": 128430, "prefix": "¥", "trend": "up"},
  {"id": "stat-orders", "component": "Statistic", "title": "订单数", "value": 1842, "trend": "up"},
  {"id": "stat-users", "component": "Statistic", "title": "新增用户", "value": 356, "trend": "up"},
  {"id": "stat-rate", "component": "Statistic", "title": "转化率", "value": 12.5, "suffix": "%", "trend": "down"},

  // 图表 + 表格并排
  {"id": "main-row", "component": "Row", "children": ["chart-col", "table-col"], "gap": 16},
  {"id": "chart-col", "component": "Column", "children": ["chart-title", "main-chart"], "gap": 12},
  {"id": "chart-title", "component": "Text", "text": "月度销售趋势", "variant": "h2"},
  {"id": "main-chart", "component": "Chart", "title": "过去 12 个月", "type": "bar",
    "data": [
      {"month":"1月","sales":42000},{"month":"2月","sales":38000},{"month":"3月","sales":51000},
      {"month":"4月","sales":47000},{"month":"5月","sales":55000},{"month":"6月","sales":62000},
      {"month":"7月","sales":58000},{"month":"8月","sales":65000}
    ],
    "xField": "month", "yField": "sales", "color": "#06b6d4", "height": 280
  },

  // 表格至少 6 行
  {"id": "table-col", "component": "Column", "children": ["table-title", "order-table"], "gap": 12},
  {"id": "table-title", "component": "Text", "text": "最近订单", "variant": "h2"},
  {"id": "order-table", "component": "Table",
    "columns": [{"title":"订单号","dataIndex":"id"},{"title":"客户","dataIndex":"customer"},{"title":"金额","dataIndex":"amount"},{"title":"状态","dataIndex":"status"}],
    "dataSource": {"records": [
      {"id":"ORD-001","customer":"张三","amount":"¥1,200","status":"已完成"},
      {"id":"ORD-002","customer":"李四","amount":"¥3,450","status":"处理中"},
      {"id":"ORD-003","customer":"王五","amount":"¥890","status":"已完成"},
      {"id":"ORD-004","customer":"赵六","amount":"¥5,600","status":"已完成"},
      {"id":"ORD-005","customer":"孙七","amount":"¥2,100","status":"已取消"},
      {"id":"ORD-006","customer":"周八","amount":"¥4,320","status":"处理中"}
    ]}
  },

  // 时间线
  {"id": "timeline", "component": "Timeline",
    "items": [
      {"label":"10:30","content":"新增订单 ORD-006，金额 ¥4,320"},
      {"label":"09:15","content":"月销售目标达成率 85%"},
      {"label":"08:00","content":"系统自动生成日报"}
    ]
  }
]`;

export const PRODUCT_SHOWCASE_EXAMPLE = `
## 产品展示页示例 — 智能手表

布局模式: Column(Carousel + Card(Text+RichText+Rating+NumberAnimation+QuickActionRow))
数据标准: Carousel 3-6 张, RichText ≥ 100 字, 组件 12-18 个

surfaceId: "product-showcase"
components: [
  {"id": "root", "component": "Column", "children": ["carousel", "info-card", "spec-section", "actions"], "gap": 20},

  // 轮播图：3-6 张，URL 来自搜索
  {"id": "carousel", "component": "Carousel",
    "items": [
      {"url":"https://images.pexels.com/photos/watch-1.jpg","caption":"正面视图"},
      {"url":"https://images.pexels.com/photos/watch-2.jpg","caption":"侧面视图"},
      {"url":"https://images.pexels.com/photos/watch-3.jpg","caption":"佩戴效果"},
      {"url":"https://images.pexels.com/photos/watch-4.jpg","caption":"细节特写"}
    ],
    "autoplay": true, "interval": 3000
  },

  // 产品信息卡片
  {"id": "info-card", "component": "Card", "children": ["name", "divider", "desc", "price-row"]},
  {"id": "name", "component": "Text", "text": "ProWatch X1 智能手表", "variant": "h1"},
  {"id": "divider", "component": "Divider"},
  {"id": "desc", "component": "RichText",
    "content": "ProWatch X1 是新一代智能手表，搭载自研健康引擎，支持**心率实时监测**、**血氧检测**和**睡眠分析**。\\n\\n### 核心特性\\n- 🏃 运动追踪：支持跑步、游泳、骑行等 20+ 运动模式\\n- 🔋 超长续航：7 天正常使用，30 天待机\\n- 🌊 5ATM 防水：游泳佩戴无忧\\n- 📱 消息提醒：来电、微信、邮件实时推送\\n\\n精工打造，表圈采用钛合金材质，蓝宝石玻璃镜面，轻巧且耐用。"},

  // 价格 + 评分行
  {"id": "price-row", "component": "Row", "children": ["price", "rating"], "gap": 24},
  {"id": "price", "component": "NumberAnimation", "label": "售价", "value": 2999, "prefix": "¥", "duration": 1500},
  {"id": "rating", "component": "Rating", "label": "用户评分", "value": 4.5, "max": 5, "allowHalf": true},

  // 规格参数可折叠
  {"id": "spec-section", "component": "CollapsibleSection", "title": "详细规格", "defaultOpen": false, "children": ["spec-content"]},
  {"id": "spec-content", "component": "RichText",
    "content": "| 参数 | 详情 |\\n|------|------|\\n| 屏幕 | 1.43寸 AMOLED |\\n| 处理器 | A1 双核芯片 |\\n| 存储 | 32GB |\\n| 重量 | 52g（不含表带） |\\n| 兼容 | iOS 15+ / Android 10+ |"},

  // CTA 按钮组
  {"id": "actions", "component": "QuickActionRow",
    "actions": [{"label":"立即购买","name":"buy_now","primary":true},{"label":"加入购物车","name":"add_cart"},{"label":"收藏","name":"add_fav"}]
  }
]`;

export const LANDING_EXAMPLE = `
## 落地页示例 — SaaS 产品

布局模式: Column(Hero(Card) + StatisticRow×3 + CollapsibleSection(FAQ) + QuickActionRow(CTA))
数据标准: Hero 区 RichText ≥ 100 字, 组件 10-16 个

surfaceId: "landing"
components: [
  {"id": "root", "component": "Column", "children": ["hero", "features", "faq", "cta"], "gap": 24},

  // Hero 区域
  {"id": "hero", "component": "Card", "children": ["hero-title", "hero-sub"]},
  {"id": "hero-title", "component": "Text", "text": "智能数据分析平台", "variant": "h1"},
  {"id": "hero-sub", "component": "RichText",
    "content": "一站式数据分析解决方案，帮助团队**快速洞察业务趋势**。\\n\\n无需编写 SQL，通过自然语言即可完成数据查询、可视化和报表生成。支持连接 MySQL、PostgreSQL、BigQuery 等 20+ 数据源，5 分钟完成数据接入。"},

  // 3 个特点指标
  {"id": "features", "component": "Row", "children": ["feat-1", "feat-2", "feat-3"], "gap": 12},
  {"id": "feat-1", "component": "Statistic", "title": "查询响应", "value": "<1", "suffix": "秒"},
  {"id": "feat-2", "component": "Statistic", "title": "服务可用性", "value": "99.99", "suffix": "%"},
  {"id": "feat-3", "component": "Statistic", "title": "数据源支持", "value": "20+", "suffix": "种"},

  // FAQ
  {"id": "faq", "component": "CollapsibleSection", "title": "常见问题", "defaultOpen": false, "children": ["faq-content"]},
  {"id": "faq-content", "component": "RichText",
    "content": "**Q: 支持哪些数据源？**\\nA: MySQL、PostgreSQL、BigQuery、Snowflake、MongoDB 等 20+ 主流数据库。\\n\\n**Q: 如何保证数据安全？**\\nA: 所有数据传输使用 TLS 1.3 加密，支持 SOC 2 Type II 认证。"},

  // CTA
  {"id": "cta", "component": "QuickActionRow",
    "actions": [{"label":"免费试用","name":"start_trial","primary":true},{"label":"预约演示","name":"book_demo"},{"label":"查看文档","name":"view_docs"}]
  }
]`;

export const DATA_MANAGE_EXAMPLE = `
## 数据管理示例 — 项目后台

布局模式: Column(Row(SearchBar+Button) + TagRow + Table + StatisticRow)
数据标准: Table ≥ 6 行, 组件 15-25 个

surfaceId: "project-admin"
components: [
  {"id": "root", "component": "Column", "children": ["header", "toolbar", "tags", "table", "stats-row"], "gap": 16},

  {"id": "header", "component": "Text", "text": "项目管理", "variant": "h1"},

  // 搜索 + 新增
  {"id": "toolbar", "component": "Row", "children": ["search", "add-btn", "export-btn"], "gap": 12},
  {"id": "search", "component": "SearchBar", "placeholder": "搜索项目名称...", "action": {"name": "search_projects"}},
  {"id": "add-btn", "component": "Button", "child": "add-text", "primary": true, "action": {"name": "create_project"}},
  {"id": "add-text", "component": "Text", "text": "新增项目"},
  {"id": "export-btn", "component": "Button", "child": "export-text", "action": {"name": "export_data"}},
  {"id": "export-text", "component": "Text", "text": "导出"},

  // 分类标签
  {"id": "tags", "component": "Row", "children": ["tag-all", "tag-tech", "tag-design", "tag-ops", "tag-research"], "gap": 8},
  {"id": "tag-all", "component": "Tag", "text": "全部 (24)", "color": "blue"},
  {"id": "tag-tech", "component": "Tag", "text": "技术 (8)", "color": "green"},
  {"id": "tag-design", "component": "Tag", "text": "设计 (6)", "color": "purple"},
  {"id": "tag-ops", "component": "Tag", "text": "运营 (5)", "color": "orange"},
  {"id": "tag-research", "component": "Tag", "text": "研究 (5)", "color": "cyan"},

  // 表格 ≥ 6 行
  {"id": "table", "component": "Table",
    "columns": [
      {"title":"项目名称","dataIndex":"name"},{"title":"分类","dataIndex":"category"},
      {"title":"负责人","dataIndex":"owner"},{"title":"预算","dataIndex":"budget"},
      {"title":"进度","dataIndex":"progress"},{"title":"状态","dataIndex":"status"}
    ],
    "dataSource": {"records": [
      {"id":"1","name":"用户中心重构","category":"技术","owner":"张三","budget":"¥50,000","progress":"75%","status":"进行中"},
      {"id":"2","name":"品牌视觉升级","category":"设计","owner":"李四","budget":"¥30,000","progress":"90%","status":"进行中"},
      {"id":"3","name":"SEO 优化专项","category":"运营","owner":"王五","budget":"¥20,000","progress":"100%","status":"已完成"},
      {"id":"4","name":"AI 推荐引擎","category":"技术","owner":"赵六","budget":"¥80,000","progress":"40%","status":"进行中"},
      {"id":"5","name":"竞品分析报告","category":"研究","owner":"孙七","budget":"¥15,000","progress":"60%","status":"进行中"},
      {"id":"6","name":"移动端适配","category":"技术","owner":"周八","budget":"¥45,000","progress":"20%","status":"规划中"}
    ]}
  },

  // 底部统计
  {"id": "stats-row", "component": "Row", "children": ["stat-total", "stat-active", "stat-done", "stat-budget"], "gap": 12},
  {"id": "stat-total", "component": "Statistic", "title": "项目总数", "value": 24, "trend": "up"},
  {"id": "stat-active", "component": "Statistic", "title": "进行中", "value": 16, "trend": "up"},
  {"id": "stat-done", "component": "Statistic", "title": "已完成", "value": 6},
  {"id": "stat-budget", "component": "Statistic", "title": "总预算", "value": 480000, "prefix": "¥"}
]`;

export const GUIDED_QA_EXAMPLE = `
## 智能对话引导示例

### 场景 1: 需求明确 → 直接生成

用户: "做一个红色运动鞋的产品展示页"
Agent: (调用 web_search 搜索 "red sneakers product")
Agent → RichText: "已获取到 10 张运动鞋图片和文本数据 ✓"
Agent → render_a2ui: (直接生成红色运动鞋产品页，包含图片轮播、描述、价格、评分)

### 场景 2: 需求模糊 → 1 轮澄清

用户: "做个仪表盘"
Agent → RichText: "好的，请选择你想查看的仪表盘类型："
Agent → QuickActionRow:
  [
    {"label": "销售数据", "name": "dashboard_sales"},
    {"label": "系统监控", "name": "dashboard_monitor"},
    {"label": "财务概览", "name": "dashboard_finance"},
    {"label": "用户分析", "name": "dashboard_users"}
  ]

用户点击「销售数据」→ Agent 搜索图片 → 告知状态 → 生成销售仪表盘

### 场景 3: 关键信息缺失 → 必须追问

用户: "帮我做公司的销售报表"
Agent → RichText: "在生成之前，我需要确认：请问你的公司名称或所在行业是？"
Agent → QuickActionRow:
  [
    {"label": "科技/SaaS", "name": "industry_tech"},
    {"label": "零售/电商", "name": "industry_retail"},
    {"label": "制造业", "name": "industry_manufacturing"},
    {"label": "金融", "name": "industry_finance"},
    {"label": "其他", "name": "industry_other"}
  ]

用户点击「零售/电商」→ Agent 搜索 → 告知状态 → 生成零售业销售报表

### 场景 4: 文本搜索失败 → 使用 _fallbackContent

用户: "做一个数码产品展示页"
Agent 调用 web_search("数码电子产品展示") → 返回 { _textAvailable: false, _fallbackContent: { category: "technology", sampleTitle: "...", sampleDescription: "基于云原生架构...", sampleStats: [...], sampleTableRows: [...](6行), sampleChartData: [...](8点) } }

Agent → RichText: "已获取到 10 张数码产品图片。文本搜索暂不可用，将使用内置数据生成内容。"
Agent → render_a2ui: 使用 _fallbackContent 的数据——
  - Text: "技术平台"
  - RichText: sampleDescription (≥150字，含架构优势、性能指标)
  - Row(Statistic×4): 日处理请求 86亿 | 可用性 99.99% | P99 48ms | 32 节点
  - Table: 6 行服务监控数据（API网关、用户中心、订单服务...）
  - Chart: 8 周请求量趋势
  同时使用搜索返回的数码产品图片填充 Image/Carousel 组件

### 场景 5: 内容质量的反例 → 正确做法

❌ 反例：生成的产品页 RichText 只有 "这是一个很好的产品，质量优秀，价格合理。"（20字，无结构）
✅ 正确：RichText ≥ 150字，包含「设计理念」「核心性能」「用户口碑」三级标题，每段充实

❌ 反例：Chart 数据只有 [{"month":"1月","value":100},{"month":"2月","value":200},{"month":"3月","value":150}]
✅ 正确：Chart 至少 8 个数据点，数据有起伏变化，不单调

❌ 反例：Table 只有 2 行 {"id":"1","name":"项目A"},{"id":"2","name":"项目B"}
✅ 正确：Table 至少 6 行，每行包含完整字段（名称、数值、状态、日期等）

❌ 反例：图片描述含 "food" 却用在 "技术产品" 页面
✅ 正确：从 images 数组中选择 description 与主题匹配的图片

### 禁止的行为

❌ 用户说 "帮我做公司报表"，Agent 直接生成并说 "贵公司 Acme Inc..."
❌ 用户没提供位置，Agent 假设 "根据您在上海的团队..."
❌ 搜索失败后，Agent 假装有搜索结果去编造数据
❌ 用占位文本 "在这里描述..." "数值一" "项目 A"
❌ RichText < 150 字，Table < 6 行，Chart < 8 数据点
`;

export const WEATHER_EXAMPLE = `
## 天气看板示例

用户要求天气数据时，先调用 get_weather，再生成界面：

1. get_weather({ city: "北京", days: 3 }) 返回实时天气
2. 用 RichText 告知搜索状态
3. 使用 current 数据填充 Statistic（温度、湿度、风速）
4. 使用 forecast 数据填充 Chart（温度趋势图，≥ 8 个数据点）
5. 调用 render_a2ui 生成

surfaceId: "weather"
components: [
  {"id": "root", "component": "Column", "children": ["header", "current-row", "chart", "forecast-timeline"], "gap": 16},
  {"id": "header", "component": "Text", "text": "北京天气", "variant": "h1"},
  {"id": "current-row", "component": "Row", "children": ["stat-temp", "stat-humidity", "stat-wind", "stat-uv"], "gap": 12},
  {"id": "stat-temp", "component": "Statistic", "title": "当前温度", "value": "26°C", "trend": "up"},
  {"id": "stat-humidity", "component": "Statistic", "title": "湿度", "value": "32%"},
  {"id": "stat-wind", "component": "Statistic", "title": "风速", "value": "19 km/h"},
  {"id": "stat-uv", "component": "Statistic", "title": "紫外线", "value": "9", "suffix": "级"},
  {"id": "chart", "component": "Chart", "type": "line", "title": "未来温度趋势",
   "data": [
     {"date":"5/29","max":28,"min":18},{"date":"5/30","max":30,"min":20},
     {"date":"5/31","max":27,"min":19},{"date":"6/1","max":25,"min":17},
     {"date":"6/2","max":29,"min":21},{"date":"6/3","max":31,"min":22},
     {"date":"6/4","max":32,"min":23},{"date":"6/5","max":28,"min":20}
   ],
   "xField": "date", "yField": "max", "color": "#f59e0b", "height": 240},
  {"id": "forecast-timeline", "component": "Timeline",
   "items": [
     {"label":"今天","content":"晴转多云，26°C，湿度 32%，适合户外活动"},
     {"label":"明天","content":"晴天，30°C，注意防晒"},
     {"label":"后天","content":"阴天，27°C，可能有小雨"}
   ]}
]`;

export function enrichSystemPrompt(basePrompt: string): string {
  return `${basePrompt}

---
${DASHBOARD_EXAMPLE}

${WEATHER_EXAMPLE}

${PRODUCT_SHOWCASE_EXAMPLE}

${LANDING_EXAMPLE}

${DATA_MANAGE_EXAMPLE}

${GUIDED_QA_EXAMPLE}`;
}
