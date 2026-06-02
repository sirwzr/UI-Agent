# API 密钥配置清单

> 以下 Key 需自行申请并填入 `.env` 文件。**请勿将此文件提交到 Git 或分享给他人。**

## 必填（至少选一个 LLM Provider）

### DeepSeek（默认推荐）
| 变量 | 说明 | 获取地址 |
|------|------|---------|
| `LLM_PROVIDER` | 设为 `deepseek` | — |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | https://platform.deepseek.com |
| `DEEPSEEK_BASE_URL` | API 地址（默认不需要改） | — |

### OpenAI
| 变量 | 说明 | 获取地址 |
|------|------|---------|
| `LLM_PROVIDER` | 设为 `openai` | — |
| `OPENAI_API_KEY` | OpenAI API 密钥 | https://platform.openai.com |
| `OPENAI_MODEL` | 模型名，如 `gpt-4o` | — |

### 阿里云通义千问
| 变量 | 说明 | 获取地址 |
|------|------|---------|
| `LLM_PROVIDER` | 设为 `aliyun` | — |
| `DASHSCOPE_API_KEY` | 阿里云 DashScope API 密钥 | https://dashscope.console.aliyun.com |
| `ALIYUN_MODEL` | 模型名，如 `qwen-plus` | — |

### Google Gemini
| 变量 | 说明 | 获取地址 |
|------|------|---------|
| `LLM_PROVIDER` | 设为 `gemini` | — |
| `GEMINI_API_KEY` | Gemini API 密钥（免费 1500 次/天） | https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | 模型名，如 `gemini-2.5-flash` | — |

## 必填（数据库 & 认证）

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接地址，格式 `postgresql://用户:密码@主机:端口/数据库名` |
| `AUTH_SECRET` | 随机字符串，用于 JWT 签名。执行 `openssl rand -base64 32` 生成 |

## 可选（OAuth 登录）

| 变量 | 说明 | 获取地址 |
|------|------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth 客户端 ID | https://console.cloud.google.com |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 客户端密钥 | 同上 |
| `AUTH_URL` | 应用地址，本地开发用 `http://localhost:3000` | — |

## 可选（搜索 & 图库）

| 变量 | 说明 | 获取地址 |
|------|------|---------|
| `PEXELS_API_KEY` | Pexels 图片/视频 API（免费 200 次/小时） | https://pexels.com/api |

> 联网搜索通过阿里云 DashScope 的 `enable_search` 参数实现，使用同一个 `DASHSCOPE_API_KEY`，无需额外配置。

## 可选（可观测性）

| 变量 | 说明 |
|------|------|
| `GRAFANA_PASSWORD` | Grafana 管理员密码（Docker 部署时使用） |
| `NODE_ENV` | `development` 或 `production` |
| `LOG_LEVEL` | 日志级别：`debug` / `info` / `warn` / `error` |

## 最小可运行配置

只需在 `.env` 中填这 5 项即可启动：

```bash
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxxxxx
DATABASE_URL=postgresql://a2ui:a2ui@localhost:5432/a2ui
REDIS_URL=redis://localhost:6379
AUTH_SECRET=xxxxxxxx
```
