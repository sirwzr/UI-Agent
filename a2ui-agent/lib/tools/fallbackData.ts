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
