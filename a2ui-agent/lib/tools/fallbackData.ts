// ===== 备用图片数据（Tavily 搜索失败时使用）=====
// 所有 URL 来自 Unsplash，已添加 w=800&fit=crop 参数自动缩放

export interface FallbackImage {
  url: string;
  description: string;
}

const PRODUCT_IMAGES: FallbackImage[] = [
  { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&fit=crop", description: "白色产品摄影" },
  { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop", description: "耳机产品展示" },
  { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop", description: "红色运动鞋" },
  { url: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=800&fit=crop", description: "香水瓶" },
  { url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&fit=crop", description: "电商产品" },
  { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&fit=crop", description: "太阳镜" },
  { url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&fit=crop", description: "护肤品" },
  { url: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&fit=crop", description: "手表特写" },
];

const TECHNOLOGY_IMAGES: FallbackImage[] = [
  { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&fit=crop", description: "电路板特写" },
  { url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&fit=crop", description: "科技办公桌" },
  { url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&fit=crop", description: "代码编辑器" },
  { url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&fit=crop", description: "笔记本电脑" },
  { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&fit=crop", description: "网络安全" },
  { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&fit=crop", description: "数据中心" },
  { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&fit=crop", description: "服务器机架" },
  { url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&fit=crop", description: "开发工具" },
];

const FOOD_IMAGES: FallbackImage[] = [
  { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop", description: "美食沙拉" },
  { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&fit=crop", description: "披萨" },
  { url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&fit=crop", description: "煎饼" },
  { url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&fit=crop", description: "水果碗" },
  { url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&fit=crop", description: "精致甜点" },
  { url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&fit=crop", description: "意面" },
  { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&fit=crop", description: "牛排" },
  { url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&fit=crop", description: "巧克力蛋糕" },
];

const NATURE_IMAGES: FallbackImage[] = [
  { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop", description: "山水风景" },
  { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&fit=crop", description: "雾中森林" },
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&fit=crop", description: "阳光透过树林" },
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop", description: "海滩日落" },
  { url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&fit=crop", description: "海浪" },
  { url: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&fit=crop", description: "山脉" },
  { url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&fit=crop", description: "秋日风景" },
  { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&fit=crop", description: "自然探险" },
];

const BUSINESS_IMAGES: FallbackImage[] = [
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&fit=crop", description: "商务办公" },
  { url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&fit=crop", description: "团队协作" },
  { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&fit=crop", description: "会议室" },
  { url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&fit=crop", description: "数据分析" },
  { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop", description: "团队讨论" },
  { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&fit=crop", description: "企业办公" },
  { url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&fit=crop", description: "财务图表" },
  { url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&fit=crop", description: "商业楼宇" },
];

const PEOPLE_IMAGES: FallbackImage[] = [
  { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&fit=crop", description: "女性肖像" },
  { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&fit=crop", description: "男性肖像" },
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&fit=crop", description: "人像摄影" },
  { url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&fit=crop", description: "时尚人像" },
  { url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&fit=crop", description: "模特" },
  { url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&fit=crop", description: "女性微笑" },
  { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&fit=crop", description: "商务女性" },
  { url: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800&fit=crop", description: "男性侧面" },
];

const FALLBACK_MAP: Record<string, FallbackImage[]> = {
  products: PRODUCT_IMAGES,
  technology: TECHNOLOGY_IMAGES,
  food: FOOD_IMAGES,
  nature: NATURE_IMAGES,
  business: BUSINESS_IMAGES,
  people: PEOPLE_IMAGES,
};

const KEYWORD_CATEGORIES: Record<string, string[]> = {
  products: ["产品", "商品", "鞋", "衣服", "手表", "包包", "数码", "手机", "耳机", "product", "shop", "store", "shoes", "watch", "bag"],
  technology: ["科技", "技术", "电脑", "软件", "编程", "代码", "服务器", "AI", "tech", "code", "server", "software"],
  food: ["美食", "菜谱", "食谱", "餐厅", "食物", "烹饪", "水果", "甜点", "food", "recipe", "cook", "restaurant", "pizza"],
  nature: ["自然", "风景", "山水", "森林", "海", "日落", "花园", "天气", "nature", "mountain", "beach", "forest", "sunset"],
  business: ["商务", "办公", "会议", "企业", "财务", "数据", "销售", "营收", "business", "office", "finance", "sales"],
  people: ["人物", "肖像", "头像", "用户", "团队", "成员", "模特", "people", "portrait", "team", "user", "avatar"],
};

/**
 * 根据搜索关键词匹配最相关的备用图片分类
 */
export function matchFallbackImages(query: string): FallbackImage[] {
  const lower = query.toLowerCase();
  const scores = Object.entries(KEYWORD_CATEGORIES).map(([category, keywords]) => {
    const score = keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    return { category, score };
  });
  scores.sort((a, b) => b.score - a.score);
  const bestCategory = scores[0]?.score > 0 ? scores[0].category : "technology";
  return FALLBACK_MAP[bestCategory] ?? TECHNOLOGY_IMAGES;
}

/**
 * 获取所有分类的图片合集（用于 Carousel 多图片场景）
 */
export function getAllFallbackImages(count = 8): FallbackImage[] {
  const all: FallbackImage[] = [];
  const categories = Object.values(FALLBACK_MAP);
  let i = 0;
  while (all.length < count && i < categories.length) {
    all.push(...categories[i]);
    i++;
  }
  return all.slice(0, count);
}

// ===== 文本内容 Fallback 模板 =====
// 当所有文本搜索源不可用时，提供结构化内容供 LLM 填充界面
// 每条内容都是完整、真实感的数据，LLM 可以直接使用或改写

export interface TextContentTemplate {
  category: string;
  sampleTitle: string;
  sampleDescription: string; // RichText ≥ 150 字
  sampleFeatures: string[]; // 特性列表
  sampleStats: { title: string; value: string; suffix?: string }[]; // Statistic 卡片
  sampleTableColumns: { title: string; dataIndex: string }[];
  sampleTableRows: Record<string, string>[]; // ≥ 6 行
  sampleChartLabel: string;
  sampleChartData: Record<string, string | number>[]; // ≥ 8 数据点
}

const PRODUCT_CONTENT: TextContentTemplate = {
  category: "products",
  sampleTitle: "产品展示",
  sampleDescription:
    "本系列产品采用先进制造工艺，通过 ISO 9001 质量体系认证。核心优势包括：\\n\\n### 设计理念\\n融合现代极简美学与人体工学原理，每一处弧度都经过反复打磨。外壳选用航空级铝合金材质，轻巧耐用，表面阳极氧化处理防刮抗指纹。\\n\\n### 核心性能\\n- 响应速度：0.1 秒极速启动，运行流畅不卡顿\\n- 续航表现：内置 5000mAh 大容量电池，满足全天重度使用\\n- 兼容性：支持 iOS、Android、Windows 全平台无缝连接\\n\\n### 用户口碑\\n全球超过 50 万用户选择，好评率 96%，复购率行业领先。",
  sampleFeatures: ["航空级铝合金机身", "0.1s 极速响应", "5000mAh 超长续航", "IP68 防尘防水", "全平台兼容", "2 年质保"],
  sampleStats: [
    { title: "全球销量", value: "50", suffix: "万+" },
    { title: "好评率", value: "96", suffix: "%" },
    { title: "复购率", value: "34", suffix: "%" },
    { title: "售后响应", value: "<2", suffix: "小时" },
  ],
  sampleTableColumns: [
    { title: "型号", dataIndex: "model" },
    { title: "规格", dataIndex: "spec" },
    { title: "价格", dataIndex: "price" },
    { title: "库存", dataIndex: "stock" },
  ],
  sampleTableRows: [
    { id: "1", model: "标准版", spec: "8GB+128GB", price: "¥2,999", stock: "有货" },
    { id: "2", model: "进阶版", spec: "12GB+256GB", price: "¥3,999", stock: "有货" },
    { id: "3", model: "旗舰版", spec: "16GB+512GB", price: "¥5,499", stock: "紧张" },
    { id: "4", model: "青春版", spec: "6GB+64GB", price: "¥1,999", stock: "有货" },
    { id: "5", model: "联名限定", spec: "12GB+256GB", price: "¥4,599", stock: "预售" },
    { id: "6", model: "商务版", spec: "8GB+256GB", price: "¥3,499", stock: "有货" },
  ],
  sampleChartLabel: "月度销量趋势",
  sampleChartData: [
    { month: "1月", sales: 3200 }, { month: "2月", sales: 2800 }, { month: "3月", sales: 4100 },
    { month: "4月", sales: 3900 }, { month: "5月", sales: 4600 }, { month: "6月", sales: 5200 },
    { month: "7月", sales: 4800 }, { month: "8月", sales: 5500 },
  ],
};

const TECHNOLOGY_CONTENT: TextContentTemplate = {
  category: "technology",
  sampleTitle: "技术平台",
  sampleDescription:
    "基于云原生架构构建的新一代技术平台，采用微服务设计理念，支持弹性伸缩与多区域部署。\\n\\n### 架构优势\\n- 容器化部署：基于 Kubernetes 编排，实现秒级弹性扩容\\n- 服务网格：Istio 流量管理，金丝雀发布零停机\\n- 数据层：TiDB 分布式数据库，支持 HTAP 混合负载\\n\\n### 性能指标\\n系统经过多轮压测，单集群支撑 10 万 QPS，P99 延迟稳定在 50ms 以内。全年服务可用性达 99.99%，通过 SOC 2 Type II 认证。",
  sampleFeatures: ["K8s 弹性编排", "10万 QPS 并发", "P99 < 50ms", "99.99% 可用性", "多区域容灾", "SOC 2 认证"],
  sampleStats: [
    { title: "日处理请求", value: "86", suffix: "亿" },
    { title: "服务可用性", value: "99.99", suffix: "%" },
    { title: "P99 延迟", value: "48", suffix: "ms" },
    { title: "全球节点", value: "32", suffix: "个" },
  ],
  sampleTableColumns: [
    { title: "服务名称", dataIndex: "service" },
    { title: "QPS 峰值", dataIndex: "qps" },
    { title: "成功率", dataIndex: "rate" },
    { title: "负责人", dataIndex: "owner" },
  ],
  sampleTableRows: [
    { id: "1", service: "API 网关", qps: "42,000", rate: "99.97%", owner: "张三" },
    { id: "2", service: "用户中心", qps: "18,500", rate: "99.99%", owner: "李四" },
    { id: "3", service: "订单服务", qps: "12,300", rate: "99.95%", owner: "王五" },
    { id: "4", service: "支付网关", qps: "8,200", rate: "99.99%", owner: "赵六" },
    { id: "5", service: "消息推送", qps: "25,000", rate: "99.92%", owner: "孙七" },
    { id: "6", service: "数据分析", qps: "5,800", rate: "99.98%", owner: "周八" },
  ],
  sampleChartLabel: "近 8 周请求量趋势",
  sampleChartData: [
    { week: "W1", qps: 78000 }, { week: "W2", qps: 82000 }, { week: "W3", qps: 86000 },
    { week: "W4", qps: 81000 }, { week: "W5", qps: 89000 }, { week: "W6", qps: 93000 },
    { week: "W7", qps: 91000 }, { week: "W8", qps: 96000 },
  ],
};

const BUSINESS_CONTENT: TextContentTemplate = {
  category: "business",
  sampleTitle: "业务概览",
  sampleDescription:
    "公司本季度业务保持稳健增长态势，核心指标全面达成或超越目标。以下为关键业务数据分析：\\n\\n### 营收表现\\n季度总营收突破 1,280 万元，同比增长 23.5%，环比增长 8.2%。其中 SaaS 订阅收入占比 62%，专业服务收入占比 28%，其他收入占比 10%。\\n\\n### 客户增长\\n新增付费客户 156 家，客户总数达 1,842 家。客户留存率 94.7%，净收入留存率（NRR）118%，表明现有客户持续扩大使用规模。\\n\\n### 团队效率\\n人均产出较上季度提升 15%，项目交付周期缩短至平均 18 个工作日。",
  sampleFeatures: ["季度营收 ¥1,280万", "同比增长 23.5%", "新增客户 156 家", "留存率 94.7%", "NRR 118%", "交付周期 18 天"],
  sampleStats: [
    { title: "季度营收", value: "1,280", suffix: "万" },
    { title: "同比增长", value: "23.5", suffix: "%" },
    { title: "活跃客户", value: "1,842", suffix: "家" },
    { title: "客户留存", value: "94.7", suffix: "%" },
  ],
  sampleTableColumns: [
    { title: "客户名称", dataIndex: "name" },
    { title: "合同金额", dataIndex: "amount" },
    { title: "签约日期", dataIndex: "date" },
    { title: "状态", dataIndex: "status" },
  ],
  sampleTableRows: [
    { id: "1", name: "星辰科技", amount: "¥480,000", date: "2026-05-15", status: "已签约" },
    { id: "2", name: "远航集团", amount: "¥320,000", date: "2026-05-12", status: "已签约" },
    { id: "3", name: "智慧云科技", amount: "¥650,000", date: "2026-05-08", status: "执行中" },
    { id: "4", name: "蓝鲸数据", amount: "¥280,000", date: "2026-04-28", status: "执行中" },
    { id: "5", name: "极光创新", amount: "¥180,000", date: "2026-04-20", status: "已完成" },
    { id: "6", name: "先锋资本", amount: "¥520,000", date: "2026-04-15", status: "已完成" },
  ],
  sampleChartLabel: "月度营收趋势",
  sampleChartData: [
    { month: "1月", revenue: 380 }, { month: "2月", revenue: 350 }, { month: "3月", revenue: 420 },
    { month: "4月", revenue: 400 }, { month: "5月", revenue: 450 }, { month: "6月", revenue: 480 },
    { month: "7月", revenue: 460 }, { month: "8月", revenue: 510 },
  ],
};

const FOOD_CONTENT: TextContentTemplate = {
  category: "food",
  sampleTitle: "美食推荐",
  sampleDescription:
    "这家位于市中心的餐厅以融合菜系闻名，主厨曾在米其林三星餐厅任职 8 年。\\n\\n### 招牌菜品\\n- 黑松露和牛塔塔：选用 A5 级和牛，搭配新鲜黑松露，入口即化\\n- 花雕醉蟹：阳澄湖大闸蟹以十年陈花雕酒腌制 48 小时，蟹黄饱满\\n- 柑橘慢煮鸭胸：低温慢煮 6 小时，配血橙酱汁，肉质粉嫩多汁\\n\\n### 用餐体验\\n工业风装修搭配暖黄色灯光，开放式厨房可观赏烹饪全过程。人均消费 ¥380-580，建议提前 3 天预约。曾获「年度最佳新餐厅」「黑珍珠一钻」等荣誉。",
  sampleFeatures: ["米其林主厨", "融合菜系", "人均 ¥380-580", "黑珍珠一钻", "需提前预约", "私人包厢可选"],
  sampleStats: [
    { title: "开业年限", value: "5", suffix: "年" },
    { title: "招牌菜", value: "32", suffix: "道" },
    { title: "座位数", value: "120", suffix: "位" },
    { title: "好评率", value: "4.8", suffix: "分" },
  ],
  sampleTableColumns: [
    { title: "菜品", dataIndex: "dish" },
    { title: "分类", dataIndex: "category" },
    { title: "价格", dataIndex: "price" },
    { title: "推荐度", dataIndex: "rating" },
  ],
  sampleTableRows: [
    { id: "1", dish: "黑松露和牛塔塔", category: "前菜", price: "¥188", rating: "★★★★★" },
    { id: "2", dish: "花雕醉蟹", category: "海鲜", price: "¥268", rating: "★★★★★" },
    { id: "3", dish: "柑橘慢煮鸭胸", category: "主菜", price: "¥228", rating: "★★★★☆" },
    { id: "4", dish: "海胆蟹肉烩饭", category: "主食", price: "¥168", rating: "★★★★★" },
    { id: "5", dish: "熔岩巧克力蛋糕", category: "甜品", price: "¥88", rating: "★★★★☆" },
    { id: "6", dish: "松茸清汤", category: "汤品", price: "¥128", rating: "★★★★☆" },
  ],
  sampleChartLabel: "各月客流量",
  sampleChartData: [
    { month: "1月", guests: 2800 }, { month: "2月", guests: 3200 }, { month: "3月", guests: 3500 },
    { month: "4月", guests: 3100 }, { month: "5月", guests: 3800 }, { month: "6月", guests: 4200 },
    { month: "7月", guests: 4000 }, { month: "8月", guests: 4500 },
  ],
};

const CONTENT_TEMPLATES: Record<string, TextContentTemplate> = {
  products: PRODUCT_CONTENT,
  technology: TECHNOLOGY_CONTENT,
  business: BUSINESS_CONTENT,
  food: FOOD_CONTENT,
};

/**
 * 根据搜索关键词匹配最相关的文本内容模板
 * 当所有文本搜索源都不可用时，提供结构化数据供 LLM 填充界面
 */
export function matchFallbackTextContent(query: string): TextContentTemplate | null {
  const lower = query.toLowerCase();
  const scores = Object.entries(KEYWORD_CATEGORIES).map(([category, keywords]) => {
    const score = keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    return { category, score };
  });
  scores.sort((a, b) => b.score - a.score);
  const bestCategory = scores[0]?.score > 0 ? scores[0].category : null;
  if (!bestCategory) return null;
  return CONTENT_TEMPLATES[bestCategory] ?? null;
}

// ===== 公开音频源（Audio 组件可用）=====
export const PUBLIC_AUDIO_SOURCES = [
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", label: "电子音乐 · SoundHelix" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", label: "管弦乐 · SoundHelix" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", label: "钢琴曲 · SoundHelix" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", label: "流行乐 · SoundHelix" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", label: "氛围音乐 · SoundHelix" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", label: "爵士乐 · SoundHelix" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", label: "摇滚乐 · SoundHelix" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", label: "舞曲 · SoundHelix" },
];
