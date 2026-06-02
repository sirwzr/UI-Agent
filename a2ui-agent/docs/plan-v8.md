# A2UI Agent v8 方案

**日期**: 2026-06-01
**状态**: 📋 方案阶段
**LLM**: 阿里云通义千问 (qwen-plus)

---

## 问题 1：历史对话记录无法打开

### 根因分析

`loadConversation(id)` 从 API 取到了 `currentConversationDetail.messages`，存入 Zustand，但 CopilotKit 的 `CopilotChat` 组件内部维护自己的消息状态。切换 `threadId={currentId}` 时，CopilotKit 从自己的 store 中查找该 thread 的消息，而不会从 Zustand 的 `currentConversationDetail` 同步。两个数据源是分离的：

- Zustand `currentConversationDetail.messages` ← API 加载的历史消息
- CopilotKit 内部 store ← Agent 运行时产生的消息

历史对话的消息只存在于 Zustand 中，CopilotKit 不知道它们的存在。

### 修复方案

在 `LeftPanel` 中，切换对话时通过 CopilotKit 的 API 将历史消息注入：

1. **方案 A（推荐）**：利用 CopilotKit `threadId` 机制，保证 threadId 和 conversationId 一致。CopilotKit v1.54+ 的 `CopilotChat` 组件在 `threadId` 变化时会自动加载该 thread 的消息。检查 `@copilotkit/runtime@1.59.0` 的 thread 管理 API。

2. **方案 B**：切换对话时，先 `loadConv(id)` 获取消息，然后用 `agent.setMessages()` 或类似 API 将历史消息注入 CopilotKit。

```tsx
// LeftPanel.tsx 修改思路
const handleSelectConversation = useCallback(async (id: string) => {
  await loadConv(id); // 加载历史消息到 Zustand
  // 将历史消息注入 CopilotKit
  const detail = useAppStore.getState().currentConversationDetail;
  if (detail?.messages) {
    agent.setMessages(detail.messages.map(m => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    })));
  }
}, [loadConv, agent]);
```

**涉及文件**：`components/layout/LeftPanel.tsx`

---

## 问题 2：模板错误 + 提示词模糊

### 根因分析

**2a. Statistic value 类型错误**

模板中 `Statistic` 组件的 `value` 使用字符串 `"1,234"`、`"89,200"`。虽然 Zod schema 允许 `z.union([z.string(), z.number()])`，但 Ant Design 的 `Statistic` 组件要求 `value: number | string`，格式化的逗号分隔字符串会被当作原始字符串渲染而不是数字。应该用纯数字。

**2b. 提示词不够精准**

当前模板 prompt 示例：
- ❌ "用户选择了数据仪表盘模板。请先询问用户想关注什么数据指标、偏好深色还是浅色风格" — 太泛
- ✅ 应该引导 Agent 问具体问题，并用 QuickActionRow 提供可选项

Agent 收到模糊 query 时（如用户说 "做个报表"），不知道该搜什么关键词。prompt 需要明确规定：**先拿到用户确认的具体主题 → 再构造搜索 query**。

### 修复方案

**2a.** 修复模板中所有 Statistic 的 value 为纯数字，format 逻辑由渲染层处理。

**2b.** 重写所有 12 个模板 prompt，每个 prompt 包含：
1. 用户意图描述（给 Agent 的上下文）
2. 必须追问的具体问题列表
3. 建议的 QuickActionRow 选项
4. 确认后的搜索 query 构造指引

示例 — 数据仪表盘重写：
```
用户选择了数据仪表盘模板。你需要：
1. 先用 QuickActionRow 询问仪表盘类型，提供选项：销售数据、系统监控、财务概览、用户分析
2. 用户选择后，追问风格偏好，提供选项：深色专业风、浅色企业风、极简浅色风
3. 用户确认后，构造搜索 query："{类型} {业务} dashboard metrics"
4. 调用 web_search → 反馈状态 → 渲染
```

**2c.** 模板的 Statistic value 修正：
- `"1,234"` → `1234`
- `"89,200"` → `89200`
- 同理修正所有模板中的数值

**涉及文件**：`lib/a2ui/templates.ts`、`lib/a2ui/render-surface.tsx`（Statistic 渲染加 format）

---

## 问题 3：基本使用场景崩溃

### 根因分析

用户说「我购买手机」→ Agent 不知道用户想做什么（是对比页？购买页？推荐页？），但系统 prompt 的「自动继续规则」又要求「搜索后必须立即生成」，导致 Agent 在不明确的情况下强制搜索 → 生成了一个不符合预期的页面 → 或者崩溃。

**核心矛盾**：规则 2（信息缺失必须追问）和自动继续规则（搜索后必须生成）之间的优先级不清晰。

### 修复方案

**3a.** 在 system prompt 中明确优先级：

```
## 规则优先级（从高到低）

1. 关键信息缺失 → 追问（规则 2）— 这是最高优先级
2. 信息完整 + 搜索完成 → 自动生成（自动继续规则）
3. 信息完整 + 无需搜索 → 直接生成

判断标准：如果用户的 query 可以提炼出一个具体的搜索关键词（如「红色运动鞋产品展示」→ "red sneakers product"），则信息完整。如果 query 无法提炼具体关键词（如「我购买手机」「做个东西」），则信息缺失，必须追问。
```

**3b.** 在 system prompt 中添加「搜索 query 构造规范」：

```
搜索前，先在心中确认：
1. 你有一个具体、可搜索的 query 字符串吗？（≥3 个词）
2. 这个 query 能返回相关结果吗？
3. 用户确认过这个方向吗？

如果以上 3 个问题任何一个答案是「否」，你应该先追问，而不是搜索。
```

**3c.** 添加超时和错误恢复：
- Qwen 搜索当前 8s 超时。如果超时，Agent 应立即用自身知识生成，不要卡住。
- 在 `_hint` 中明确：「如果搜索超时或失败，不要重复搜索，直接用 fallback 数据或自身知识生成。」

**涉及文件**：`lib/a2ui/prompts/system.ts`、`lib/tools/webSearch.ts`

---

## 问题 4：生成区按钮交互（参考 Stitch）

### 根因分析

当前交互模式：用户在聊天框输入文字 → Agent 响应。Stitch (stitch.money) 的模式是：生成的 UI 中的按钮/表单直接可用，用户点击后触发下一轮对话或操作，不需要切回聊天框。

A2UI 已有 QuickActionRow 组件提供可点击按钮，但使用不够充分：
- Agent 追问时，应该更多使用 QuickActionRow 而不是让用户打字
- 生成的结果中的 Button 应该能触发后续操作（修改、细化、导出等）
- 用户可以直接在生成区修改表单、切换 Tab，结果实时反馈

### 修复方案

**4a.** 增强 QuickActionRow 使用：
- 在 system prompt 中要求：每轮澄清对话必须用 QuickActionRow（≥3 个选项）
- 生成的界面中嵌入修改入口：QuickActionRow [修改配色, 添加数据, 导出, 满意]

**4b.** 生成区增加操作栏：
- 每个渲染的 Surface 下方添加操作按钮行
- 「修改内容」「更换风格」「展开详情」等
- 点击后自动触发 Agent 继续对话

**4c.** CenterPanel 增强：
- 渲染区底部添加固定操作栏
- 已完成生成的界面：显示 [满意 ✓] [修改配色] [调整布局] [重新生成]
- 点击任一按钮 → 调用 `agent.addMessage()` + `copilotkit.runAgent()`

**4d.** 前端 tools 增强：
- `get_render_state` tool 已经存在，Agent 可以感知当前界面状态
- 增强让 Agent 在修改时能参考当前界面

**涉及文件**：
- `lib/a2ui/prompts/system.ts` — QuickActionRow 使用规范
- `components/layout/CenterPanel.tsx` — 生成区操作栏
- `components/chat/A2UICustomRenderer.tsx` — 操作按钮回调

---

## 问题 5：CopilotKit 功能未充分利用

### 根因分析

当前架构使用：
- `@copilotkitnext/react@1.54.1` — 已 deprecated，部分功能不工作
- `@copilotkit/runtime@1.59.0` — 最新版，但 React 端没跟上

**缺失的功能**：
- **Threads 管理**：新版本 CopilotKit 内置 thread/对话管理，可以替代自建的 conversation 系统
- **前端 tools 不工作**：`useFrontendTool` 来自 deprecated 包，可能在新 runtime 下有兼容问题
- **useSingleEndpoint**：v1 的配置方式
- **Dev Console**：`showDevConsole` 功能可能不完整

### 修复方案

**5a. 评估 CopilotKit 最新版本**

检查 `@copilotkit/react` 是否已发布（之前 404），如果已发布则完成迁移。如果仍未发布，等待并暂时用现有版本。

**5b. 使用 CopilotKit threads 替代自建 conversation**

如果新版 CopilotKit 提供了 threads API：
- 简化 `useConversation` hook，直接映射到 CopilotKit threads
- 历史对话管理交给 CopilotKit
- 减少 Zustand store 中的对话状态

**5c. 修复前端 tools**

检查 `FrontendToolsProvider` 中的 `useFrontendTool` 和 `useAgentContext` 是否实际被 Agent 感知：
- 在 debug logs 中查看 Agent 是否收到前端 tool 注册
- 如果 deprecated 版本不兼容，降级 runtime 或升级 react 端

**5d. 开启 CopilotKit 内置功能**
- `showDevConsole` — 开发环境下显示 agent 状态
- Agent 状态指示器
- 消息流可视化

**涉及文件**：
- `package.json` — 版本对齐
- `components/AppProviders.tsx` — CopilotKitProvider 配置
- `components/chat/FrontendToolsProvider.tsx` — tool 注册
- `components/layout/LeftPanel.tsx` — CopilotChat 配置
- `app/api/copilotkit/[[...path]]/route.ts` — runtime 配置

---

## 问题 6：界面 Bug

### 6a. favicon.ico 404

**根因**：项目没有 `public/` 目录，Next.js 找不到 favicon.ico。

**修复**：
- 创建 `public/` 目录
- 添加 favicon.svg（内联 SVG，无需外部文件）
- 在 `layout.tsx` 的 metadata 中添加 icons 配置

### 6b. Antd React 19 兼容警告

**根因**：Ant Design 5 官方支持 React 16-18，React 19 的支持在 antd 5.x 中是实验性的。`antd v5 support React is 16 ~ 18` 警告是 antd 的兼容性检测。

**修复**：
- 这是 antd 的已知问题，不影响功能
- 等待 antd 5.24+ 或 antd 6 的 React 19 正式支持
- 可以在开发环境禁用此警告（不建议）

### 6c. Static message 警告

**根因**：在组件外部（`handleLocalAction` 函数）使用了静态 `message.xxx()`，而不是通过 `App.useApp()` hook 获取的 message 实例。静态方法无法访问 ConfigProvider 的 theme 上下文。

**修复**：
- 将 `message.info/success/warning` 调用移到组件内部，使用 `App.useApp()` hook
- 或者在 `A2UICustomRenderer` 中获取 `message` 实例并传递给 `handleLocalAction`

### 6d. 其他小问题

- **Fast Refresh 重建**：正常的开发行为，非 bug
- **AbortError: play() interrupted**：Carousel 组件的自动播放与页面切换冲突。可在 Carousel 渲染时加 `motion` 动画替代 autoplay，或在组件卸载时停止播放。

**涉及文件**：
- `public/favicon.svg` — 新建
- `app/layout.tsx` — icons metadata
- `components/chat/A2UICustomRenderer.tsx` — message hook 化
- `lib/a2ui/render-surface.tsx` — Carousel autoplay 修复

---

## 问题 7：搜索功能不可靠 — 查询构造 + 提示词 + 图片搜索全链路

### 根因分析

搜索是 A2UI Agent 的核心能力——没有好的搜索结果，界面内容就无源之水。当前搜索链路有 **4 层问题**：

---

**7a. Agent 不知道如何构造搜索 query（最关键）**

当前 system prompt 规定了「何时搜索」和「搜索后必须生成」，但**完全没有教 Agent 如何构造一个有效的搜索 query**。

用户输入 → Agent 构造 query → web_search → 返回结果

问题出在第二步。举例：

| 用户输入 | Agent 实际传的 query | 应该传的 query |
|---------|---------------------|---------------|
| 「我购买手机」 | `购买手机`（无意义的动词短语） | `智能手机 旗舰 产品展示` |
| 「做个报表」 | `报表`（太泛，搜不到有效内容） | `企业销售数据 dashboard` |
| 「推荐好吃的」 | `好吃的`（口语化，无搜索价值） | `美食推荐 热门餐厅` |
| 「北京天气」 | `北京天气`（还可以） | —（这个还行） |

Agent 把用户的原始口语直接当搜索 query 传给 web_search，没有做「意图→关键词」的转换。Qwen 的 `enable_search` 虽然会自动联网，但如果 query 本身质量差，搜索结果也不会好。

**根本原因**：system prompt 缺少「搜索 query 构造规范」——Agent 不知道该把用户的口语翻译成搜索引擎友好的关键词。

---

**7b. Qwen 搜索内部 prompt 太简单**

`webSearch.ts:searchViaQwen()` 中，给 Qwen 的系统提示是：

```
你是一个搜索助手。请用中文搜索以下关键词，返回5-8条最新信息。
每条信息包含：标题（简短准确）、URL（真实链接，如果不知道填"无"）、摘要（50-200字，包含具体数据和事实）。
请以JSON数组格式返回
```

问题：
- 没有告诉 Qwen **搜索策略**（优先搜索什么类型的内容、从哪些维度）
- 没有告诉 Qwen **结果筛选标准**（什么是高质量结果 vs 低质量）
- 没有告诉 Qwen **如果搜不到怎么办**（降级策略）
- 摘要要求「50-200字包含具体数据」但 Qwen 返回的 snippet 经常是泛泛的描述

---

**7c. 图片搜索 query 转换不够精准**

`pexelsSearch.ts` 的 `translateQuery()` + `enrichQuery()` 链路：

1. `translateQuery()` 做中文→英文关键词替换，覆盖约 100 个词。但：
   - 组合词可能被错误替换（如「红色运动鞋」→ "red 运动鞋" 因为「红色」不在映射表中）
   - 专有名词无映射（品牌名、地名、专业术语）
2. `enrichQuery()` 只加了几个通用后缀（`product photography`、`food photography`、`landscape photography`、`office workspace`、`technology`），很多场景没覆盖
3. **最大的问题**：如果 Pexels 返回 0 结果，Agent 不知道，也没有重试机制——直接 fallback 到 Unsplash 或本地图库

---

**7d. 缺少搜索策略分层**

当前 `web_search` tool 接受一个 `query` 参数，一次调用同时做图片搜索和文本搜索。但 Agent 可能需要：
- 用不同关键词分别搜图片和文本（图片搜英文效果好，文本搜中文效果好）
- 先搜一轮，根据结果决定是否需要更精确的第二轮搜索
- 对复杂页面（如仪表盘+产品展示混合），分主题搜索

当前 tool 不支持这些场景，Agent 也没有被教导这样做。

---

### 修复方案

**7a. System prompt 新增「搜索 query 构造规范」**

在 system prompt 中新增一整节：

```
## 搜索 query 构造规范（每次 web_search 前必须执行）

搜索结果的质量取决于 query 质量。你不能直接把用户的口语当 query 传给搜索引擎。

### 构造步骤

1. **提取核心名词**：从用户意图中提取 2-4 个核心关键词
   - 「我购买手机」→ 核心：智能手机、产品
   - 「做个报表」→ 核心：数据、dashboard、报表
   - 「推荐好吃的」→ 核心：美食、推荐、餐厅

2. **翻译为搜索语言**：
   - 动词去掉（"购买"→删除，"推荐"→删除）
   - 口语转书面（"好吃的"→"美食"，"东西"→"产品"）
   - 添加场景限定词（"产品展示"、"数据分析"、"dashboard"）

3. **中英混合策略**：
   - 图片搜索 Pexels 用英文效果好 → 传英文关键词（如 "smartphone product"）
   - 文本搜索千问用中文效果好 → 传中文关键词（如 "智能手机 产品 评测"）
   - query 用中英混合，让两个搜索源各取所需

4. **query 自检**：
   - ✓ 是否 ≥ 3 个词？
   - ✓ 是否包含具体名词（不是动词或虚词）？
   - ✓ 在搜索引擎中能否返回相关结果？

### 正确示例

| 用户说 | 正确 query |
|--------|-----------|
| 「我购买手机」 | `智能手机 产品展示 smartphone product` |
| 「做个报表」 | `企业数据仪表盘 business dashboard` |
| 「推荐好吃的」 | `美食推荐 人气餐厅 food cuisine` |
| 「我想看红色运动鞋」 | `红色运动鞋 产品 red sneakers product` |
| 「公司介绍页面」 | `企业介绍 公司简介 corporate about` |
```

---

**7b. 增强 Qwen 搜索 prompt**

重写 `searchViaQwen()` 中的 system prompt：

```typescript
// 改进后的 Qwen 搜索 system prompt
const SEARCH_SYSTEM_PROMPT = `你是一个专业搜索助手。请针对搜索关键词进行互联网搜索，返回高质量结果。

## 搜索策略
1. 优先搜索权威来源：官方网站、百科、知名媒体、行业门户
2. 如果关键词是产品类，搜索产品评测、参数、价格、用户评价
3. 如果关键词是数据类，搜索最新统计数据、行业报告、趋势分析
4. 如果关键词是美食/旅行类，搜索推荐榜单、攻略、评分

## 结果筛选标准
- 时效性：优先最近 1 年的信息
- 信息密度：包含具体数字、事实、案例的结果优先
- 避开：纯广告、低质量聚合站、过时信息

## 输出格式
返回 JSON 数组，每条包含：
- title: 简短准确的标题（≤30字）
- url: 真实链接，不知道填"无"
- snippet: 摘要 80-200 字，必须包含具体数据和事实，不要泛泛而谈

如果搜索结果质量不高或数量不足，在最后一条的 snippet 中标注 "[搜索建议：建议改用关键词 XXX 重新搜索]"

只返回 JSON 数组，不要返回其他文字。`;
```

同时在 `webSearch.ts` 的超时处理中增加重试逻辑：

```typescript
// 如果 Qwen 返回空或超时，用备用 query 重试一次
if (results.length === 0) {
  const retryQuery = query.split(" ").slice(0, 3).join(" "); // 简化 query 重试
  // ... retry logic
}
```

---

**7c. 增强图片搜索 query 转换**

1. **扩充中文→英文映射表**：补充缺失的颜色、品牌、专业术语
2. **增加 query 净化**：移除无搜索价值的词（"我"、"想"、"一个"、"的"、"吗"等停用词）
3. **Pexels 失败时的二次策略**：用同义词重新搜索，而不是直接 fallback Unsplash
4. **增加 `_imageHint` 返回值**：告诉 Agent 图片搜索用了什么 query、是否成功，Agent 可以在失败时用不同关键词重试

新增 `sanitizeQuery()` 函数：

```typescript
// 停用词过滤 + query 净化
const STOP_WORDS = /我|你|他|她|它|我们|你们|他们|想|要|一个|的|了|吗|吧|呢|啊|哦|嗯|是|在|有|和|与|或/g;

function sanitizeQuery(query: string): string {
  return query
    .replace(STOP_WORDS, "")
    .replace(/\s+/g, " ")
    .trim();
}
```

扩充 `CN_TO_EN_KEYWORDS` 映射表，补充分类：
- 颜色：红/黄/蓝/绿/紫/粉/黑/白/金/银
- 材质：金属/木质/玻璃/陶瓷/塑料/皮革
- 风格：简约/现代/古典/复古/工业/北欧/日式

---

**7d. 搜索策略分层（system prompt + tool 双改）**

在 system prompt 中增加多轮搜索能力说明：

```
### 多轮搜索策略

对于复杂需求，允许分步搜索：

1. **第一轮（主搜索）**：用核心关键词搜索，获取主要素材
2. **评估结果**：看 _searchStatus、_imageCount、_textAvailable
3. **第二轮（补充搜索，可选）**：如果某类素材不足，用不同角度关键词再次搜索
   - 例如第一轮搜 "smartphone product" 图片不够 → 第二轮搜 "mobile phone showcase"
   - 例如第一轮文本太少 → 第二轮用更具体的关键词

原则：最多 2 轮搜索，第 2 轮后不管结果如何，必须用已有素材生成界面。
```

在 `webSearchTool` 的 `_hint` 中增加重试建议：

```typescript
_hint: images.length < 3 && textMerge.results.length < 3
  ? `搜索结果偏少（图片:${images.length}, 文本:${textMerge.results.length}）。建议用不同角度关键词再搜一轮，或直接使用 _fallbackContent 生成。`
  : `搜索成功...`
```

---

**7e. 图片搜索增加结果质量反馈**

在 `webSearchTool` 返回值中增加图片搜索诊断信息：

```typescript
_imageDiagnostics: {
  originalQuery: effectiveQuery,
  pexelsQuery: enQuery,        // 实际发给 Pexels 的 query
  pexelsSuccess: pexelsResult.success,
  pexelsCount: pexelsResult.photos?.length ?? 0,
  usedFallback: images.length > 0 && pexelsCount === 0,
}
```

让 Agent 能感知图片搜索的实际效果，从而在下一轮调整策略。

---

### 涉及文件

| 文件 | 改动内容 |
|------|---------|
| `lib/a2ui/prompts/system.ts` | 新增「搜索 query 构造规范」+「多轮搜索策略」完整章节 |
| `lib/tools/webSearch.ts` | 重写 Qwen 搜索 system prompt + 超时重试 + 图片诊断信息 + `_hint` 增强 |
| `lib/tools/pexelsSearch.ts` | 新增 `sanitizeQuery()` + 扩充 CN_TO_EN_KEYWORDS（颜色/材质/风格）+ 同义词二次搜索 |
| `lib/a2ui/templates.ts` | 每个模板的 prompt 中加入该场景的搜索 query 示例 |

---

## 实施优先级

| 优先级 | 问题 | 影响范围 |
|--------|------|---------|
| **P0** | **问题 7 — 搜索全链路优化** | **所有功能的数据来源，最高优先级** |
| P0 | 问题 2 — 模板修复 + prompt 精准化 | 核心功能正确性 |
| P0 | 问题 3 — 模糊输入处理 + 崩溃修复 | 基本使用场景 |
| P1 | 问题 1 — 历史对话 | 用户体验 |
| P1 | 问题 4 — 生成区交互 | 用户体验 |
| P2 | 问题 5 — CopilotKit | 基础设施升级 |
| P3 | 问题 6 — 界面 bug | 视觉细节 |

---

## 预估改动量

| 文件 | 改动类型 |
|------|---------|
| `lib/a2ui/prompts/system.ts` | 重写规则优先级 + 搜索前置判断 + QuickActionRow 规范 + **搜索 query 构造规范 + 多轮搜索策略** |
| `lib/a2ui/templates.ts` | 12 模板 prompt 重写 + Statistic value 修复 + **搜索 query 示例** |
| `lib/tools/webSearch.ts` | 超时恢复 hint 优化 + **重写 Qwen 搜索 prompt + 超时重试 + 图片诊断** |
| `lib/tools/pexelsSearch.ts` | **新增 sanitizeQuery + 扩充关键词映射表 + 同义词重试** |
| `components/layout/LeftPanel.tsx` | 历史消息注入 |
| `components/layout/CenterPanel.tsx` | 生成区操作栏 |
| `components/chat/A2UICustomRenderer.tsx` | message hook + 操作回调 |
| `app/layout.tsx` | icons metadata |
| `public/favicon.svg` | 新建 |
