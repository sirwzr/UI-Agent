"use client";

import { useEffect, useRef } from "react";
import { useCopilotKit } from "@copilotkitnext/react";
import { useAppStore } from "@/stores/app";

/**
 * 不可见组件 — 监听 CopilotKit 运行状态，驱动思考面板。
 * 阶段推进细节由 A2UICustomRenderer 负责；
 * 这里只负责：检测 agent 启动/停止，清除旧 surfaces，重置/完成阶段。
 */
export function ThinkingController() {
  const setAgentThinking = useAppStore((s) => s.setAgentThinking);
  const setThinkingStages = useAppStore((s) => s.setThinkingStages);
  const updateThinkingStage = useAppStore((s) => s.updateThinkingStage);
  const setSurfaces = useAppStore((s) => s.setSurfaces);
  const surfaces = useAppStore((s) => s.surfaces);

  const { copilotkit } = useCopilotKit();
  const thinkingStarted = useRef(false);
  const prevSurfacesLen = useRef(0);

  const resetStages = () => {
    setThinkingStages([
      { id: "analyze", label: "分析需求", status: "pending" },
      { id: "search", label: "搜索数据", status: "pending" },
      { id: "design", label: "设计布局", status: "pending" },
      { id: "generate", label: "生成组件", status: "pending" },
    ]);
  };

  // 监听 CopilotKit 运行状态
  useEffect(() => {
    const checkRunning = () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isRunning = !!(copilotkit as any)?.running;
        if (isRunning && !thinkingStarted.current) {
          thinkingStarted.current = true;
          setAgentThinking(true);
          resetStages();
          // Fix 8: 清除旧 surfaces
          setSurfaces([]);
          updateThinkingStage("analyze", { status: "in-progress" });
        }
      } catch {
        // 静默处理
      }
    };

    const interval = setInterval(checkRunning, 1000);
    return () => clearInterval(interval);
  }, [copilotkit, setAgentThinking, updateThinkingStage, setThinkingStages, setSurfaces]);

  // 当 surfaces 非空时，生成完成
  useEffect(() => {
    if (surfaces.length > prevSurfacesLen.current && surfaces.length > 0) {
      setAgentThinking(false);
      thinkingStarted.current = false;
      setThinkingStages([
        { id: "analyze", label: "分析需求", status: "done" },
        { id: "search", label: "搜索数据", status: "done" },
        { id: "design", label: "设计布局", status: "done" },
        { id: "generate", label: "生成组件", status: "done" },
      ]);

      const timer = setTimeout(resetStages, 3000);
      prevSurfacesLen.current = surfaces.length;
      return () => clearTimeout(timer);
    }
    prevSurfacesLen.current = surfaces.length;
  }, [surfaces, setAgentThinking, setThinkingStages]);

  // 当 surfaces 被清空时重置
  useEffect(() => {
    if (surfaces.length === 0 && !thinkingStarted.current) {
      prevSurfacesLen.current = 0;
      setAgentThinking(false);
    }
  }, [surfaces.length, setAgentThinking]);

  return null;
}
