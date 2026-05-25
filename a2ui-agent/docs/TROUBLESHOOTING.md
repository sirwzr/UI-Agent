# A2UI Agent 问题记录与解决方案

## 2024-06 — 输入后无响应

**现象：** 用户在 CopilotChat 输入需求后，CenterPanel 永远停留在「等待中」状态，不生成任何 UI。

**根因：**
1. `ThinkingController` 通过 `(copilotkit as any).__internal?.state` 访问 CopilotKit 私有状态，这些字段随版本变化而失效
2. 空的 `catch` 块静默吞掉所有访问错误
3. 当 LLM API 调用失败或超时时，前端没有任何错误提示

**解决方案：**
1. 重写 `ThinkingController`：移除 `__internal` 访问，改用 CopilotKit 公开 API 的 `running` 属性和 surfaces 变化检测
2. 在 `A2UICustomRenderer` 中添加 60 秒超时检测
3. 在 `CenterPanel` 中添加错误状态（`Result` 组件 + 重试按钮）
4. 在 `stores/app.ts` 中添加 `agentError` 字段和 `setAgentError` action
5. 后端 `route.ts` 增加详细的错误日志

---

## 2024-06 — 音视频组件空 src

**现象：** 浏览器控制台报 `An empty string ("") was passed to the src attribute`（×8），导致浏览器重新下载当前页面 URL。

**根因：**
1. LLM 生成的 `Video`/`Audio` 组件可能带有空 `src: ""`
2. HTML `<video src="">` 和 `<audio src="">` 会触发浏览器下载当前页面
3. 模板中某些媒体 URL 使用了占位符空字符串

**解决方案：**
1. `render-surface.tsx` 和 `catalog-renderers.tsx` 中所有媒体组件添加空值检查：`if (!src) return <占位符>`
2. `catalog-definitions.ts` 中 Video/Audio 的 `src` 从 `z.string()` 改为 `z.string().url()`
3. 模板中所有 `url`/`src` 使用真实 URL（`picsum.photos` 和 Google CDN 视频）

---

## 2024-06 — Modal 渲染为 Card

**现象：** 在 CenterPanel 中，`Modal` 组件显示为普通 `Card`，而非模态对话框。

**根因：** `render-surface.tsx` 的 `case "Modal"` 分支渲染了 `<Card>` 而非 `<Modal open>`。而在 `catalog-renderers.tsx` 中正确使用了 `<Modal open>`。

**解决方案：** 将 `render-surface.tsx` 的 Modal 渲染改为 `<Modal title={comp.title} open={true} footer={null} closable={true}>`。

---

## 2024-06 — QuickActionRow 内联渲染死点击

**现象：** CopilotChat 聊天流中的 `QuickActionRow` 按钮点击无响应。

**根因：** `catalog-renderers.tsx` 的 `QuickActionRowRenderer` 中 onClick 是空函数体（只有注释 `// action dispatch handled by consumer`），未调用 `dispatch`。

**解决方案：** 添加 `dispatch({ userAction: { name: action.name, context: {} } })`。

---

## 2024-06 — 模板 dataSource 格式错误

**现象：** 模板中的 `Table` 组件报错 `rawData.some is not a function`。

**根因：** 模板使用 `dataSource: {}`（空对象），但 antd InternalTable 期望 `dataSource` 为数组，或通过 `{ records: [...] }` 格式传递。

**解决方案：** 所有模板的 `dataSource` 统一使用 `{ records: [{...}, ...] }` 格式，包含真实示例数据。

---

## 2024-06 — renderActivityMessages 不稳定数组

**现象：** 浏览器控制台警告 `renderActivityMessages must be a stable array`。

**根因：** `AppProviders.tsx` 中 `renderActivityMessages={[customA2UIActivityRenderer]}` 每次渲染创建新数组引用。

**解决方案：** 把数组提取为模块级常量 `const activityRenderers = [customA2UIActivityRenderer]`。

---

## 2024-06 — A2UI Schema 缺少 catalogId

**现象：** TypeScript 报错 `Type '{ components: {...} }' is not assignable to type 'A2UIInlineCatalogSchema'`。

**根因：** `route.ts` 中 `a2ui.schema` 只传了 `components`，缺少必需的 `catalogId` 字段。

**解决方案：** 添加 `catalogId: "https://a2ui.org/specification/v0_9/basic_catalog.json"`。

---

## 2024-06 — 系统提示词与 A2UI Middleware 冲突

**现象：** LLM 有时响应文本描述而不调用 `render_a2ui` 工具。

**根因：** 自定义系统提示词重新定义了标准 A2UI 组件目录，与 CopilotKit middleware 注入的 `RENDER_A2UI_TOOL_GUIDELINES` 冲突，造成 LLM 困惑。

**解决方案：** 系统提示词只定义**自定义扩展组件**（Chart、Carousel、RichText 等），不再重新定义中间件已注入的标准组件。同时添加了「搜索后必须渲染界面」的强制指令。

---

## 2025-05 — 搜索不可用 + 媒体缺失（Round 3 问题 1）

**现象：** Tavily API 搜索有时不可用（key 过期、网络超时），导致 LLM 无法获取真实图片/视频 URL，生成的 Image/Carousel 组件使用无效 URL。

**根因：**
1. `webSearch.ts` 的 catch 块直接返回 `success: false` + 空 results/images
2. LLM 拿到空数据时被迫编造 URL，导致图片无法加载
3. 没有本地备用图片数据源

**解决方案：**
1. 新建 `lib/tools/fallbackData.ts`：按 6 个类别（products/technology/food/nature/business/people）精选 Unsplash 真实图片 URL，每类 8 张；提供 `matchFallbackImages(query)` 关键词匹配函数
2. 修改 `webSearch.ts` catch 块：返回 `success: true` + `_fallback: true` + `matchFallbackImages(query)` 图片数据
3. 修改 `lib/a2ui/prompts/system.ts`：新增「备用图片资源」章节，列出各类别稳定可用的 Unsplash URL
4. 修改 `A2UICustomRenderer.tsx`：检测 operations 中的 `_fallback: true`，触发 `setSearchStatus({ status: "fallback" })`
5. 修改 `ThinkingPanel.tsx`：当 `searchStatus.status === "fallback"` 时，在「搜索数据」步骤旁显示黄色警告标签「备用数据」

---

## 2025-05 — 模板引导流程不符合预期（Round 3 问题 2）

**现象：** 用户期望通过对话或选择的形式逐步引导用户点名想要的界面，而非 TemplateConfirmModal 一步生成模式。用户不希望点击模板后在聊天栏弹出确认框。

**根因：**
1. `TemplateConfirmModal` 设计过于简单：只有一个 TextArea + 4 个引导标签
2. 用户无法逐步表达场景、内容、风格偏好
3. 弹窗在聊天栏弹出，打断用户流程

**解决方案：**
1. **删除** `components/welcome/TemplateConfirmModal.tsx`
2. **新建** `components/wizard/TemplateWizard.tsx`：3 步引导（场景确认 → 内容定制 → 风格选择），在 CenterPanel 中全屏渲染，不在聊天栏弹出
3. **新建** 4 个子组件：`WizardProgress.tsx`（进度条）、`WizardStepScene.tsx`（场景选择卡片）、`WizardStepContent.tsx`（多选内容选项）、`WizardStepStyle.tsx`（风格预设卡片 + 颜色预览）
4. **新建** `lib/wizard/wizardConfig.ts`：8 个类别的向导配置（场景选项、内容选项、风格预设），提供 `composePrompt()` 和 `composeTitle()` 辅助函数
5. 修改 `stores/app.ts`：`pendingPrompt` 类型从 `string | null` 改为 `{ prompt, title } | null`；新增 `activeWizard` 字段
6. 修改 `CenterPanel.tsx`：添加 Wizard 渲染分支（第五状态）；WelcomeGallery 回调改为 3 参数 `(prompt, title, category)`
7. 修改 `LeftPanel.tsx`：适配新的 `pendingPrompt` 对象类型，删除 `generateTitle()` 函数

### 向导数据流

```
用户点击模板卡片
  → category 非空 → setActiveWizard({ template })
  → TemplateWizard 3 步引导
    → step1: 选择场景 (radio cards + 自定义输入)
    → step2: 选择内容选项 (checkbox grid)
    → step3: 选择风格预设 (style cards + 颜色预览)
  → composePrompt() 组合最终 prompt
  → composeTitle() 生成「模板名 · 风格名」格式标题
  → onComplete(composedPrompt, title)
  → setPendingPrompt({ prompt, title })
  → LeftPanel useEffect 注入聊天 → 发送
```

---

## 2025-05 — 模板命名 + 界面交互感不足（Round 3 问题 3）

**现象：** 模板名称简短功能化（2-5 字），缺少吸引力；卡片 hover 效果简单；对话命名截取 prompt 前 18 字符不合理。

**根因：**
1. 模板名称仅有功能描述，如「销售仪表盘」「产品展示页」，缺乏场景感和画面感
2. TemplateCard 只有简单平移 + 阴影动画
3. 对话命名用 `generateTitle()` 截取 prompt 前 18 字符，截断生硬

**解决方案：**
1. 重命名全部 17 个模板：格式改为「场景词 · 功能词」，如「销售战报 · 经营驾驶舱」「爆品橱窗 · 沉浸式展示」
2. `TemplateDef` 接口新增 `emoji` 字段，每个模板添加对应 emoji
3. TemplateCard 增强：预览区左上角显示 emoji；hover 动画改为 `y: -6, boxShadow glow`；添加 `.template-card-hover` CSS 类
4. `app/globals.css` 新增 glow 伪元素效果（渐变彩色边框 + hover 时 opacity 过渡）
5. 对话命名改为「模板名 · 风格名」格式（通过 `composeTitle()` 生成），不再截取 prompt
