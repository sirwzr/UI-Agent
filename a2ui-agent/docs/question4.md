# Round 4 — 内容质量与可扩展性 (5 项)

**日期**: 2026-05-28
**状态**: 🔧 计划已批准，待实施

---

## 问题清单

### 1. 联网搜索还是不能实现 + 搜到也不匹配

**现象（用户反馈）**:
- 「联网功能还是不能实现」— 文本搜索从中国仍然不可用
- 「搜索有问题，搜索到了也是不匹配」— Pexels 图片用中文 query 搜索，结果和主题不相关

**根因**:
- 文本搜索：Tavily(403) + DuckDuckGo(timeout) 从中国不可用，没有可用的中国-friendly 文本搜索后端
- 图片搜索：Pexels API 接收中文 query 时分词不准，返回泛化图片
- LLM 知识没有被充分利用——system prompt 把它定位为「备选」而非「主力」

**修复方案** (v6 计划):

**A. 添加 Bing Search API 作为文本后端**
- `api.bing.microsoft.com` 从中国可访问（Azure 全球基础设施）
- 作为 `tryTextSearch` 的优先后端
- 三个后端（Bing / Tavily / DuckDuckGo）改为 `Promise.any` 并行竞速

**B. LLM 知识升级为「主力数据源」**
- 重写 system prompt 数据规则：
  ```
  旧：1. 你的知识是主要数据源...web_search 用于获取配图
  新：1. 你的知识是主力数据源 — 对任何主题必须生成详尽准确的文字。
      2. 每段文字都要有实质信息 — 写具体描述而非空洞口号。
      3. web_search 只用来获取配图，_textAvailable:false 是正常情况。
  ```

**C. Pexels 查询翻译**
- 新增 `translateQuery()` 函数，30+ 中英文关键词映射
- 中文 query（如「数码产品」）→ 英文 keywords（「electronics product」）
- 添加 `size: "medium"` 参数优化图片尺寸

**涉及文件**: `lib/tools/webSearch.ts`, `lib/tools/pexelsSearch.ts`, `lib/a2ui/prompts/system.ts`

---

### 2. 页面信息稀疏 + 布局不整齐

**现象（用户反馈）**: 「每一个页面的信息很少，获取不到关键信息，并且界面不整齐」

**根因**:
- System prompt 写「总组件 8-15 个」，8 个组件非常稀疏
- 示例（DASHBOARD_EXAMPLE）仅 9 个组件，示范了最小实现
- 没有布局模式指导，LLM 随意堆砌组件

**修复方案** (v6 计划):

**A. 提高组件密度标准**
```
旧: 总组件 8-15 个
新: 总组件 15-30 个
    每 Card 至少含 2-3 个子组件
    RichText 至少 3-5 句话
    表格至少 4 行 3 列
    Chart 至少 6 个数据点
    Carousel 至少 3 张图
```

**B. 添加推荐布局模式**
```
仪表盘: root → header → stats-row → chart-area → table-section
产品展示: root → hero(Carousel+Text+RichText) → features → specs → cta
表单: root(Form) → intro → fields → options → submit
列表管理: root → toolbar → filter-tags → data-table → detail-drawer
```

**C. 增强 few-shot 示例**
- DASHBOARD_EXAMPLE 从 9 组件扩展到 17+ 组件
- 新增 CONTENT_RICH_EXAMPLE

**涉及文件**: `lib/a2ui/prompts/system.ts`, `lib/a2ui/prompts/examples.ts`

---

### 3. 模板提示混乱 + 用户新建对话逻辑混乱

**现象（用户反馈）**: 「模板提示比较混乱，用户自己新建对话的逻辑也是混乱的。你不知道用户在哪里，你可以直接问，为啥要编造？」

**根因**:
- CenterPanel 的 `handlePromptSelect` 给 template prompt 额外包装了引导指令，与 system prompt 的工作流冲突
- 模板 prompt 写法不一致——有的像邀请、有的像指令、有的假设了场景
- Agent 有时编造用户场景（位置、公司名、行业等），system prompt 的反假设规则不够具体

**修复方案** (v6 计划):

**A. 移除 CenterPanel 的 prompt 包装**
```typescript
// 旧：额外包装引导词
const guidedPrompt = `${prompt}\n\n按确认流程操作：先了解偏好...`;

// 新：直接传递，信任 system prompt 的工作流
setPendingPrompt({ prompt, title });
```

**B. 重写全部 12 个模板 prompt**
统一格式：`"帮我创建[页面类型]。请先问我：[需要澄清的关键点]。确认后再生成。"`

例如：`"帮我创建产品展示页。请先问我：是什么类型的产品、偏好什么视觉风格。确认后再生成。"`

**C. 强化反假设规则 + 4 阶段工作流**
```
阶段 0 判断 → 阶段 1 澄清(最多2轮) → 阶段 2 确认(不可跳过) → 阶段 3 生成

反假设规则（具体化）:
  ✗ 错误：「我为你设计了一个北京总部的销售仪表盘」
  ✓ 正确：「请选择你关注的城市和业务领域」
```

**涉及文件**: `lib/a2ui/prompts/system.ts`, `lib/a2ui/templates.ts`, `components/layout/CenterPanel.tsx`

---

### 4. 色彩元素单一

**现象（用户反馈）**: 「可以多点色彩元素，丰富页面」

**根因**:
- 全局只有一个主色 `#3b82f6`（蓝色）
- Ant Design ConfigProvider 硬编码蓝色
- System prompt 提到了「不同页面用不同配色」但没有给具体方案和色值
- Chart 组件虽有内置的 6 色数组，但 LLM 不知道如何搭配

**修复方案** (v6 计划):

**A. 新建配色注册表** (`lib/a2ui/color-palettes.ts`)

5 套完整方案，每套含 12 个色值：
| 方案 | 主色 | 适用场景 |
|------|------|---------|
| 海洋蓝 ocean | #2563eb | 仪表盘、后台、监控 |
| 日落橙 sunset | #ea580c | 电商、餐饮、社交 |
| 森林绿 forest | #16a34a | 医疗、环保、教育 |
| 紫韵 purple | #7c3aed | 创意、品牌、个人主页 |
| 暗夜 slate | #6366f1 | 深色大屏、监控、代码 |

**B. 动态注入 system prompt**
- `{{COLOR_PALETTES}}` 占位符替换为 Markdown 格式的配色文档
- Agent 每次生成时根据页面类型自动选择配色
- 在对话中告知用户选择了哪个配色

**C. 配色选择规则**
- Chart/Tag/Button 使用主色
- Statistic 数值用主色，trend="up" 用成功色，trend="down" 用错误色

**涉及文件**: `lib/a2ui/color-palettes.ts`（新建）, `lib/a2ui/prompts/system.ts`, `app/api/copilotkit/[[...path]]/route.ts`

---

### 5. Skills/MCP 策略

**现象（用户反馈）**: 「可以写或者使用几个 skills 或者 mcp，帮助你完成此项工作」

**理解和方案** (v6 计划):

**A. 已启用的 Skills（4 个插件）**
- Superpowers: 14 个开发技能（systematic-debugging、subagent-driven-development、writing-plans 等）
- frontend-design: 前端 UI/UX 辅助
- code-review: 代码审查
- andrej-karpathy-skills: 编程最佳实践指南

**B. MCP — 已安装配置**
- **Playwright MCP**: `@playwright/mcp` + Chromium → 浏览器自动化测试
  - 自动打开 `localhost:3000`，点击模板，验证按钮响应和页面渲染
  - 配置在 `d:\AUI\code\pro_code\.mcp.json`
- **GitHub MCP**: 未安装（需要 GitHub Personal Access Token）
  - 可用于查询 CopilotKit 的 issues/PRs

**C. 运行时工具（新增）**
- `read_project_file` 工具：让 agent 读取自身项目文件，进行自检和调试

**涉及文件**: `.mcp.json`, `app/api/copilotkit/[[...path]]/route.ts`

---

## v6 实施计划

| 顺序 | 任务 | 文件 | 优先级 |
|------|------|------|--------|
| 1 | 修复搜索 | webSearch.ts, pexelsSearch.ts, system.ts | 🔴 最高 |
| 2 | 修复对话流程 | system.ts, templates.ts, CenterPanel.tsx | 🔴 最高 |
| 3 | 提升内容密度 | system.ts, examples.ts | 🟡 高 |
| 4 | 添加色彩方案 | color-palettes.ts(新), system.ts, route.ts | 🟢 中 |
| 5 | Skills/MCP | route.ts, .mcp.json | 🟢 中 |

**预计 9 个文件：1 新建 + 8 修改**

---

## 从 Round 1 到 Round 4 的趋势

```
Round 1: 基础功能（搜索能否跑通、按钮能否点击）
    ↓
Round 2: 网络诊断（为什么搜索不通？中国网络限制。能用的 API 有哪些？）
    ↓
Round 3: 交互逻辑（切换对话、错误处理、超时反馈、可观测性）
    ↓
Round 4: 内容质量（信息密度、布局规范、色彩多样性、工具链）
```

每一轮都在解决更深层的问题。
