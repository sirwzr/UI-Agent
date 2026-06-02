# Round 2 — 深度排查与工具扩展 (5 项)

**日期**: 2026-05-27
**状态**: ✅ 已修复

---

## 问题清单

### 1. 搜索依旧无法工作 — Tavily 403

**现象**: 联网搜索仍然失败。Round 1 加了 DuckDuckGo 回退还是搜不到信息。

**根因（通过 curl 逐项排查）**:
- Tavily API (`api.tavily.com`) → HTTP 403 Forbidden（中国网络策略拦截）
- DuckDuckGo API (`api.duckduckgo.com`) → 连接超时（DNS 污染/IP 封锁）
- Wikipedia API → 连接超时
- **可用的**：Pexels（图片）✅、wttr.in（天气）✅、ip-api.com（位置）✅

**修复**:
- 重写搜索策略：LLM 自身知识作为主要文本数据源，外部工具只做补充
- web_search 改为「图片优先」策略，Pexels 始终获取图片
- 添加 `_textAvailable: boolean` 标志告诉 agent 文本搜索是否成功
- 添加 `_hint` 字段：告知 LLM「文本不可用时用你的知识编写」
- web_search 不再阻塞生成，设置 2.5s 文本超时

**涉及文件**: `lib/tools/webSearch.ts`（完全重写）

---

### 2. 模板提示词仍需优化

**现象**: Round 1 改过但还有问题——某些模板仍暗示「你可能是XX行业的」等假设。

**修复**: 继续精简模板 prompt，确保每个模板都以「告诉我...」开头，不做任何假设。

**涉及文件**: `lib/a2ui/templates.ts`

---

### 3. 图片内容不匹配 + 破坏布局（持续问题）

**现象**: 即使集成了 Pexels，仍存在图片与内容不匹配的情况。图片比例在移动端布局下异常。

**修复**:
- Pexels 搜索参数优化（添加 `locale=zh-CN`）
- Image 渲染器进一步约束尺寸
- 添加 Unsplash Source API 作为额外的图片回退

**涉及文件**: `lib/tools/pexelsSearch.ts`, `lib/a2ui/catalog-renderers.tsx`

---

### 4. 按钮依旧无法点击 / 用户被迫输入

**现象**: 用户点了 QuickActionRow 的选项后，部分按钮仍然没反应。用户被迫回到输入框打字。

**根因深入**:
- `handleLocalAction` 只处理了「本地可处理的」action（如 `buy_now`、`add_cart`），对于 Q&A 类 action（`product_electronics`、`style_dark_tech` 等）没有明确处理，走到 `default: return "delegate"` 分支后遇到 agent 为 null 的问题
- 缺乏对 `confirm_generate` 和 `modify_requirements` 的显式处理

**修复**:
- `handleLocalAction` 显式添加 `confirm_generate` 和 `modify_requirements` case，返回 `"delegate"`
- Agent 缓存机制增强：同时尝试 `agent` → `cachedAgent` → `copilotkit.agent` 三级降级
- 缓存 useEffect 确保 agent 和 copilotkit 引用始终可用
- 超时从 60s 延长到 90s

**涉及文件**: `components/chat/A2UICustomRenderer.tsx`

---

### 5. 搜索结果单调，风格单一

**现象**: 每次生成的界面风格雷同——都是蓝色主题、相同的卡片布局。

**根因**: System prompt 只有一套配色方案（蓝色 `#3b82f6`），没有风格多样性指导。

**修复**:
- System prompt 添加「不同页面类型用不同配色」规则：
  - 仪表盘/监控：深色背景，亮色强调
  - 产品展示：大面积留白，突出图片
  - 表单/问卷：居中卡片，柔和阴影
  - 营销落地页：渐变 Hero 区
  - 社交/个人页：轻松配色，圆形头像
- 添加间距、字体、组件密度规范

**涉及文件**: `lib/a2ui/prompts/system.ts`

---

## 新增工具

本轮新增了两个免费工具：

| 工具 | API | 用途 | 状态 |
|------|-----|------|------|
| `get_weather` | wttr.in | 实时天气（温度/湿度/风速/预报） | ✅ 可用 |
| `get_user_location` | ip-api.com | IP 定位（城市/区域/国家/经纬度） | ✅ 可用 |

**涉及文件**: `lib/tools/weatherSearch.ts`（新建）, `lib/tools/locationSearch.ts`（新建）

---

## 关键发现：中国网络环境的 API 可用性

| API | 从中国访问 | 说明 |
|-----|-----------|------|
| Pexels | ✅ 正常 | 图片/视频搜索 |
| wttr.in | ✅ 正常 | 免费天气 |
| ip-api.com | ✅ 正常 | 免费 IP 定位 |
| Tavily | ❌ 403 | API key 被拒 |
| DuckDuckGo | ❌ 超时 | DNS/IP 封锁 |
| Wikipedia | ❌ 超时 | 不可访问 |

**核心结论**: LLM（DeepSeek）自身知识必须作为主要数据源，外部工具仅做补充。
