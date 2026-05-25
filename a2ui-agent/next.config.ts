import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 开发环境不输出 standalone（Windows symlink 权限问题）
  // 生产 Docker 构建时改为 "standalone"
  // output: "standalone",
  serverExternalPackages: ["pino", "prom-client"],
  // 允许 CopilotKit 的 SSE 长连接
  async headers() {
    return [
      {
        source: "/api/copilotkit",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-transform" },
          { key: "Connection", value: "keep-alive" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.deepseek.com https://api.openai.com" },
        ],
      },
      {
        source: "/api/metrics",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },
};

export default nextConfig;
