"use client";

import React, { useCallback, useMemo, useEffect, useRef } from "react";
import { useCopilotKit } from "@copilotkitnext/react";
import { App } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { z } from "zod";
import { useAppStore } from "@/stores/app";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { parseSurfaces, type ActionHandler } from "@/lib/a2ui/render-surface";
import { createErrorSurface } from "@/lib/a2ui/error-handler";

const AGENT_TIMEOUT_MS = 90000;

// 全局 agent 缓存 — 确保按钮回调始终有 agent 可用
let cachedAgent: unknown = null;
let cachedCopilotkit: unknown = null;

function handleLocalAction(name: string, msg: MessageInstance) {
  switch (name) {
    case "confirm_generate":
    case "modify_requirements":
      return "delegate"; // 确认/修改 → 交由 agent 继续流程
    case "search_products":
    case "search":
    case "filter":
      msg.info("正在本地搜索...");
      return;
    case "buy_now":
    case "register":
    case "submit_survey":
      msg.success("操作成功！感谢您的提交。");
      return;
    case "add_cart":
    case "save_recipe":
    case "add_calendar":
    case "add_shopping":
    case "share":
      msg.success("已添加/已分享");
      return;
    case "get_started":
    case "start_trial":
    case "book_demo":
    case "view_docs":
    case "watch_demo":
      msg.info("功能演示：在实际环境中将跳转到对应页面。");
      return;
    case "close_dialog":
      return;
    default:
      return "delegate";
  }
}

function A2UISurfaceRenderer({ content, agent }: { content: Record<string, unknown>; agent?: unknown }) {
  const { message: msgApi } = App.useApp();
  const { copilotkit } = useCopilotKit();
  const setSurfaces = useAppStore((s) => s.setSurfaces);
  const setRunAgentAction = useAppStore((s) => s.setRunAgentAction);
  const isAgentThinking = useAppStore((s) => s.isAgentThinking);
  const currentId = useAppStore((s) => s.currentConversationId);
  const setAgentError = useAppStore((s) => s.setAgentError);
  const setAgentThinking = useAppStore((s) => s.setAgentThinking);
  const { updateLastPrompt } = useUserPreferences();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPromptCaptured = useRef(false);

  const operations = useMemo(() => {
    const raw = (content ?? {}) as { a2ui_operations?: Record<string, unknown>[]; operations?: Record<string, unknown>[] };
    return (raw.a2ui_operations ?? raw.operations ?? []) as Record<string, unknown>[];
  }, [content]);

  const surfaces = useMemo(() => parseSurfaces(operations), [operations]);

  const onAction: ActionHandler = useCallback(
    async (action) => {
      const result = handleLocalAction(action.name, msgApi);
      if (result === "delegate") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kit = copilotkit as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const effectiveAgent: any = agent ?? cachedAgent ?? kit.agent;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const effectiveKit: any = kit.runAgent ? kit : (cachedCopilotkit ?? kit);
        if (!effectiveAgent) {
          msgApi.warning("助手连接中断，请刷新页面后重试。");
          return;
        }
        try {
          await effectiveKit.runAgent({ agent: effectiveAgent });
        } catch {
          msgApi.warning("操作失败，请重试。");
        }
      }
    },
    [agent, copilotkit, msgApi],
  );

  // 缓存 agent 引用，确保按钮回调始终可用
  useEffect(() => {
    if (agent) cachedAgent = agent;
    if (copilotkit) cachedCopilotkit = copilotkit;
  }, [agent, copilotkit]);

  // 桥接到 Zustand store
  useEffect(() => {
    setSurfaces(surfaces);
  }, [surfaces, setSurfaces]);

  useEffect(() => {
    setRunAgentAction(() => onAction);
  }, [onAction, setRunAgentAction]);

  // 直接打字时捕获首条消息更新 lastPrompt
  useEffect(() => {
    if (currentId && operations.length > 0 && !lastPromptCaptured.current) {
      lastPromptCaptured.current = true;
      const messages = (content as { messages?: { role: string; content: string }[] }).messages;
      if (messages && messages.length > 0) {
        const userMsg = messages.find((m) => m.role === "user");
        if (userMsg?.content) {
          updateLastPrompt(userMsg.content);
        }
      }
    }
  }, [currentId, operations.length, content, updateLastPrompt]);

  // 管理 AbortController
  useEffect(() => {
    if (isAgentThinking && currentId) {
      useAppStore.setState({ abortController: new AbortController() });
    }
    if (!isAgentThinking) {
      useAppStore.setState({ abortController: null });
    }
  }, [isAgentThinking, currentId]);

  // 超时检测
  useEffect(() => {
    if (isAgentThinking && currentId && surfaces.length === 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setAgentError("AI 响应超时，请检查网络连接或 API 配置后重试");
        setAgentThinking(false);
        const errorSurfaces = createErrorSurface("error-timeout", "AI 响应超时，请检查网络连接或 API 配置后重试");
        const parsed = parseSurfaces(errorSurfaces as unknown as Record<string, unknown>[]);
        if (parsed.length > 0) setSurfaces(parsed);
      }, AGENT_TIMEOUT_MS);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isAgentThinking, currentId, surfaces.length, setAgentError, setAgentThinking, setSurfaces]);

  // 当 surfaces 生成成功时清除 timeout 和 error
  useEffect(() => {
    if (surfaces.length > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setAgentError(null);
      setAgentThinking(false);
    }
  }, [surfaces.length, setAgentError, setAgentThinking]);

  // 不内联渲染，只做数据桥接——CenterPanel 负责所有渲染
  return null;
}

export const customA2UIActivityRenderer = {
  activityType: "a2ui-surface",
  content: z.any(),
  render: A2UISurfaceRenderer,
};
