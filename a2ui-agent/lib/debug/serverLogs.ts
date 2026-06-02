// ===== 服务端内存日志（环形缓冲）=====

interface LogEntry {
  ts: number;
  type: "tool_call" | "api_call" | "llm_call" | "validation";
  detail: string;
  duration: number;
  success: boolean;
}

const MAX = 100;
const buffer: LogEntry[] = [];

export function appendLog(entry: LogEntry) {
  buffer.unshift(entry);
  if (buffer.length > MAX) buffer.length = MAX;
}

export function getLogs(): LogEntry[] {
  return [...buffer];
}

export function clearLogs() {
  buffer.length = 0;
}
