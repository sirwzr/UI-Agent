# A2UI Agent v5 方案

**日期**: 2026-05-27 ~ 2026-05-28
**状态**: ✅ 已完成
**对应问题**: Round 2 + Round 3 (共 12 项问题)

---

## 目标

修复 v4 上线后用户测试发现的 6 大体验问题（后扩展为 Round 2 和 Round 3 共 12 项），核心是让搜索、交互、模板达到可用状态。

## 6 个 Phase

### Phase 1: 修复搜索 — 免费搜索回退 + 真实数据

**发现的关键事实**: 从中国网络环境，Tavily=403, DuckDuckGo=timeout, Wikipedia=timeout, Pexels=正常, wttr.in=正常, ip-api.com=正常

**变更**:
- DuckDuckGo 作为 Tavily 回退
- Unsplash Source API 作为 Pexels 回退
- 8s 超时机制
- `_searchSources` 追踪数据来源
- 后续 Round 3 中完全重写为「图片优先」策略

**文件**: `lib/tools/webSearch.ts`, `lib/tools/pexelsSearch.ts`

### Phase 2: 修复模板点击 — Agent 委托链

**修复**:
- QuickActionRow 按钮 agent 为 null 时静默失败 → 添加全局缓存 + 错误提示
- Q&A action names（product_*, style_* 等）始终 delegate 到 agent

**文件**: `components/chat/A2UICustomRenderer.tsx`

### Phase 3: 位置感知搜索

**新增工具**:
- `get_user_location` — ip-api.com 免费 IP 定位
- `get_weather` — wttr.in 免费天气
- 位置注入到 web_search query

**文件**: `lib/tools/locationSearch.ts`（新建）, `lib/tools/weatherSearch.ts`（新建）

### Phase 4: UI 比例优化

| 元素 | 调整前 | 调整后 |
|------|--------|--------|
| Page maxWidth | 无限制 | 1440px |
| LeftPanel Sider | 320px | 280px |
| Hero orb blur | 80px | 50px |
| WelcomeGallery hero | 多层嵌套 | 简洁标题 |

**文件**: `app/page.tsx`, `components/layout/LeftPanel.tsx`, `app/globals.css`, `components/welcome/WelcomeGallery.tsx`

### Phase 5: 模板内容刷新

- 移除所有 2024 硬编码年份
- 模板从 20 精简到 12
- 所有 prompt 改为中性邀请式
- 5 大分类：数据分析 / 电商与内容 / 表单 / 数据管理 / 营销 / 社交与协作

**文件**: `lib/a2ui/templates.ts`（完全重写）

### Phase 6: 可观测性面板

**新增**:
- `DebugPanel` 组件（仅 dev 模式）
- `debugStore` (Zustand)
- `serverLogs` 环形缓冲
- `/api/debug/logs` API 端点
- copilotkit route handler 日志仪表

**文件**: `components/debug/DebugPanel.tsx`（新建）, `stores/debug.ts`（新建）, `lib/debug/serverLogs.ts`（新建）, `app/api/debug/logs/route.ts`（新建）, `app/api/copilotkit/[[...path]]/route.ts`

## 关键架构决策

### conversationVersion 模式
```typescript
// 解决新建/切换对话时 UI 不更新问题
conversationVersion: number  // store 中
goHome/createConversation/loadConversation → conversationVersion++
<Content key={conversationVersion}>  // 强制 React 重新挂载
```

### Agent 缓存模式
```typescript
// 解决按钮回调中 agent 为 null 问题
let cachedAgent: unknown = null;
let cachedCopilotkit: unknown = null;
// useEffect 中持续更新缓存
// onAction 中三级降级: agent ?? cachedAgent ?? copilotkit.agent
```

## 文件变更清单（14 个文件）

| 操作 | 文件 | Phase |
|------|------|-------|
| 修改 | `lib/tools/webSearch.ts` | 1, 3 |
| 修改 | `lib/tools/pexelsSearch.ts` | 1 |
| 修改 | `components/chat/A2UICustomRenderer.tsx` | 2 |
| 修改 | `lib/a2ui/prompts/system.ts` | 2, 3 |
| 修改 | `components/layout/CenterPanel.tsx` | 2 |
| **新建** | `lib/tools/locationSearch.ts` | 3 |
| **新建** | `lib/tools/weatherSearch.ts` | 3 |
| 修改 | `components/welcome/WelcomeGallery.tsx` | 4 |
| 修改 | `app/globals.css` | 4 |
| 修改 | `components/layout/LeftPanel.tsx` | 4 |
| 修改 | `app/page.tsx` | 4 |
| 修改 | `lib/a2ui/templates.ts` | 5 |
| **新建** | `components/debug/DebugPanel.tsx` | 6 |
| **新建** | `stores/debug.ts` | 6 |

## 验证结果

- TypeScript 编译：零错误
- web_search 无 API key 环境可返回 fallback 图片
- 模板点击 → QuickActionRow 按钮可点击 → agent 正确响应
- 新建对话 → 右侧面板清空
- 开发环境调试面板可见
