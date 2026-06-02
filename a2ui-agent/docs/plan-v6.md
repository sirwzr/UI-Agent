# A2UI Agent v6 方案（修订版·最终）

**日期**: 2026-05-29
**状态**: ✅ 已实施
**LLM**: Google Gemini (gemini-2.5-flash)

---

## 用户反馈驱动修订（5 月 29 日第二轮）

基于实际测试反馈的紧急修复：

| 问题 | 根因 | 修复 |
|------|------|------|
| 搜索工具不生效 | DeepSeek 对 tool calling 支持不足 | 切换到 Gemini |
| 模板替用户做决定 | 模板 prompt 写死了产品/风格 | 全部改为「先问用户」模式 |
| 追问规则不被遵守 | Prompt 规则太软 | 改为「违反即失败」强制规则 |
| 搜索状态无反馈 | LLM 忽略 _hint 字段 | 明文规定「下一句话必须包含状态」 |
| 布局比例不协调 | 内容无宽度约束 | 全局 maxWidth + 居中 |
| 位置获取失败不追问 | 无追问逻辑 | 明文规定「失败必须问用户在哪个城市」 |

---

## 变更清单

### 新建文件
- `lib/a2ui/design-tokens.ts` — 设计 Token 引擎
- `lib/a2ui/validate-output.ts` — Server 端输出校验
- `lib/a2ui/component-registry.ts` — 组件注册中心
- `lib/tools/index.ts` — 工具统一注册入口

### 修改文件
- `lib/a2ui/prompts/system.ts` — 完全重写：4 条强制规则 + 反例 + 模板处理规范
- `lib/a2ui/prompts/examples.ts` — 4 组完整 JSON 布局示例 + 智能对话引导
- `lib/a2ui/templates.ts` — 12 模板 prompt 改为「询问用户」模式
- `lib/tools/webSearch.ts` — Bing API + 竞速模式 + _searchStatus 字段
- `lib/tools/pexelsSearch.ts` — 100+ 词条 CN→EN 翻译 + 英文优先搜索
- `lib/tools/locationSearch.ts` — HTTP → HTTPS
- `components/layout/CenterPanel.tsx` — 移除 prompt 包装 + maxWidth 居中
- `components/layout/LeftPanel.tsx` — 宽度 280→260
- `components/welcome/WelcomeGallery.tsx` — 去掉过窄 maxWidth
- `lib/a2ui/render-surface.tsx` — 渲染区 maxWidth 1100 + 居中
- `app/api/copilotkit/[[...path]]/route.ts` — Token 注入 + allTools
- `lib/debug/serverLogs.ts` — 新增 validation 日志类型
- `.env.local` — 切换 Gemini
- `.env.example` — 新增 BING_API_KEY

---

## 4 条强制规则（System Prompt 核心）

1. **永远不替用户做决定** — 模板只是起点，必须问用户想展示什么
2. **关键信息缺失必须追问** — 位置/产品/公司/风格，禁止编造
3. **每次搜索后必须反馈状态** — 成功/部分/失败，下一句话必须说明
4. **禁止编造** — 公司名/人名/职位/地址/实时数据

## 验证

- `npx tsc --noEmit` — 零错误
- Gemini API 通过 `LLM_PROVIDER=gemini` 切换
- 模板点击 → 必须询问用户 → 不能直接生成
