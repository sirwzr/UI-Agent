# A2UI Agent 架构文档

## 整体架构

```
用户输入 (CopilotChat)
    │
    ▼
CopilotKit Runtime (/api/copilotkit)
    │
    ├─ BuiltInAgent (system prompt + tools)
    │   ├─ web_search tool (Tavily API)
    │   └─ render_a2ui tool (injected by A2UI middleware)
    │
    ├─ LLM (DeepSeek / OpenAI)
    │   └─ 流式返回 agent response
    │
    ▼
CopilotKit Client SDK (@copilotkitnext/react)
    │
    ├─ Chat Messages (inline)
    └─ Activity Messages → A2UICustomRenderer
         │
         ├─ parseSurfaces() → ParsedSurface[]
         └─ setSurfaces() → Zustand Store
               │
               ▼
         CenterPanel (render-surface.tsx)
               │
               ├─ RenderA2UITree
               └─ RenderComponent × N (递归)
                    │
                    └─ withAnimation() (framer-motion)
```

## 前端组件树

```
Layout (page.tsx, 100vh)
├── AppHeader (60px, sticky)
│   ├── 侧栏切换按钮
│   ├── A2UI Agent logo (渐变色)
│   ├── 思考面板切换按钮
│   └── 用户信息下拉 (头像 + 退出)
│
├── Layout (flex: 1)
│   ├── LeftPanel (Sider, 280px)
│   │   ├── 新建对话按钮 (渐变色)
│   │   ├── 对话列表 (List)
│   │   └── CopilotChat (AI 输入框)
│   │
│   ├── CenterPanel (Content, flex: 1)
│   │   ├── [错误态] Result 错误面板
│   │   ├── [渲染态] RenderA2UITree + ComponentTreePanel + ComponentInspector
│   │   ├── [等待态] 呼吸动画 "描述您的需求..."
│   │   └── [欢迎态] WelcomeGallery (Hero + 模板卡片网格)
│   │
│   └── ThinkingPanel (Sider, 360px)
│       └── Steps × 4 (分析 → 搜索 → 设计 → 生成)
│
└── ThinkingController (render: null, 驱动 ThinkingPanel)
```

## 状态管理 (Zustand Store)

### 核心字段

| 字段 | 类型 | 用途 |
|------|------|------|
| `surfaces` | `ParsedSurface[]` | A2UI 组件树数据，驱动 CenterPanel 渲染 |
| `currentConversationId` | `string \| null` | 当前活跃对话 ID |
| `isAgentThinking` | `boolean` | Agent 是否正在运行 |
| `agentError` | `string \| null` | Agent 错误信息 |
| `pendingPrompt` | `{ prompt: string; title: string } \| null` | 从模板/向导触发的排队提示词（含标题） |
| `activeWizard` | `{ template: { prompt, title, category } } \| null` | 当前活跃的向导配置 |
| `searchStatus` | `{ status: "idle"\|"searching"\|"done"\|"fallback"; message?: string } \| null` | 搜索状态（用于 ThinkingPanel 备用数据提示） |
| `selectedComponentId` | `string \| null` | 组件树中选中的组件 ID |
| `editorOpen` | `boolean` | 组件树面板是否打开 |
| `thinkingStages` | `ThinkingStage[]` | 4 阶段思考进度 |
| `sidebarOpen` / `rightPanelOpen` | `boolean` | 侧栏/思考面板开关 |

### 核心 Actions

| Action | 用途 |
|--------|------|
| `setSurfaces(s)` | 设置 A2UI 渲染数据 |
| `createConversation(t)` | 创建新对话 |
| `updateConversationTitle(id, t)` | 更新对话标题 |
| `goHome()` | 返回首页，清除对话和 surfaces |
| `setAgentError(msg)` | 设置错误信息 |
| `advanceThinkingStage()` | 推进思考阶段 |
| `updateComponentProp(sid, cid, k, v)` | 编辑组件属性 |
| `setPendingPrompt(p)` | 设置排队提示词（模板/向导完成后触发聊天注入） |
| `setActiveWizard(w)` | 打开/关闭向导 |
| `setSearchStatus(s)` | 设置搜索状态（ThinkingPanel 显示备用数据提示） |
| `cancelAgent()` | 取消当前 Agent 运行（AbortController） |

## 渲染管线详解

### Layer 1 — 后端 (route.ts)

1. CopilotRuntime 接收请求，创建 BuiltInAgent
2. Agent 获得系统提示词（自定义组件补充 + 示例）和 A2UI catalog definitions
3. LLM 调用 `render_a2ui` 工具，A2UI middleware 将结果序列化为 activity messages
4. 以流式方式返回给客户端

### Layer 2 — 客户端桥接 (A2UICustomRenderer)

1. 注册为 CopilotKit 的 `renderActivityMessages` 渲染器
2. 接收 `activityType: "a2ui-surface"` 的消息
3. 提取 `a2ui_operations` 数组
4. 调用 `parseSurfaces()` 转换为 `ParsedSurface[]`
5. 存入 Zustand store
6. 超时检测：60 秒未生成 surfaces → 设置错误

### Layer 3 — 状态桥接 (Zustand)

- `surfaces` 作为响应式数据源，所有组件可订阅
- `runAgentAction` 存储回调，供按钮/搜索栏触发 agent 重新运行

### Layer 4 — React 渲染 (render-surface.tsx)

1. `RenderA2UITree` 遍历 surfaces，为每个 surface 构建组件 Map
2. 查找 `"root"` 组件，递归渲染整棵树
3. 每个组件通过 `withAnimation()` 包裹 `motion.div`
4. 默认使用 `fadeInUp` 入场动画 + stagger 延迟
5. 支持选中高亮（蓝色边框）
6. 使用 Ant Design + recharts + react-markdown 渲染

## 数据流：模板入口（v3 Wizard 引导流程）

```
用户点击模板卡片 (category 非空)
  → setActiveWizard({ template: { prompt, title, category } })
  → TemplateWizard 3 步引导
    → step1: WizardStepScene (radio cards + 自定义输入)
    → step2: WizardStepContent (checkbox grid)
    → step3: WizardStepStyle (风格预设卡片 + 颜色预览)
  → lib/wizard/wizardConfig.ts
    → composePrompt(scene, content, style, basePrompt)
    → composeTitle(templateTitle, styleLabel) → "模板名 · 风格名"
  → onComplete(composedPrompt, title)
  → setActiveWizard(null)
  → setPendingPrompt({ prompt: composedPrompt, title })
  → LeftPanel.useEffect 检测 pendingPrompt
  → createConversation(title) + 注入聊天 → 发送

用户点击「继续上次」(category 为空)
  → setPendingPrompt({ prompt: lastPrompt, title: "继续上次" })
  → 跳过向导，直接注入聊天
```

## 数据流：搜索 Fallback

```
Agent 调用 web_search(tavily)
  ├─ 成功 → Tavily API 返回真实数据 + 图片
  └─ 失败 → catch 块 → matchFallbackImages(query)
       → 返回 { success: true, _fallback: true, images: [...] }
       → A2UICustomRenderer 检测 _fallback
       → setSearchStatus({ status: "fallback" })
       → ThinkingPanel 显示「备用数据」警告标签
```
