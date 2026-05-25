# A2UI Agent - AI 界面生成助手

## 项目简介

A2UI Agent 是一个基于 AI 的交互式界面生成工具。用户用自然语言描述需求，AI 自动生成完整的 UI 界面并实时渲染。支持仪表盘、产品展示、数据表格、表单、图表、媒体播放等 32 种组件类型。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| UI 库 | Ant Design 5 |
| 动画 | framer-motion 12 |
| 图表 | recharts 3 |
| Markdown | react-markdown 10 |
| 状态管理 | Zustand 5 |
| AI 框架 | CopilotKit (@copilotkitnext/react, @copilotkit/runtime) |
| LLM | DeepSeek Chat (默认) / OpenAI GPT-4o |
| 数据库 | Prisma + SQLite/PostgreSQL |
| 认证 | NextAuth v5 (beta) |

## 快速开始

### 环境变量

```bash
# .env.local
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=sk-your-key
TAVILY_API_KEY=tvly-your-key   # 可选，用于 web_search 工具
LLM_PROVIDER=deepseek          # deepseek | openai
DATABASE_URL=file:./dev.db
AUTH_SECRET=your-secret
```

### 启动

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
# 访问 http://localhost:3000
```

## 目录结构

```
a2ui-agent/
├── app/
│   ├── api/copilotkit/    # AI 对话 API 端点
│   ├── globals.css         # 全局样式
│   └── page.tsx            # 主页面
├── components/
│   ├── chat/               # 聊天消息 + A2UI 桥接
│   ├── common/             # AppHeader, ErrorBoundary
│   ├── editor/             # 组件树面板 + 属性编辑器
│   ├── layout/             # LeftPanel, CenterPanel, ThinkingPanel
│   └── welcome/            # 欢迎页 + 模板卡片
├── docs/                   # 项目文档
├── hooks/                  # useConversation, useUserPreferences
├── lib/
│   ├── a2ui/               # A2UI 核心：渲染器、定义、模板、提示词
│   └── tools/              # webSearch 工具
├── prisma/                 # 数据库 schema
└── stores/                 # Zustand 状态管理
```

## 核心功能

1. **自然语言生成 UI** — 输入需求描述，AI 自动设计并生成界面
2. **15 个模板** — 涵盖数据分析、电商、营销、表单、项目管理、金融等场景
3. **32 种组件** — 图表、轮播、音视频、表格、表单、统计卡片等
4. **组件树编辑器** — 查看组件层级、点击选择、实时编辑属性
5. **思考过程可视化** — 右侧面板展示 AI 的分析→搜索→设计→生成过程
6. **对话历史管理** — 创建、归档、切换对话
