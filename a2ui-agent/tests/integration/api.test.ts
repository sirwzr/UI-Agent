// ===== 集成测试：API 端点 =====
// 注意：需要 .env.local 中的有效 DEEPSEEK_API_KEY 才能运行
import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = "http://localhost:3000";

describe("API Endpoints", () => {
  // Health Check
  it("GET /api/health should return ok", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
  });

  // Metrics
  it("GET /api/metrics should return prometheus text", async () => {
    const res = await fetch(`${BASE_URL}/api/metrics`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("agent_requests_total");
    expect(text).toContain("a2ui_messages_generated_total");
    expect(text).toContain("sse_connections_active");
  });

  // CopilotKit endpoint returns 401 without auth
  it("POST /api/copilotkit should return 401 without auth", async () => {
    const res = await fetch(`${BASE_URL}/api/copilotkit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    // 401 或 200 取决于认证中间件是否拦截
    // CopilotKit 可能在 middleware 层就需要 session
    expect([401, 403]).toContain(res.status);
  });
});
