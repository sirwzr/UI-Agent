# A2UI Agent 重构方案

## 目标布局

```
┌──────────────┬────────────────────────┬──────────────┐
│  左栏 280px   │                        │  右栏 360px   │
│  对话历史     │     生成的 UI           │  思考过程     │
│  + 指令输入   │     (主舞台)            │  (实时)      │
│              │                        │              │
│  可折叠 ◀──▶ │                        │  可折叠 ▶──◀│
└──────────────┴────────────────────────┴──────────────┘
```

## 实施阶段

### P0 — 联网搜索工具

- **新增** `lib/tools/webSearch.ts` — Tavily 搜索工具，使用 `defineTool()` 格式
- **修改** `app/api/copilotkit/[[...path]]/route.ts` — 在 BuiltInAgent 注册 `web_search` 工具
- **修改** `lib/a2ui/prompts/system.ts` — 系统提示词加入工作流程：分析需求 → 搜索数据 → 设计布局 → 生成组件
- **修改** `.env.example` — 添加 `TAVILY_API_KEY`

### P1 — 三段式布局

- **修改** `stores/app.ts` — 扩展 Zustand store：
  - `rightPanelOpen` / `surfaces` / `thinkingStages` / `runAgentAction`
  - `ThinkingStage` 接口（id, label, status）
- **新增** `lib/a2ui/render-surface.tsx` — 从 A2UICustomRenderer.tsx 抽取共享渲染逻辑（RenderComponent + 22 组件 switch）
- **修改** `components/chat/A2UICustomRenderer.tsx` — 调用 `setSurfaces()` 推送到 store，`setRunAgentAction()` 保存回调
- **新增** `components/layout/LeftPanel.tsx` — 280px 可折叠侧栏：
  - 顶部「新建对话」按钮
  - 中间对话历史列表（归档按钮替代删除）
  - 底部 CopilotChat 实例（嵌入，非全屏）
- **新增** `components/layout/CenterPanel.tsx` — 主舞台：
  - 无对话/无 surface 时显示 WelcomeGallery
  - 有 surface 时调用 `RenderA2UITree` 全屏渲染
- **新增** `components/layout/ThinkingPanel.tsx` — 360px 可折叠右侧面板：
  - 使用 Ant Steps 展示四个阶段（分析需求 / 搜索数据 / 设计布局 / 生成组件）
  - 每阶段状态：pending / in-progress / done
- **新增** `components/layout/ThinkingController.tsx` — 不可见组件，订阅 CopilotKit 消息变化，驱动 thinkingStages 状态
- **修改** `app/page.tsx` — 重写为三栏布局编排：`AppHeader` → `Layout`(LeftPanel + CenterPanel + ThinkingPanel)
- **修改** `components/common/AppHeader.tsx` — 新增右栏折叠按钮

### P2 — 欢迎页 UI 模板画廊

- **新增** `lib/a2ui/templates.ts` — 5 套预置模板（仪表盘/CRUD表格/产品详情/注册表单/落地页），每套含迷你 A2UI 组件树定义 + 触发 prompt
- **新增** `components/welcome/TemplateCard.tsx` — 实时 A2UI 迷你预览卡片（`transform: scale(0.55)`），点击即生成
- **新增** `components/welcome/WelcomeGallery.tsx` — 欢迎页：
  - Hero 图标 + 标题
  - 「继续上次的工作」—— 读取 `useUserPreferences`
  - 模板卡片网格

### P3 — 用户体验优化

- **修改** `app/api/conversations/[id]/route.ts` — 新增 `PATCH` handler，支持更新 status（active/archived）
- **修改** `app/api/conversations/route.ts` — GET 过滤 `status: "active"`，不返回已归档
- **修改** `hooks/useConversation.ts` — 新增 `archive(id)` 方法，UI 层移除删除按钮
- **新增** `hooks/useUserPreferences.ts` — localStorage 记录：最近 prompt、常用模板类别、prompt 历史（最近 10 条）

## 关键技术决策

1. **A2UI 渲染桥接**：A2UICustomRenderer 不再自己渲染 UI，而是通过 Zustand store (`setSurfaces` + `setRunAgentAction`) 将数据传递给 CenterPanel
2. **思考面板驱动**：ThinkingController 订阅 CopilotKit 消息流，通过检测 user message / tool-invocation 推断当前阶段
3. **CopilotChat 不消失**：保留在左栏底部，用户始终可以输入文字指令，A2UI 组件不在聊天流中内联显示
4. **迭代修改**：当 surface 已存在时，后续 agent 调用通过 `updateComponents` 增量更新，Zustand store 的 surfaces 字段随之更新，CenterPanel 即时重渲染

## 文件变更清单

| 操作 | 文件 |
|------|------|
| 新增 | `lib/tools/webSearch.ts` |
| 新增 | `lib/a2ui/render-surface.tsx` |
| 新增 | `lib/a2ui/templates.ts` |
| 新增 | `components/layout/LeftPanel.tsx` |
| 新增 | `components/layout/CenterPanel.tsx` |
| 新增 | `components/layout/ThinkingPanel.tsx` |
| 新增 | `components/layout/ThinkingController.tsx` |
| 新增 | `components/welcome/WelcomeGallery.tsx` |
| 新增 | `components/welcome/TemplateCard.tsx` |
| 新增 | `hooks/useUserPreferences.ts` |
| 修改 | `stores/app.ts` |
| 修改 | `app/page.tsx` |
| 修改 | `app/api/copilotkit/[[...path]]/route.ts` |
| 修改 | `lib/a2ui/prompts/system.ts` |
| 修改 | `components/chat/A2UICustomRenderer.tsx` |
| 修改 | `components/common/AppHeader.tsx` |
| 修改 | `hooks/useConversation.ts` |
| 修改 | `app/api/conversations/[id]/route.ts` |
| 修改 | `app/api/conversations/route.ts` |
| 修改 | `.env.example` |

## 验证方法

1. `npx tsc --noEmit` — 零新增 TS 错误（预存 route.ts schema 错误除外）
2. `curl http://localhost:3000` — 返回 200，SSR HTML 包含三栏布局结构
3. 浏览器测试：
   - 欢迎页显示 5 张模板卡片，每张是实时 A2UI 迷你渲染
   - 点击模板 → 左栏显示对话，中栏开始生成 UI，右栏显示思考进度
   - 在输入框输入「帮我做餐厅预订表单」→ 右栏显示「分析需求→搜索数据→设计布局→生成组件」流程
   - 生成的 UI 全屏渲染在中栏，按钮可点击触发 action
   - 侧栏对话列表无删除按钮，取而代之的是归档按钮
   - 刷新页面 → 欢迎页显示「继续上次的工作」
