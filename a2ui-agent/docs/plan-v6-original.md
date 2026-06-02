# A2UI Agent v6 方案（修订版·终稿）

**日期**: 2026-05-29
**状态**: ✅ 已确认，待实施
**基于**: GPT-4o Canvas / Gemini 3 Pro Generative UI / Claude Artifacts & Design / v0.dev / Bolt.new / Lovable 产品分析 + 补充技术调研文档

---

## 一、竞品分析摘要

### 1.1 三大模型 UI 生成方案

| 维度 | **Gemini 3 Pro** Generative UI | **Claude** Artifacts / Design | **GPT-4o** Canvas |
|------|------|------|------|
| **核心理念** | 为每个 prompt 动态生成定制 UI | 分离持久化工作空间，支持迭代 | 双屏：对话 + 可编辑文档/代码 |
| **输出形式** | 声明式 JSON（A2UI 协议）→ 原生渲染 | HTML/React 组件（沙箱 iframe） | 文档/代码编辑（非 UI 生成） |
| **质量保证** | **后处理管道**纠正布局和事实错误 | **Evaluator-Generator 循环**（多 Agent 迭代） | 无自动化 QA |
| **用户偏好** | **90%** 偏好生成 UI 超过传统网站 | — | — |
| **关键启示** | 与本项目最可比，同用 A2UI 协议 | 品牌导入 + 设计 Token 自动提取 | 双屏协作模式 |

### 1.2 三大 AI 原型工具

| 维度 | **v0.dev** (Vercel) | **Bolt.new** (StackBlitz) | **Lovable** |
|------|------|------|------|
| **成功关键** | **设计系统约束** (shadcn/ui) → 质量保证 | **速度** (<5分钟原型) | **精致度**最高，像成品 |
| **共同局限** | 60-70% 法则——复杂逻辑需人工介入 | 同左 | 同左 |
| **2026 趋势** | 流程画布 + 批量生成保证多页面一致性 | — | — |
| **关键启示** | 约束 > 自由度 | 用户体验 = 速度 + 质量 | 细节决定满意度 |

### 1.3 Gemini API 切换说明

项目已内置 Gemini 支持（`createGoogleGenerativeAI`），切换方式：

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=你的key（从 https://aistudio.google.com/apikey 获取）
GEMINI_MODEL=gemini-2.5-flash   # 免费 1,500次/天
```

Gemini 对 A2UI 协议原生友好，推荐测试使用。

---

## 二、用户决策记录

| 问题 | 选择 | 含义 |
|------|------|------|
| Q1: 对话流程 | **B — 智能判断** | 简单需求直接生成；关键信息缺失时**必须**询问；联网搜索无论成败**必须**反馈状态 |
| Q2: 导出功能 | **C — 暂不做** | 本轮不实现导出，聚焦核心体验 |
| Q3: 设计 Token | **B — 完整版** | 独立 `design-tokens.ts` + TypeScript 类型 + 按页面类型自动组合 |
| 扩展性 | **高优先级** | 支持自定义组件注册 + 外部系统接入 |

---

## 三、修订后的 Issue 清单

### Issue 1: 数据源策略 + 搜索修复

**设计原则**: LLM 知识为体，工具搜索为用，状态透明反馈

**具体改动（4 项）**:

1. **数据分层标记**
   - LLM 生成内容 → `source: "model_knowledge"`（界面中弱提示「基于 AI 知识生成」）
   - 工具返回数据 → `source: "verified"`（如天气、位置）
   - System prompt 中明确指令：「对于实时数据（天气、新闻、股价），必须调用工具获取。对于常识性内容（产品描述、历史背景），使用你的知识，但标注为 AI 生成」

2. **搜索状态必须反馈给用户**（Q1 要求）
   - 搜索成功 → Agent 在生成前告知「已获取到 N 张图片，Y 条文本信息」
   - 搜索失败 → Agent 告知「当前网络搜索不可用，将使用 AI 知识生成内容」
   - 搜索部分可用 → 告知「图片已获取，文本搜索暂不可用，文字内容基于 AI 知识」

3. **Pexels 中文→英文翻译层**
   - 在 `pexelsSearch.ts` 添加关键词翻译映射表
   - 中文通用词 → 英文 Pexels 友好词（如「商务会议」→「business meeting」）
   - 保留原中文 query 作为 fallback

4. **Bing Search API**（备选，可选配置）
   - 搜索优先级：Tavily → DuckDuckGo → Bing → LLM 知识兜底
   - 配置路径：`.env.local` → `BING_API_KEY`
   - 竞速模式：任一源返回即用，不等待全部完成

### Issue 2: 内容密度 + 设计系统约束

**设计原则**: 设计系统约束 > 自由度（v0.dev 启示），密度按页面类型推荐

**具体改动（5 项）**:

1. **设计 Token 系统**（新文件 `lib/a2ui/design-tokens.ts`）
   - 定义完整 TypeScript 类型：`primaryColor`, `bgColor`, `textPrimary`, `textSecondary`, `borderColor`, `spacing`, `fontSize`, `borderRadius`, `shadow`
   - 按页面类型自动组合 Token（不硬编码 5 套配色）
   - 示例映射：
     ```
     dashboard  → 深色底(#0f172a) + 青蓝强调(#06b6d4) + 紧凑间距(12px) + 数据大字号
     product    → 白色底(#fff) + 品牌主色 + 宽松间距(20px) + 大图突出
     landing    → 渐变 Hero + 中性底(#f8fafc) + 宽松间距(24px) + 彩色 CTA
     form       → 白色卡片 + 柔和阴影 + 居中窄宽(600px) + 品牌蓝按钮
     datamanage → 浅灰底(#f8fafc) + 紧凑间距(8px) + 功能性蓝 + 小字号表格
     social     → 暖色底(#fefce8) + 圆角(12px) + 圆形头像
     ```

2. **布局模式 JSON 骨架**（System Prompt 中注入）
   ```
   模式 A「仪表盘」  : Column(StatisticRow×4 + ChartRow(2Chart) + Table(6+行) + Timeline)
   模式 B「产品页」  : Column(Carousel(3-5图) + Card(Text+RichText(100+字)+Rating+Actions))
   模式 C「落地页」  : Column(Hero(Card) + StatisticRow×3 + CollapsibleSection(FAQ) + CTA)
   模式 D「数据管理」: Column(SearchBar + TagRow(3-6标签) + Table(6+行) + Pagination)
   ```

3. **组件密度按页面类型推荐**（替代全局 15-30）
   - 仪表盘/监控 → 18-28 组件
   - 产品展示 → 12-18 组件
   - 表单/问卷 → 8-15 组件
   - 落地页 → 10-16 组件
   - 数据管理 → 15-25 组件

4. **数据充足性规则增强**
   - Table ≥ 6 行，Chart ≥ 8 数据点，RichText ≥ 100 字
   - 每个页面**至少 3 个内容区块**
   - Statistic 组件**必须带 trend 箭头**，否则无意义

5. **Few-shot 示例增强**
   - 每个布局模式提供 1 个完整 JSON 示例（展示「充足数据」的样子）
   - 示例包含真实的数据量（6 行表格，8 点趋势图，100 字富文本）

### Issue 3: 对话流程简化 + 智能判断

**设计原则**: 宁可生成后修改，不要生成前追问；关键信息缺失必须询问；搜索状态必须反馈

**具体改动（5 项）**:

1. **三级智能判断机制**（Q1-B 选择）
   ```
   用户需求明确（有具体产品/页面类型/风格）
     → 直接生成，告知数据来源状态
   
   用户需求模糊但有方向（"做个看板"）
     → 1 轮 QuickActionRow 澄清（页面类型/风格偏好）
     → 生成
   
   关键信息未知（"帮我做公司的销售报表"——不知道公司名）
     → 必须追问（"请问公司名称或行业？"）
     → 禁止编造
   
   搜索状态无论成败都要反馈
     → 生成前：「已获取到 5 张图片，文本搜索暂不可用，将使用 AI 知识生成内容」
   ```

2. **CenterPanel prompt 包装处理**
   - 移除 `handlePromptSelect` 中的额外指令包装
   - 模板 `prompt` 字段直接作为 Agent 输入，不追加任何指令

3. **模板 Prompt 重写**（12 个模板）
   - 改写为「用户口吻的明确需求描述」，自带足够上下文
   - 示例（产品展示页）：
     ```
     原: "创建一个产品展示页。告诉我想展示什么类型的产品..."
     新: "我想展示一款高端智能手表。包含：产品轮播图、核心功能描述、
          价格展示、用户评分。风格：深色科技风。请直接生成。"
     ```

4. **反假设规则加强**
   - 追加具体反例到 system prompt：
     ```
     ❌ 禁止: "贵公司 Acme Inc 的销售数据..."（编造公司名）
     ❌ 禁止: "您作为电商运营总监..."（编造用户职位）
     ❌ 禁止: "根据您所在的上海市场..."（未获取位置就假设城市）
     ✅ 正确: "以下是产品展示页，数据为示例数据"
     ```

5. **搜索状态反馈指令**（Q1 要求）
   - Prompt 中增加：「每次搜索后，用 RichText 简短告知用户搜索状态」
   - 成功：「已获取到相关图片和数据 ✓」
   - 失败：「当前网络搜索不可用，内容基于 AI 知识生成 ⚠️」

### Issue 4: 动态设计 Token 系统（完整版）

**设计原则**: 从 5 套静态配色升级为完整的 TypeScript 类型系统 + 按页面类型自动组合

**具体改动（3 项）**:

1. **Design Token 引擎**（新文件 `lib/a2ui/design-tokens.ts`）
   ```typescript
   type PageType = 'dashboard' | 'product' | 'landing' | 'form' | 'datamanage' | 'social' | 'custom';

   interface DesignTokens {
     primaryColor: string;
     bgColor: string;
     bgSecondary: string;
     textPrimary: string;
     textSecondary: string;
     borderColor: string;
     spacing: { section: number; item: number; page: number };
     fontSize: { h1: number; h2: number; body: number; caption: number };
     borderRadius: number;
     shadow: string;
     chartColors: string[];
   }

   function getTokensForPageType(type: PageType, overrides?: Partial<DesignTokens>): DesignTokens;
   function dynamicTokensFromUserInput(userInput: string): Partial<DesignTokens>;
   ```

2. **System Prompt 中注入 Token 选择指令**（替代硬编码配色表）
   - 注入页面类型→配色映射规则
   - 允许 Agent 根据用户输入动态调整（如「我喜欢绿色」→ 自动生成绿色系 Token）
   - Token 作为 `render_a2ui` 调用时的 context 参数传入

3. **Route 层注入**
   - 在 `route.ts` 中将 design tokens 作为 Agent 的附加 context
   - 不在 system prompt 中硬编码色值，而是注入选择规则

### Issue 5: 质量保证自动化

**设计原则**: Gemini 的后处理管道 + Claude 的 Evaluator 循环 → Server 端校验

**具体改动（3 项）**:

1. **Server 端输出校验**（新文件 `lib/a2ui/validate-output.ts`）
   ```typescript
   interface ValidationResult {
     pass: boolean;
     warnings: string[];
     errors: string[];
   }
   
   function validateA2UIOutput(components: A2UIComponent[], pageType: string): ValidationResult;
   // 校验项:
   // - 组件数量 ≥ 页面类型最小值
   // - 图片 URL 来自允许域名 (pexels.com, unsplash.com, picsum.photos)
   // - 表格数据行数 ≥ 6
   // - Chart 数据点 ≥ 8
   // - 不存在编造的 URL 域名
   // - root 组件必须存在
   ```

2. **Playwright MCP 自动化截图**
   - 配置于 `.mcp.json`
   - 可选：生成后自动截图 + 检测明显布局问题（溢出、截断）
   - 作为开发/调试工具，不在生产环境强制运行

3. **日志增强**
   - 校验结果写入 debug 日志
   - 校验失败不阻断生成，只追加 warning 到返回结果

### Issue 6: 系统扩展性

**设计原则**: 组件注册标准化 + 工具接入标准化 + 配置外部化

**具体改动（3 项）**:

1. **组件注册标准化文档 + 脚手架**
   - 新建 `lib/a2ui/component-registry.ts` — 统一组件注册入口
   - 三步注册流程标准化：`Zod Schema → catalog-definitions.ts → render-surface.tsx`
   - 每个新增组件附带 checklist 注释模板

2. **工具接入标准化**
   - 新建 `lib/tools/index.ts` — 统一工具注册入口
   - 当前工具：`webSearch`, `locationSearch`, `weatherSearch`
   - 新增工具只需：创建文件 → 在 `index.ts` 注册 → 在 `route.ts` 的 `tools` 数组中添加
   - 预留接口：用户可以添加自定义 API（如 CRM、数据库查询）

3. **Prompt 模板外部化**
   - System prompt 结构保持不变，但关键规则抽取为独立常量
   - 设计 Token 映射规则从 `design-tokens.ts` 读取，而非硬编码
   - 模板 Prompt 独立于组件逻辑，便于非开发人员修改

---

## 四、文件变更清单（终稿）

| 操作 | 文件 | Issue |
|------|------|-------|
| 修改 | `lib/a2ui/prompts/system.ts` | 1, 2, 3, 4 |
| 修改 | `lib/tools/webSearch.ts` | 1 |
| 修改 | `lib/tools/pexelsSearch.ts` | 1 |
| **新建** | `lib/a2ui/design-tokens.ts` | 2, 4 |
| **新建** | `lib/a2ui/validate-output.ts` | 5 |
| **新建** | `lib/a2ui/component-registry.ts` | 6 |
| 修改 | `lib/a2ui/templates.ts` | 3 |
| 修改 | `lib/a2ui/prompts/examples.ts` | 2 |
| 修改 | `components/layout/CenterPanel.tsx` | 3 |
| 修改 | `app/api/copilotkit/[[...path]]/route.ts` | 1, 4, 5, 6 |
| 修改 | `.env.example` | 1 |
| **新建** | `lib/tools/index.ts` | 6 |

**总计: 4 新建 + 7 修改 = 11 文件**

---

## 五、实施顺序

```
Step 1: 数据源 + 搜索修复 (Issue 1)
   → webSearch.ts（搜索状态反馈 + Bing + 竞速模式）
   → pexelsSearch.ts（中文→英文翻译层）
   → system.ts（数据分层标记指令 + 搜索状态反馈指令）
   → .env.example（BING_API_KEY）

Step 2: 对话流程简化 (Issue 3) — 最高优先级
   → CenterPanel.tsx（移除 prompt 包装）
   → templates.ts（12 个模板 prompt 重写）
   → system.ts（三级智能判断 + 反假设规则加强）

Step 3: 设计 Token 系统 (Issue 2, 4)
   → design-tokens.ts（新建，完整 TypeScript 类型）
   → system.ts（注入 Token 选择规则，移除硬编码色值）
   → examples.ts（每个布局模式 1 个完整 JSON 示例）
   → route.ts（Token context 注入）

Step 4: 质量保证 + 扩展性 (Issue 5, 6)
   → validate-output.ts（新建，Server 端校验）
   → component-registry.ts（新建，标准化注册入口）
   → tools/index.ts（新建，统一工具注册）
   → route.ts（集成校验 + 工具注册）
```

---

## 六、验证清单

1. `npx tsc --noEmit` — 零错误
2. 模板点击 → 简单需求直接生成，模糊需求先澄清
3. Agent 不编造用户公司名/位置/行业
4. 搜索状态在生成前可见反馈
5. 生成页面组件数按类型达标
6. 连续 3 个不同页面类型使用不同设计 Token
7. 新增一个自定义组件仅需 3 步（Schema → Catalog → Renderer）
8. Gemini API Key 替换后可正常运行
