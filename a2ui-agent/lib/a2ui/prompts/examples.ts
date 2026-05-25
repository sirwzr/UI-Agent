// ===== Few-shot A2UI 示例 =====

export const DASHBOARD_EXAMPLE = `
## 仪表盘示例

收到「做销售仪表盘」后，先搜索数据，再调用 render_a2ui：

surfaceId: "dashboard"
components: [
  {"id": "root", "component": "Column", "children": ["header", "stats-row", "chart", "table"], "gap": 16},
  {"id": "header", "component": "Text", "text": "销售仪表盘", "variant": "h1"},
  {"id": "stats-row", "component": "Row", "children": ["sales-stat", "orders-stat", "users-stat", "rate-stat"], "gap": 12},
  {"id": "sales-stat", "component": "Statistic", "title": "总销售额", "value": 128430, "prefix": "¥", "trend": "up"},
  {"id": "orders-stat", "component": "Statistic", "title": "订单数", "value": 1842, "trend": "up"},
  {"id": "users-stat", "component": "Statistic", "title": "新增用户", "value": 356, "trend": "up"},
  {"id": "rate-stat", "component": "Statistic", "title": "转化率", "value": 12.5, "suffix": "%", "trend": "down"},
  {"id": "chart", "component": "Chart", "title": "月度销售趋势", "type": "area", "data": [{"month":"1月","sales":42000},{"month":"2月","sales":38000},{"month":"3月","sales":51000}], "xField": "month", "yField": "sales", "color": "#2563eb", "height": 260},
  {"id": "table", "component": "Table", "columns": [{"title":"订单号","dataIndex":"id"},{"title":"客户","dataIndex":"customer"},{"title":"金额","dataIndex":"amount"}], "dataSource": {"records": [{"id":"001","customer":"张三","amount":"¥1,200"}]}}
]`;

export const PRODUCT_SHOWCASE_EXAMPLE = `
## 产品展示页示例

收到「做产品展示页」后，先搜索产品图片，再构建界面：

surfaceId: "product-showcase"
components: [
  {"id": "root", "component": "Column", "children": ["carousel", "info-card", "actions"], "gap": 16},
  {"id": "carousel", "component": "Carousel", "items": [{"url":"https://...","caption":"产品正面"},{"url":"https://...","caption":"产品侧面"}], "autoplay": true},
  {"id": "info-card", "component": "Card", "children": ["name", "desc", "price"]},
  {"id": "name", "component": "Text", "text": "产品名称", "variant": "h1"},
  {"id": "desc", "component": "RichText", "content": "产品详细描述，支持 **Markdown** 格式"},
  {"id": "price", "component": "NumberAnimation", "label": "价格", "value": 299, "prefix": "¥", "duration": 1500},
  {"id": "actions", "component": "QuickActionRow", "actions": [{"label":"立即购买","name":"buy_now","primary":true},{"label":"加入收藏","name":"add_fav"}]}
]`;

export const MEDIA_LANDING_EXAMPLE = `
## 媒体落地页示例

收到「做产品落地页」后设计视觉有冲击力的页面：

surfaceId: "landing"
components: [
  {"id": "root", "component": "Column", "children": ["hero", "video", "features", "cta"], "gap": 20},
  {"id": "hero", "component": "Card", "children": ["hero-title", "hero-sub"]},
  {"id": "hero-title", "component": "Text", "text": "新一代 AI 开发平台", "variant": "h1"},
  {"id": "hero-sub", "component": "RichText", "content": "使用 AI 驱动的工作流，将开发效率**提升 10 倍**。支持团队协作、自动化测试和一键部署。"},
  {"id": "video", "component": "Video", "title": "产品演示", "src": "https://...", "controls": true},
  {"id": "features", "component": "Row", "children": ["feat-1", "feat-2", "feat-3"], "gap": 12},
  {"id": "feat-1", "component": "Statistic", "title": "极速响应", "value": "10ms", "suffix": "延迟"},
  {"id": "feat-2", "component": "Statistic", "title": "企业级安全", "value": "99.99%", "suffix": "可用"},
  {"id": "feat-3", "component": "Statistic", "title": "全球节点", "value": "30+", "suffix": "区域"},
  {"id": "cta", "component": "QuickActionRow", "actions": [{"label":"免费开始使用","name":"get_started","primary":true},{"label":"观看演示","name":"watch_demo"}]}
]`;

export function enrichSystemPrompt(basePrompt: string): string {
  return `${basePrompt}

---
${DASHBOARD_EXAMPLE}

${PRODUCT_SHOWCASE_EXAMPLE}

${MEDIA_LANDING_EXAMPLE}`;
}
