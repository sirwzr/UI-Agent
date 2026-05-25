"use client";

import { useEffect } from "react";
import { useFrontendTool, useAgentContext } from "@copilotkitnext/react";
import { useAppStore } from "@/stores/app";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { z } from "zod";

/**
 * 注册 CopilotKit 前端工具和 Agent 上下文，使它们在
 * CopilotKit Dev Console 中可见，并供 Agent 调用。
 */
export function FrontendToolsProvider() {
  const surfaces = useAppStore((s) => s.surfaces);
  const currentId = useAppStore((s) => s.currentConversationId);
  const isAgentThinking = useAppStore((s) => s.isAgentThinking);
  const { lastPrompt, promptHistory } = useUserPreferences();

  // ---- 前端工具：获取客户端信息 ----
  useFrontendTool({
    name: "get_client_info",
    description: "获取客户端浏览器和屏幕信息",
    parameters: z.object({}),
    handler: async () => {
      return {
        screenWidth: typeof window !== "undefined" ? window.innerWidth : 0,
        screenHeight: typeof window !== "undefined" ? window.innerHeight : 0,
        language: typeof navigator !== "undefined" ? navigator.language : "unknown",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      };
    },
  });

  // ---- 前端工具：获取当前渲染状态 ----
  useFrontendTool({
    name: "get_render_state",
    description: "获取当前 A2UI 渲染状态，包括组件数量和 surface ID",
    parameters: z.object({}),
    handler: async () => {
      const totalComponents = surfaces.reduce((sum, s) => sum + s.components.length, 0);
      return {
        surfaceCount: surfaces.length,
        totalComponents,
        surfaceIds: surfaces.map((s) => s.surfaceId),
        isAgentThinking,
        currentConversationId: currentId,
      };
    },
  });

  // ---- Agent 上下文：提供用户偏好和当前状态 ----
  useAgentContext({
    description: "用户偏好和当前应用状态",
    value: JSON.stringify({
      lastPrompt,
      promptHistory,
      currentConversationId: currentId,
      surfaceCount: surfaces.length,
      isAgentThinking,
    }),
  });

  useEffect(() => {
    // FrontendToolsProvider 是纯注册组件，无需副作用
  }, []);

  return null;
}
