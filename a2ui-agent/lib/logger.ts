import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(process.env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}),
  redact: {
    paths: ["password", "token", "apiKey", "secret", "authorization", "cookie"],
    censor: "[REDACTED]",
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Agent 专用日志
export const agentLogger = logger.child({ module: "agent" });
export const a2uiLogger = logger.child({ module: "a2ui" });
export const authLogger = logger.child({ module: "auth" });
