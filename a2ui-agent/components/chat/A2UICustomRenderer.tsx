"use client";

import React, { useCallback, useMemo, useEffect, useRef } from "react";
import { useCopilotKit } from "@copilotkitnext/react";
import { message } from "antd";
import { z } from "zod";
import { useAppStore } from "@/stores/app";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { parseSurfaces, type ActionHandler } from "@/lib/a2ui/render-surface";
import { createErrorSurface } from "@/lib/a2ui/error-handler";

const AGENT_TIMEOUT_MS = 60000;

/** action name → 本地行为（不调 agent） */
function handleLocalAction(name: string) {
  switch (name) {
    case "search_products":
    case "search":
    case "filter":
      message.info("正在本地搜索...");
      return;
    case "buy_now":
    case "register":
    case "submit_survey":
      message.success("操作成功！感谢您的提交。");
      return;
    case "add_cart":
    case "save_recipe":
    case "add_calendar":
    case "add_shopping":
    case "share":
      message.success("已添加/已分享");
      return;
    case "get_started":
    case "start_trial":
    case "book_demo":
    case "view_docs":
    case "watch_demo":
      message.info("功能演示：在实际环境中将跳转到对应页面。");
      return;
    case "close_dialog":
      return;
    default:
      return "delegate"; // 需要调用 agent
  }
}

function A2UISurfaceRenderer({ content, agent }: { content: Record<string, unknown>; agent?: unknown }) {
  const { copilotkit } = useCopilotKit();
  const setSurfaces = useAppStore((s) => s.setSurfaces);
  const setRunAgentAction = useAppStore((s) => s.setRunAgentAction);
  const isAgentThinking = useAppStore((s) => s.isAgentThinking);
  const currentId = useAppStore((s) => s.currentConversationId);
  const setAgentError = useAppStore((s) => s.setAgentError);
  const setAgentThinking = useAppStore((s) => s.setAgentThinking);
  const updateThinkingStage = useAppStore((s) => s.updateThinkingStage);
  const setThinkingStages = useAppStore((s) => s.setThinkingStages);
  const cancelAgent = useAppStore((s) => s.cancelAgent);
  const setSearchStatus = useAppStore((s) => s.setSearchStatus);
  const { updateLastPrompt } = useUserPreferences();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastPromptCaptured = useRef(false);

  const operations = useMemo(() => {
    const raw = (content ?? {}) as { a2ui_operations?: Record<string, unknown>[]; operations?: Record<string, unknown>[] };
    return (raw.a2ui_operations ?? raw.operations ?? []) as Record<string, unknown>[];
  }, [content]);

  const surfaces = useMemo(() => parseSurfaces(operations), [operations]);

  const onAction: ActionHandler = useCallback(
    async (action) => {
      const result = handleLocalAction(action.name);
      if (result === "delegate") {
        if (!agent) return;
        copilotkit.setProperties({
          ...(copilotkit.properties ?? {}),
          a2uiAction: { userAction: action },
        });
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (copilotkit as any).runAgent({ agent });
        } catch {
          message.warning("操作未能完成，请重试。");
        }
      }
    },
    [agent, copilotkit],
  );

  // 清除阶段定时器
  const clearStageTimers = () => {
    stageTimersRef.current.forEach(clearTimeout);
    stageTimersRef.current = [];
  };

  // 检测 web_search 是否使用了备用数据
  useEffect(() => {
    if (operations.length > 0) {
      const hasFallback = operations.some((op) => op._fallback === true);
      if (hasFallback) {
        setSearchStatus({
          status: "fallback",
          message: "搜索 API 不可用，已使用精选备用图片",
        });
      } else {
        setSearchStatus({ status: "done" });
      }
    }
  }, [operations, setSearchStatus]);

  // Fix 13: 分阶段真实推进思考步骤
  useEffect(() => {
    if (operations.length > 0 && isAgentThinking) {
      clearStageTimers();

      // 重置所有阶段
      setThinkingStages([
        { id: "analyze", label: "分析需求", status: "done" },
        { id: "search", label: "搜索数据", status: "in-progress" },
        { id: "design", label: "设计布局", status: "pending" },
        { id: "generate", label: "生成组件", status: "pending" },
      ]);

      stageTimersRef.current.push(
        setTimeout(() => {
          updateThinkingStage("search", { status: "done" });
          updateThinkingStage("design", { status: "in-progress" });
        }, 2000),
      );

      stageTimersRef.current.push(
        setTimeout(() => {
          updateThinkingStage("design", { status: "done" });
          updateThinkingStage("generate", { status: "in-progress" });
        }, 4000),
      );
    }
    return () => clearStageTimers();
  }, [operations.length > 0, isAgentThinking]);

  // 桥接到 Zustand store
  useEffect(() => {
    setSurfaces(surfaces);
  }, [surfaces, setSurfaces]);

  useEffect(() => {
    setRunAgentAction(() => onAction);
  }, [onAction, setRunAgentAction]);

  // Fix 9: 直接打字时捕获首条消息更新 lastPrompt
  useEffect(() => {
    if (currentId && operations.length > 0 && !lastPromptCaptured.current) {
      lastPromptCaptured.current = true;
      // 从 content 中提取用户消息
      const messages = (content as { messages?: { role: string; content: string }[] }).messages;
      if (messages && messages.length > 0) {
        const userMsg = messages.find((m) => m.role === "user");
        if (userMsg?.content) {
          updateLastPrompt(userMsg.content);
        }
      }
    }
  }, [currentId, operations.length, content, updateLastPrompt]);

  // Fix 6: 管理 AbortController
  useEffect(() => {
    if (isAgentThinking && currentId) {
      useAppStore.setState({ abortController: new AbortController() });
    }
    if (!isAgentThinking) {
      useAppStore.setState({ abortController: null });
    }
  }, [isAgentThinking, currentId]);

  // 超时检测 (Fix 14: 使用 createErrorSurface 生成错误 UI)
  useEffect(() => {
    if (isAgentThinking && currentId && surfaces.length === 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setAgentError("AI 响应超时，请检查网络连接或 API 配置后重试");
        setAgentThinking(false);
        clearStageTimers();
        // Fix 14: 生成错误 surface
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
      clearStageTimers();
      // 全部阶段完成
      setThinkingStages([
        { id: "analyze", label: "分析需求", status: "done" },
        { id: "search", label: "搜索数据", status: "done" },
        { id: "design", label: "设计布局", status: "done" },
        { id: "generate", label: "生成组件", status: "done" },
      ]);
    }
  }, [surfaces.length, setAgentError, setAgentThinking, setThinkingStages]);

  // Fix 4: 不内联渲染，只做数据桥接——CenterPanel 负责所有渲染
  return null;
}

export const customA2UIActivityRenderer = {
  activityType: "a2ui-surface",
  content: z.any(),
  render: A2UISurfaceRenderer,
};
