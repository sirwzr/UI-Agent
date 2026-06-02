# Round 1 — 初始体验问题 (5 项)

**日期**: 2026-05-26 前后
**状态**: ✅ 已修复

---

## 问题清单

### 1. 搜索失败无反馈

**现象**: web_search 调用 Tavily API 失败后静默挂起，不告诉用户搜索失败，也不继续生成界面。

**根因**: Tavily API key 未配置时直接报错，没有 fallback 机制。错误被吞掉，用户看到的是「正在生成...」永远不结束。

**修复**:
- 添加 DuckDuckGo 免费搜索作为 Tavily 回退
- 添加 8 秒超时机制
- 搜索失败时返回明确提示给 LLM，让其用自身知识继续生成

**涉及文件**: `lib/tools/webSearch.ts`, `lib/tools/fallbackData.ts`

---

### 2. 模板提示词假设用户场景

**现象**: 模板 prompt 写了「你们团队需要...」「你们公司的...」等假设性语句，用户实际场景可能完全不同。

**根因**: 模板 prompt 写死了使用场景（如「你们销售团队需要监控 KPIs」）。

**修复**: 重写模板 prompt，改为中性邀请式：「告诉我你需要什么界面」「请描述你想要的数据类型」。

**涉及文件**: `lib/a2ui/templates.ts`

---

### 3. 图片与真实信息不匹配

**现象**: 生成的界面中图片（Unsplash 随机图）与文字内容毫无关系。比如产品展示页的文字描述是「智能手机」，图片却是风景照。

**根因**: 使用硬编码的 Unsplash URL（`picsum.photos` seed），图片与用户需求不匹配。没有图片搜索能力。

**修复**:
- 集成 Pexels API（`api.pexels.com`）做真实图片搜索
- 添加 Unsplash Source API 作为 Pexels 失败时的回退
- 添加分类关键词匹配的 fallback 图片

**涉及文件**: `lib/tools/pexelsSearch.ts`, `lib/tools/fallbackData.ts`, `lib/tools/webSearch.ts`

---

### 4. 图片破坏布局比例

**现象**: 添加图片后，页面布局比例失调。图片尺寸不受控，撑破容器。

**根因**: Image 组件没有设置 `maxHeight` 和 `objectFit`，图片以原始尺寸渲染。

**修复**:
- Image 组件: `width: "100%"`, `maxHeight: 280`, `borderRadius: 8`, `objectFit: "cover"`
- Carousel 图片: `maxHeight: 320`, `borderRadius: 8`
- 添加图片尺寸规范到 system prompt

**涉及文件**: `lib/a2ui/catalog-renderers.tsx`, `lib/a2ui/prompts/system.ts`

---

### 5. 按钮无法点击，只能输入文字

**现象**: 界面上有 QuickActionRow 按钮（如「确认生成」「修改需求」），但用户点击后没有反应，被迫回到输入框打字。

**根因**: `A2UICustomRenderer.tsx` 中按钮的 `onAction` 回调依赖 `agent` 对象，但 agent 在 activity renderer 的 props 中可能为 null，导致 `if (!agent) return;` 静默退出。

**修复**:
- 添加模块级 agent 缓存（`cachedAgent` / `cachedCopilotkit`），确保按钮回调始终有 agent 可用
- agent 为 null 时显示 `message.warning("助手连接中断，请刷新页面后重试")` 而非静默
- 多级降级获取 agent：`agent ?? cachedAgent ?? copilotkit.agent`

**涉及文件**: `components/chat/A2UICustomRenderer.tsx`

---

## 解决方案汇总

| 问题 | 根因 | 修复方式 | 文件 |
|------|------|---------|------|
| 1. 搜索失败无反馈 | Tavily 失败后无 fallback | DuckDuckGo 回退 + 8s 超时 | webSearch.ts |
| 2. 模板假设场景 | prompt 写死使用场景 | 改为中性邀请式 | templates.ts |
| 3. 图片不匹配 | 硬编码 Unsplash URL | 集成 Pexels API | pexelsSearch.ts |
| 4. 图片破坏布局 | Image 无尺寸约束 | maxHeight + objectFit | catalog-renderers.tsx |
| 5. 按钮无法点击 | agent 为 null 静默返回 | 全局缓存 + 错误提示 | A2UICustomRenderer.tsx |
