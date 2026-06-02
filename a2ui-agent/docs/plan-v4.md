# A2UI Agent v4 方案

**日期**: 2026-05-26
**状态**: ✅ 已完成

---

## 目标

v4 是组件库大升级版本，主要完成了：
- A2UI 组件从 30+ 扩展到 43 种
- Pexels API 图片搜索集成
- 思考面板删除，改为对话式引导
- Framer Motion 动画优化

## 主要变更

### 1. 组件库扩展

新增 9 个组件类型：
- `StatusBadge` — 状态徽章
- `Avatar` — 头像
- `NumberAnimation` — 数字动画（渐增效果）
- `Radio` — 单选按钮
- `Switch` — 开关
- `Progress` — 进度条
- `Skeleton` — 骨架屏
- `Empty` — 空状态
- `Breadcrumb` — 面包屑
- `Drawer` — 抽屉
- `Menu` — 菜单
- `Tooltip` — 提示

### 2. 交互修复（7 项）
- Radio 组件 state 管理
- Switch 组件 state 管理
- Progress 百分比展示
- Rating 组件交互优化
- Modal/Drawer 打开关闭状态
- Tooltip/Breadcrumb/Menu 正确渲染
- Skeleton/Empty 正确渲染

### 3. Pexels API 集成
- 替代硬编码 Unsplash URL
- `lib/tools/pexelsSearch.ts` 新建
- 支持照片和视频搜索

### 4. 删除思考面板
- 原来有一个独立的「CopilotKit 思考面板」
- 改为内嵌在聊天流中的对话式引导

### 5. 对话式引导
- System prompt 添加确认流程
- QuickActionRow 作为主要交互方式
- 用户通过按钮选择偏好，而非打字

## 涉及文件
- `lib/a2ui/catalog-definitions.ts`
- `lib/a2ui/catalog-renderers.tsx`
- `lib/a2ui/render-surface.tsx`
- `lib/tools/pexelsSearch.ts`（新建）
- `lib/a2ui/prompts/system.ts`
- `components/chat/A2UICustomRenderer.tsx`
