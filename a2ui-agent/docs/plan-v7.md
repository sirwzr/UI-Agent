# A2UI Agent v7 方案

**日期**: 2026-05-29
**状态**: ✅ 已实施
**LLM**: 阿里云通义千问 (qwen-plus)

---

## 变更清单

### 问题 #1：文本搜索不可用 ✅

**根因**：Tavily key 失效、DuckDuckGo 被墙。用户无法注册国际 API（无信用卡），Brave/Bing/Serper 均需要国际银行卡。

**最终方案：通义千问原生联网搜索**
通义千问 (DashScope) 的 `enable_search: true` 参数让 Qwen 自动搜索互联网并返回实时信息。使用已有的 `DASHSCOPE_API_KEY`，零额外配置，零额外费用。

**修复**（4 层防御）：
| 层级 | 文件 | 改动 |
|------|------|------|
| Qwen 搜索 | `lib/tools/webSearch.ts` | `searchViaQwen()` — 调用 DashScope API，enable_search=true，返回结构化 JSON |
| 搜索策略 | `lib/tools/webSearch.ts` | 竞速模式改为合并去重模式，预留多源扩展 |
| 结构化 fallback | `lib/tools/fallbackData.ts` | 新增 4 套文本内容模板（产品/科技/商务/美食），Qwen 搜索失败时使用 |
| 超时优化 | `lib/tools/webSearch.ts` | TEXT_TIMEOUT_MS 8000ms（Qwen 搜索需要更多时间） |

**搜索架构**：
```
Qwen 原生搜索 (enable_search=true)
       ↓ DashScope API 调用，模型自动联网搜索
       ↓ 返回结构化 JSON: [{title, url, snippet}]
       ↓ 如失败 → _fallbackContent 结构化模板
```

**关键改进**：从依赖多个第三方搜索 API（每个都有注册门槛）简化为零配置的 Qwen 原生搜索。架构保留了 `mergeTextSearch()` 的多源合并设计，将来添加其他搜索源只需加一行。

---

### 问题 #2：图片与内容不匹配 + 内容稀疏 ✅

| 维度 | 文件 | 改动 |
|------|------|------|
| 强制密度标准 | `lib/a2ui/prompts/system.ts` | RichText ≥150 字、Table ≥6 行、Chart ≥8 点，不达标=不合格 |
| 禁止占位文本 | `lib/a2ui/prompts/system.ts` | 7 类黑名单：禁止「在这里描述...」「数值一」「项目 A」等 |
| 图片对齐规则 | `lib/a2ui/prompts/system.ts` | 按 description 筛选、Carousel ≥3 张、禁止跨主题乱用 |
| 质量反例 | `lib/a2ui/prompts/examples.ts` | 新增场景 4（fallback 使用）+ 场景 5（5 组反例→正确对照） |
| 查询增强 | `lib/tools/pexelsSearch.ts` | `enrichQuery()` — 按主题添加 "product photography" 等质量修饰词 |
| 模板数据充实 | `lib/a2ui/templates.ts` | 全部模板 Chart（3→8 点）、Table（2-4→6 行）、RichText（占位→≥150 字）达标 |

---

### 问题 #3：CopilotKit 版本迁移 ⏸️ 暂缓

`@copilotkitnext/react` → `@copilotkit/react` 的迁移因目标包尚未发布到 npm（404 Not Found）而暂缓。当前 `@copilotkitnext/react@1.54.1` 标记为 deprecated 但仍可用。等 `@copilotkit/react` 发布后只需：
1. `package.json` 替换包名
2. 全局替换 import 路径
3. `pnpm install`

---

### 问题 #4：搜索后 Agent 不自动生成 ✅

**根因**：System prompt 只要求「搜索后反馈状态」，未要求「同一轮生成界面」。Agent 搜索 → 输出状态文本 → 停下来等用户。

**修复**：`lib/a2ui/prompts/system.ts` 新增「自动继续规则」：
- 搜索完成后必须在同一轮回复完成「状态反馈 + render_a2ui」
- 明确禁止：搜索后只输出状态然后停下来等用户
- 唯一例外：缺少关键信息（位置/产品/公司）时才能追问

---

### 问题 #5：对话消息显示在生成区 ✅

**修复**：`components/layout/CenterPanel.tsx`
- 新增消息显示区域：渲染区上方显示最近 12 条用户/AI 对话气泡
- 等待状态下也显示最近 6 条消息（半透明，预览用）
- 用户消息右对齐蓝底，AI 消息左对齐灰底
- 数据来源：Zustand store 的 `currentConversationDetail.messages`

---

### 问题 #6：布局比例 ✅

**修复**：`app/page.tsx` — 移除主 Layout 的 `maxWidth: 1440, margin: "0 auto"`，内容撑满浏览器全宽。LeftPanel 固定 280px，CenterPanel 占剩余空间。内部渲染区保持 `maxWidth: 1200` 居中以保证内容可读性。

---

### 问题 #7：Prompt 润色 ✅

已在 #1、#2、#4 的 prompt 改动中同步完成，主要增强：
- 内容密度强制标准表格（含不合格示例列）
- 占位文本黑名单
- 图片对齐规则
- 自动继续规则
- 质量反例（5 组）
- fallback 数据使用说明

---

## 文件变更汇总

### 新建
- _(无新建文件)_

### 修改
- `lib/tools/webSearch.ts` — 合并去重策略 + Brave/Serper 搜索源 + 超时优化 + fallback 指引
- `lib/tools/fallbackData.ts` — 新增 4 套结构化文本内容模板
- `lib/tools/pexelsSearch.ts` — `enrichQuery()` 查询质量增强
- `lib/a2ui/prompts/system.ts` — 内容密度标准 + 自动继续 + 图片对齐 + 反例 + fallback 使用说明
- `lib/a2ui/prompts/examples.ts` — 新增 fallback 使用示例 + 内容质量反例
- `lib/a2ui/templates.ts` — 全部 12 模板数据达标（Chart ≥8 点、Table ≥6 行、RichText ≥150 字）
- `components/layout/CenterPanel.tsx` — 对话消息气泡显示
- `app/page.tsx` — 移除 maxWidth:1440
- `.env.local` — 新增 BRAVE_API_KEY、SERPER_API_KEY
- `.env.example` — 更新搜索 API 配置说明

### 未修改（暂缓）
- `@copilotkitnext/react` → `@copilotkit/react` — 等待包发布

---

## 验证

- `npx tsc --noEmit` — 零错误
- 服务器启动正常，API 端点可达
- Brave Search / Serper.dev / Bing 三个新源待配置 API key 后即可激活

---

## API Key 获取指引

| API | 地址 | 说明 |
|-----|------|------|
| **通义千问搜索** | 已配置 DASHSCOPE_API_KEY | 零额外配置，自动联网搜索 |
| Pexels 图片 | https://pexels.com/api | 免费 200/小时 + 20000/月 |

如需扩展搜索源（可选）：
| API | 地址 | 免费额度 | 是否需要国际卡 |
|-----|------|---------|--------------|
| Brave Search | https://brave.com/search/api/ | 2000/月 | 需要 |
| Bing Search | https://portal.azure.com | 1000/月 | 需要 |
| Serper.dev | https://serper.dev | 付费 $0.30/千次 | 需要 |
