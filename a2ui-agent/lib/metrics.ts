import client from "prom-client";

// 注册表
const register = new client.Registry();
register.setDefaultLabels({ app: "a2ui-agent" });
client.collectDefaultMetrics({ register });

// ===== 自定义指标 =====

// Agent 请求
export const agentRequestsTotal = new client.Counter({
  name: "agent_requests_total",
  help: "Total agent requests",
  labelNames: ["provider", "status"],
  registers: [register],
});

export const agentRequestDuration = new client.Histogram({
  name: "agent_request_duration_seconds",
  help: "Agent request duration in seconds",
  labelNames: ["provider"],
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

// A2UI 生成
export const a2uiMessagesGenerated = new client.Counter({
  name: "a2ui_messages_generated_total",
  help: "Total A2UI messages generated",
  labelNames: ["messageType", "surfaceId"],
  registers: [register],
});

export const a2uiValidationErrors = new client.Counter({
  name: "a2ui_validation_errors_total",
  help: "Total A2UI validation errors",
  labelNames: ["errorType"],
  registers: [register],
});

// 工具调用
export const toolCallsTotal = new client.Counter({
  name: "tool_calls_total",
  help: "Total tool calls",
  labelNames: ["toolName", "status"],
  registers: [register],
});

export const toolCallDuration = new client.Histogram({
  name: "tool_call_duration_seconds",
  help: "Tool call duration",
  labelNames: ["toolName"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// SSE 连接
export const sseConnectionsGauge = new client.Gauge({
  name: "sse_connections_active",
  help: "Active SSE connections",
  registers: [register],
});

// 输出 Prometheus 文本格式
export async function getMetrics(): Promise<string> {
  return register.metrics();
}
