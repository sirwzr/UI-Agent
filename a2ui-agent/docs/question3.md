# Round 3 — 交互逻辑与数据质量 (7 项)

**日期**: 2026-05-27 ~ 2026-05-28
**状态**: ✅ 已修复

---

## 问题清单

### 1. 联网搜索不可靠 — 基本日期/新闻无法搜索到

**现象**: 用户要求「显示今日新闻」或「最新数据」时，搜索不到任何实质性信息。

**根因**: 文本搜索后端（Tavily/DuckDuckGo）均从中国不可用。DeepSeek LLM 有训练数据但 prompt 没有给它足够的动力和指引去生成详细的事实性内容。

**修复**:
- `webSearch.ts` 完全重写：图片优先，文本搜索使用 `Promise.race` 2.5s 总超时
- 返回 `_textAvailable: boolean` + `_hint` 告知 LLM 用自身知识
- System prompt 规则重写：LLM 知识定位从「备选」升级为「主要数据源」
- System prompt 添加 7 条数据规则（最高优先级）

**涉及文件**: `lib/tools/webSearch.ts`, `lib/a2ui/prompts/system.ts`

---

### 2. 右边生成区交互按键无法使用 + 假设用户场景

**现象**: 界面上的按钮（QuickActionRow、Button）点不动。Agent 还会编造用户场景（假设用户在北京、假设用户是电商公司）。

**根因**:
- Agent 引用在 activity renderer 的 props 中可能为 null
- System prompt 虽有「禁止假设」但措辞不够强硬，LLM 容易忽略

**修复**:
- 模块级 agent 缓存：`cachedAgent` / `cachedCopilotkit` 确保按钮始终有回调
- 三级降级获取：`agent ?? cachedAgent ?? copilotkit.agent`
- 强化 system prompt 反假设规则（用反例说明什么不能做）

**涉及文件**: `components/chat/A2UICustomRenderer.tsx`, `lib/a2ui/prompts/system.ts`

---

### 3. 新建对话后右边界面不更新 + 对话/历史交互逻辑混乱

**现象**: 用户点击「新建对话」→ 右侧面板仍显示旧对话的生成内容。切换历史对话也是同样问题。

**根因**: React 组件没有感知到「对话已切换」事件。Zustand store 的 `currentConversationId` 变了，但 `CenterPanel` 没有重新挂载。

**修复**:
- Zustand store 新增 `conversationVersion: number`
- `goHome()`、`createConversation()`、`loadConversation()` 都递增 `conversationVersion`
- CenterPanel 的 `<Content key={conversationVersion}>` 强制重新挂载
- 以上三个操作同时清空 `surfaces: []` 和 `agentError: null`

**涉及文件**: `stores/app.ts`, `components/layout/CenterPanel.tsx`

---

### 4. 搜索后无回复 — 需要超时反馈

**现象**: Agent 进行搜索后没有状态提示。用户不知道是正在搜索、搜索超时了、还是卡死了。

**根因**: 没有超时后的用户提示。agent 卡住时用户只能干等。

**修复**:
- `A2UICustomRenderer.tsx` 添加 90s 超时检测
- 超时后显示错误页面：「AI 响应超时，请检查网络连接或 API 配置后重试」
- 超时后自动生成错误 surface（通过 `createErrorSurface`）
- 生成中显示 spinner + 「AI 正在生成界面...」文字 + 取消按钮

**涉及文件**: `components/chat/A2UICustomRenderer.tsx`

---

### 5. CopilotKit 表盘读取不到有用信息

**现象**: CopilotKit Dev Console（开发模式下的浮动面板）显示的信息不充分，无法用于调试。

**根因**: FrontendToolsProvider 注册的上下文信息太简单，缺少详细的渲染状态和工具调用记录。

**修复**:
- FrontendToolsProvider 增强 agent context（包含 surfaces 数量、组件数量、对话 ID、思考状态）
- 新建 DebugPanel（仅 dev 模式可见）：服务端日志 + Store 状态检查
- 服务端日志环形缓冲（100 条）：tool_call / api_call / llm_call
- 新建 debug store（Zustand）：前端工具调用 + API 调用记录

**涉及文件**: `components/chat/FrontendToolsProvider.tsx`, `components/debug/DebugPanel.tsx`（新建）, `stores/debug.ts`（新建）, `lib/debug/serverLogs.ts`（新建）

---

### 6. 图片/视频内容不匹配

**现象**: 搜索到的图片和用户需求不相关。例如搜索「数码产品」返回的是通用图片。

**根因**: Pexels 搜索用中文 query，Pexels 的中文分词和标签匹配不如英文。

**修复（本轮部分修复）**:
- 添加 `locale=zh-CN` 参数
- System prompt 规则调整：`_textAvailable: false` 是正常情况，用 LLM 知识写文字即可
- 图片作为「配图」而非「数据来源」

**涉及文件**: `lib/tools/pexelsSearch.ts`, `lib/a2ui/prompts/system.ts`

---

### 7. 模板凑数 — 需要精心打磨

**现象**: 20 个模板中有多个质量低下的「凑数模板」，prompt 公式化，没有参考价值。

**修复**:
- 模板从 20 精简到 12（删除：status-monitor, audio-podcast, subscription-plans, invoice-detail, team-members, event-schedule, multi-step-wizard, ai-chat-interface）
- 重新分类为 5 大类：数据分析(3) / 电商与内容(2) / 表单(2) / 数据管理(2) / 营销(1) / 社交与协作(2)
- 所有 prompt 改为中性邀请式，移除所有真实品牌名和日期
- 所有示例数据改为通用描述

**涉及文件**: `lib/a2ui/templates.ts`（完全重写）

---

## 解决方案汇总

| 问题 | 根因 | 修复方式 | 文件 |
|------|------|---------|------|
| 1. 搜索不可靠 | Tavily/DDG 从中国不可用 | LLM 知识为主要数据源 + 图片优先 | webSearch.ts, system.ts |
| 2. 交互按键无效 | agent 为 null | 三级缓存降级 | A2UICustomRenderer.tsx |
| 3. 面板不更新 | 无重新挂载机制 | conversationVersion key | app.ts, CenterPanel.tsx |
| 4. 搜索无反馈 | 无超时提示 | 90s 超时 + 错误 Surface | A2UICustomRenderer.tsx |
| 5. CK 表盘无用 | 上下文信息太少 | DebugPanel + 日志系统 | debug/* |
| 6. 图片不匹配 | 中文 query 英文 API | locale 参数 + 策略调整 | pexelsSearch.ts, system.ts |
| 7. 模板凑数 | 20→12 无质量差异 | 精简 + 中性重写 | templates.ts |
