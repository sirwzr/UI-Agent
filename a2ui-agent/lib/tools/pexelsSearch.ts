// ===== Pexels API 搜索模块 =====
// 提供真实照片和视频搜索，免费额度 200 req/hr + 20,000/月
// Pexels 失败时回退到 Unsplash Source API（免费，无需 key）
// 内置中文→英文关键词翻译，提升 Pexels 匹配精度

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
  };
  alt: string;
  avg_color: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: { name: string; url: string };
  video_files: { quality: string; width: number; height: number; link: string }[];
}

export interface SearchPhotoResult {
  url: string;
  photographer: string;
  width: number;
  height: number;
  avgColor: string | null;
  alt: string;
}

export interface SearchVideoResult {
  url: string;
  duration: number;
  width: number;
  height: number;
  poster: string;
}

const PEXELS_PHOTOS_URL = "https://api.pexels.com/v1/search";
const PEXELS_VIDEOS_URL = "https://api.pexels.com/videos/search";

// ===== 中文→英文关键词翻译映射 =====
// Pexels 对英文 query 匹配效果更好，中文 query 常返回不相关结果
const CN_TO_EN_KEYWORDS: Record<string, string> = {
  // 商务/办公
  "商务": "business",
  "办公": "office workspace",
  "会议": "meeting conference",
  "团队": "team collaboration",
  "企业": "corporate enterprise",
  "领导": "leadership",
  "谈判": "business negotiation",
  "签约": "contract signing",
  // 科技
  "科技": "technology",
  "数码": "digital electronics",
  "电子": "electronics",
  "电脑": "computer laptop",
  "手机": "smartphone mobile",
  "耳机": "headphones",
  "智能": "smart device",
  "芯片": "computer chip",
  "数据": "data analytics",
  "代码": "code programming",
  "编程": "coding software",
  "服务器": "server rack",
  "网络": "network internet",
  "AI": "artificial intelligence",
  "机器人": "robot automation",
  // 产品/商品
  "产品": "product",
  "商品": "product merchandise",
  "鞋": "shoes sneakers",
  "运动鞋": "sneakers",
  "衣服": "clothing fashion",
  "手表": "wristwatch luxury watch",
  "包包": "handbag luxury bag",
  "香水": "perfume fragrance",
  "化妆品": "cosmetics makeup",
  "珠宝": "jewelry",
  "眼镜": "eyeglasses sunglasses",
  "家具": "furniture interior",
  // 美食
  "美食": "food cuisine",
  "菜谱": "recipe cooking",
  "食谱": "recipe food",
  "餐厅": "restaurant dining",
  "食物": "food dish",
  "烹饪": "cooking culinary",
  "水果": "fresh fruit",
  "甜点": "dessert pastry",
  "咖啡": "coffee cafe",
  "茶": "tea",
  "披萨": "pizza",
  "寿司": "sushi japanese",
  "面包": "bread bakery",
  "牛排": "steak",
  "沙拉": "salad healthy food",
  // 自然/旅行
  "自然": "nature landscape",
  "风景": "landscape scenery",
  "山水": "mountain lake",
  "森林": "forest woods",
  "海": "ocean sea beach",
  "日落": "sunset",
  "日出": "sunrise",
  "花园": "garden flowers",
  "山": "mountain",
  "湖": "lake",
  "河流": "river",
  "瀑布": "waterfall",
  "沙漠": "desert",
  "雪": "snow winter",
  // 人物
  "人物": "people portrait",
  "肖像": "portrait",
  "头像": "portrait face",
  "用户": "person user",
  "模特": "model fashion",
  "女性": "woman female",
  "男性": "man male",
  "儿童": "children kids",
  "老人": "elderly senior",
  "家庭": "family",
  // 建筑/城市
  "建筑": "architecture building",
  "城市": "city urban",
  "街道": "street urban",
  "夜景": "night cityscape",
  "交通": "traffic transportation",
  "桥": "bridge",
  // 健康/医疗
  "健康": "health wellness",
  "医疗": "medical healthcare",
  "医院": "hospital clinic",
  "运动": "sports exercise",
  "健身": "fitness gym workout",
  "瑜伽": "yoga meditation",
  // 教育
  "教育": "education learning",
  "学校": "school classroom",
  "图书馆": "library books",
  "毕业": "graduation ceremony",
  "书": "books reading",
  // 金融
  "金融": "finance banking",
  "银行": "bank",
  "投资": "investment trading",
  "股票": "stock market trading",
  "保险": "insurance",
  "财务": "finance accounting",
  // 抽象概念
  "成功": "success achievement",
  "创新": "innovation creative",
  "未来": "future concept",
  "安全": "security protection",
  "环保": "environmental green",
  "能源": "energy power",
  "物流": "logistics warehouse",
  "制造": "manufacturing factory",
  "农业": "agriculture farming",
  // 颜色
  "红色": "red",
  "红": "red",
  "蓝色": "blue",
  "蓝": "blue",
  "绿色": "green",
  "绿": "green",
  "黄色": "yellow",
  "黄": "yellow",
  "紫色": "purple",
  "紫": "purple",
  "粉色": "pink",
  "粉": "pink",
  "黑色": "black",
  "黑": "black dark",
  "白色": "white",
  "白": "white",
  "金色": "gold golden",
  "金": "gold",
  "银色": "silver",
  "银": "silver",
  "灰色": "gray grey",
  "灰": "gray",
  "橙色": "orange",
  "橙": "orange",
  "棕色": "brown",
  "棕": "brown",
  // 材质
  "金属": "metal metallic",
  "木质": "wood wooden",
  "木": "wood",
  "玻璃": "glass",
  "陶瓷": "ceramic porcelain",
  "塑料": "plastic",
  "皮革": "leather",
  "皮": "leather",
  "大理石": "marble",
  "不锈钢": "stainless steel",
  "铝": "aluminum",
  "碳纤维": "carbon fiber",
  // 风格
  "简约": "minimalist simple",
  "现代": "modern contemporary",
  "古典": "classic vintage",
  "复古": "retro vintage",
  "工业风": "industrial style",
  "北欧风": "scandinavian nordic",
  "日式": "japanese style",
  "中式": "chinese traditional",
  "豪华": "luxury premium",
  "极简": "minimalist clean",
  "科技感": "futuristic tech",
  "可爱": "cute kawaii",
  "优雅": "elegant sophisticated",
};

/**
 * 查询增强：根据查询主题添加质量修饰词，提升 Pexels 返回图片的相关性和质量
 */
function enrichQuery(query: string): string {
  const lower = query.toLowerCase();
  // 产品类查询 → 加 "product photography studio" 提升商业摄影质量
  if (/product|产品|商品|shop|store|shoes|watch|bag|clothing|fashion|cosmetics|makeup|perfume|jewelry/.test(lower)) {
    return `${query} product photography`;
  }
  // 食物类 → 加 "food photography" 提升美食摄影质量
  if (/food|recipe|cook|restaurant|美食|菜谱|食谱|餐厅|烹饪|甜点|咖啡/.test(lower)) {
    return `${query} food photography`;
  }
  // 风景类 → 加 "landscape photography" 提升风景摄影质量
  if (/nature|landscape|mountain|beach|forest|sunset|自然|风景|山水|森林|海|日落/.test(lower)) {
    return `${query} landscape photography`;
  }
  // 商务/办公类 → 加 "office workspace"
  if (/business|office|corporate|enterprise|商务|办公|企业|会议/.test(lower)) {
    return `${query} office workspace`;
  }
  // 科技类 → 加 "technology"
  if (/tech|code|server|software|technology|科技|技术|电脑|编程/.test(lower)) {
    return `${query} technology`;
  }
  // 人物/肖像类 → 加 "portrait photography"
  if (/portrait|人物|肖像|头像|模特|people|person|model/.test(lower)) {
    return `${query} portrait photography`;
  }
  // 建筑/室内 → 加 "architecture interior"
  if (/architecture|建筑|室内|interior|房间|装修|house|home/.test(lower)) {
    return `${query} architecture interior`;
  }
  // 健康/运动 → 加 "fitness health"
  if (/健康|医疗|运动|健身|瑜伽|health|fitness|yoga|exercise|sport/.test(lower)) {
    return `${query} fitness health`;
  }
  // 教育 → 加 "education learning"
  if (/教育|学校|图书馆|书|学习|education|school|library|book|learning/.test(lower)) {
    return `${query} education learning`;
  }
  return query;
}

// 无搜索价值的停用词，查询前剥离
const QUERY_STOP_WORDS = /我|你|他|她|它|我们|你们|他们|想|要|一个|一张|一些|一下|这个|那个|哪个|怎么|什么|如何|做|搞|弄|给|帮|让|来|去|的|了|吗|吧|呢|啊|哦|嗯|是|在|有|和|与|或|可以|能|会|请|帮忙/g;

function sanitizeQuery(query: string): string {
  return query
    .replace(QUERY_STOP_WORDS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function translateQuery(query: string): string {
  let translated = query;
  // 按 key 长度从长到短排序，避免短词先匹配破坏长词
  const entries = Object.entries(CN_TO_EN_KEYWORDS).sort((a, b) => b[0].length - a[0].length);

  for (const [cn, en] of entries) {
    if (query.includes(cn)) {
      translated = translated.replace(cn, en);
    }
  }

  // 移除残留中文标点和空格
  translated = translated.replace(/[，。！？、；：""''（）【】《》\s]+/g, " ").trim();

  // 如果翻译后无中文字符，返回增强后的英文查询
  const hasChinese = /[一-鿿]/.test(translated);
  if (!hasChinese) return enrichQuery(translated);

  // 仍有中文 → 中英混合查询 + 增强
  return enrichQuery(translated);
}

function getApiKey(): string | null {
  return process.env.PEXELS_API_KEY ?? null;
}

async function searchUnsplashSource(query: string, count = 10): Promise<SearchPhotoResult[]> {
  try {
    const results: SearchPhotoResult[] = [];
    for (let i = 0; i < count; i++) {
      results.push({
        url: `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(query)}&sig=${i}`,
        photographer: "Unsplash",
        width: 800,
        height: 600,
        avgColor: null,
        alt: `${query} 相关图片`,
      });
    }
    return results;
  } catch {
    return [];
  }
}

export interface PexelsPhotoResult {
  success: true;
  photos: SearchPhotoResult[];
  /** 实际发给 Pexels 的英文 query（供诊断） */
  pexelsQuery: string;
}

export async function searchPexelsPhotos(
  query: string,
  perPage = 10,
): Promise<PexelsPhotoResult | { success: false; error: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    const photos = await searchUnsplashSource(query, perPage);
    return { success: true, photos, pexelsQuery: query };
  }
  const key = apiKey; // TypeScript narrowing for closure

  // 先净化 query（剥离停用词如"我""想""的"等）
  const cleanQuery = sanitizeQuery(query) || query;

  // 翻译 + 增强为英文 query
  const enQuery = translateQuery(cleanQuery);

  async function tryFetch(q: string): Promise<SearchPhotoResult[] | null> {
    try {
      const url = `${PEXELS_PHOTOS_URL}?query=${encodeURIComponent(q)}&per_page=${perPage}&locale=zh-CN`;
      const res = await fetch(url, {
        headers: { Authorization: key },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { photos: PexelsPhoto[] };
      const photos = (data.photos ?? []).map((p) => ({
        url: p.src.large,
        photographer: p.photographer,
        width: p.width,
        height: p.height,
        avgColor: p.avg_color ?? null,
        alt: p.alt,
      }));
      return photos.length > 0 ? photos : null;
    } catch {
      return null;
    }
  }

  // 生成同义词备用 query（取前几个核心词组合）
  function altQuery(q: string): string {
    const words = q.split(" ").filter((w) => w.length > 2);
    if (words.length <= 2) return q;
    // 换一种词序或用前 3 个词
    return words.slice(0, 4).join(" ");
  }

  // 英文 query 优先
  if (enQuery !== cleanQuery) {
    const enResults = await tryFetch(enQuery);
    if (enResults) return { success: true, photos: enResults, pexelsQuery: enQuery };

    // 同义词重试：换一种组合
    const alt = altQuery(enQuery);
    if (alt !== enQuery) {
      const altResults = await tryFetch(alt);
      if (altResults) return { success: true, photos: altResults, pexelsQuery: alt };
    }
  }

  // 回退中文 query
  const cnResults = await tryFetch(cleanQuery);
  if (cnResults) return { success: true, photos: cnResults, pexelsQuery: cleanQuery };

  // 中文 query 同义词重试
  const altCn = altQuery(cleanQuery);
  if (altCn !== cleanQuery) {
    const altCnResults = await tryFetch(altCn);
    if (altCnResults) return { success: true, photos: altCnResults, pexelsQuery: altCn };
  }

  // 最终回退 Unsplash
  const photos = await searchUnsplashSource(cleanQuery, perPage);
  return { success: true, photos, pexelsQuery: cleanQuery };
}

export interface PexelsVideoResult {
  success: true;
  videos: SearchVideoResult[];
  pexelsQuery: string;
}

export async function searchPexelsVideos(
  query: string,
  perPage = 5,
): Promise<PexelsVideoResult | { success: false; error: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, error: "PEXELS_API_KEY 未配置" };
  }
  const key = apiKey; // TypeScript narrowing for closure

  const cleanQuery = sanitizeQuery(query) || query;
  const enQuery = translateQuery(cleanQuery);

  async function tryFetch(q: string): Promise<SearchVideoResult[] | null> {
    try {
      const url = `${PEXELS_VIDEOS_URL}?query=${encodeURIComponent(q)}&per_page=${perPage}`;
      const res = await fetch(url, {
        headers: { Authorization: key },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { videos: PexelsVideo[] };
      const videos = (data.videos ?? []).map((v) => {
        const best =
          v.video_files.find((f) => f.quality === "hd") ??
          v.video_files.find((f) => f.quality === "sd") ??
          v.video_files[0];
        return {
          url: best?.link ?? v.url,
          duration: v.duration,
          width: best?.width ?? v.width,
          height: best?.height ?? v.height,
          poster: v.image,
        };
      });
      return videos.length > 0 ? videos : null;
    } catch {
      return null;
    }
  }

  if (enQuery !== cleanQuery) {
    const enResults = await tryFetch(enQuery);
    if (enResults) return { success: true, videos: enResults, pexelsQuery: enQuery };
  }

  const cnResults = await tryFetch(cleanQuery);
  if (cnResults) return { success: true, videos: cnResults, pexelsQuery: cleanQuery };

  return { success: false, error: "Pexels Videos 无结果" };
}
