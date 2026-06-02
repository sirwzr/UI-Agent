"use client";

import React, { useCallback } from "react";
import { Layout, Typography, Button, Result, Spin, Space } from "antd";
import { HomeOutlined, PartitionOutlined, CloseCircleOutlined, CheckOutlined, BgColorsOutlined, LayoutOutlined, ReloadOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/app";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { RenderA2UITree } from "@/lib/a2ui/render-surface";
import { WelcomeGallery } from "@/components/welcome/WelcomeGallery";
import { ComponentTreePanel } from "@/components/editor/ComponentTreePanel";
import { ComponentInspector } from "@/components/editor/ComponentInspector";
import { useCopilotKit } from "@copilotkitnext/react";
import { useAgent } from "@copilotkitnext/react";

const { Content } = Layout;
const { Text } = Typography;

const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function CenterPanel() {
  const surfaces = useAppStore((s) => s.surfaces);
  const runAgentAction = useAppStore((s) => s.runAgentAction);
  const currentId = useAppStore((s) => s.currentConversationId);
  const currentConversationDetail = useAppStore((s) => s.currentConversationDetail);
  const conversationVersion = useAppStore((s) => s.conversationVersion);
  const agentError = useAppStore((s) => s.agentError);
  const setAgentError = useAppStore((s) => s.setAgentError);
  const setPendingPrompt = useAppStore((s) => s.setPendingPrompt);
  const goHome = useAppStore((s) => s.goHome);
  const editorOpen = useAppStore((s) => s.editorOpen);
  const toggleEditor = useAppStore((s) => s.toggleEditor);
  const selectedComponentId = useAppStore((s) => s.selectedComponentId);
  const setSelectedComponentId = useAppStore((s) => s.setSelectedComponentId);
  const cancelAgent = useAppStore((s) => s.cancelAgent);
  const isAgentThinking = useAppStore((s) => s.isAgentThinking);
  const { updateLastPrompt } = useUserPreferences();
  const { copilotkit } = useCopilotKit();
  const { agent } = useAgent({ agentId: "default" });

  // 模板卡片点击 → prompt 直接交给 Agent（Agent 自行判断是否需要澄清）
  const handlePromptSelect = useCallback(
    (prompt: string, title: string, _category: string) => {
      updateLastPrompt(prompt);
      setPendingPrompt({ prompt, title: title || "新对话" });
    },
    [updateLastPrompt, setPendingPrompt],
  );

  const handleRetry = useCallback(() => {
    setAgentError(null);
    goHome();
  }, [setAgentError, goHome]);

  const handleCancelAgent = useCallback(() => {
    cancelAgent();
    goHome();
  }, [cancelAgent, goHome]);

  // 生成区操作按钮：点击触发 Agent 继续对话
  const handleSurfaceAction = useCallback(
    (action: string) => {
      const prompts: Record<string, string> = {
        approve: "满意，这个界面很好",
        color: "请修改配色方案",
        layout: "请调整布局结构",
        regenerate: "请重新生成这个界面",
      };
      const prompt = prompts[action] ?? action;
      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
      });
      copilotkit.runAgent({ agent }).catch(() => {
        // 静默处理
      });
    },
    [agent, copilotkit],
  );

  return (
    <Content key={conversationVersion} style={{ flex: 1, overflow: "auto", background: "#fff" }}>
      <AnimatePresence mode="wait">
        {agentError ? (
            <motion.div
              key="error"
              {...fadeSlide}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
              }}
            >
              <Result
                status="warning"
                title="生成失败"
                subTitle={agentError}
                extra={[
                  <Button key="retry" type="primary" onClick={handleRetry}>
                    返回首页重试
                  </Button>,
                ]}
              />
            </motion.div>
          ) : surfaces.length > 0 ? (
            <motion.div
              key="render"
              {...fadeSlide}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", minHeight: "100%", background: "#f5f5f5", justifyContent: "center" }}
            >
              <div style={{ flex: 1, overflow: "auto", padding: "24px", maxWidth: 1200, width: "100%" }}>
                <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Button
                    type="text"
                    icon={<HomeOutlined />}
                    onClick={goHome}
                    style={{ color: "#6b7280" }}
                  >
                    返回首页
                  </Button>
                  <Button
                    type="text"
                    icon={<PartitionOutlined />}
                    onClick={toggleEditor}
                    style={{ color: editorOpen ? "#3b82f6" : "#6b7280" }}
                  >
                    {editorOpen ? "隐藏" : "组件树"}
                  </Button>
                </div>
                {/* 对话消息区 */}
                {currentConversationDetail?.messages && currentConversationDetail.messages.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    {currentConversationDetail.messages
                      .filter((m) => m.role === "user" || m.role === "assistant")
                      .slice(-12)
                      .map((msg) => (
                        <div
                          key={msg.id}
                          style={{
                            marginBottom: 8,
                            padding: "8px 14px",
                            borderRadius: 8,
                            background: msg.role === "user" ? "#e8f0fe" : "#f8fafc",
                            border: msg.role === "user" ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: "#334155",
                            maxWidth: 800,
                            marginLeft: msg.role === "user" ? "auto" : 0,
                            marginRight: msg.role === "user" ? 0 : "auto",
                          }}
                        >
                          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>
                            {msg.role === "user" ? "你" : "AI 助手"}
                          </div>
                          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {msg.textContent ?? (() => {
                              try { return JSON.parse(msg.content).text ?? msg.content; } catch { return msg.content; }
                            })()}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                <RenderA2UITree
                  surfaces={surfaces}
                  onAction={runAgentAction ?? undefined}
                  selectedComponentId={selectedComponentId}
                  onSelectComponent={setSelectedComponentId}
                />

                {/* 生成区操作栏 */}
                <div
                  style={{
                    marginTop: 24,
                    padding: "16px 20px",
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Space size="middle">
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleSurfaceAction("approve")}
                      style={{ background: "#10b981", borderColor: "#10b981" }}
                    >
                      满意
                    </Button>
                    <Button
                      icon={<BgColorsOutlined />}
                      onClick={() => handleSurfaceAction("color")}
                    >
                      修改配色
                    </Button>
                    <Button
                      icon={<LayoutOutlined />}
                      onClick={() => handleSurfaceAction("layout")}
                    >
                      调整布局
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => handleSurfaceAction("regenerate")}
                    >
                      重新生成
                    </Button>
                  </Space>
                </div>
              </div>

              {editorOpen && (
                <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid #e8ecf0", width: 280, flexShrink: 0 }}>
                  <ComponentTreePanel />
                  {selectedComponentId && <ComponentInspector />}
                </div>
              )}
            </motion.div>
          ) : currentId && surfaces.length === 0 ? (
            <motion.div
              key="waiting"
              {...fadeSlide}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
                position: "relative",
                gap: 24,
              }}
            >
              <div style={{ position: "absolute", top: 16, left: 16 }}>
                <Button
                  type="text"
                  icon={<HomeOutlined />}
                  onClick={goHome}
                  style={{ color: "#6b7280" }}
                >
                  返回首页
                </Button>
              </div>

              {isAgentThinking && <Spin size="large" />}

              {/* 等待中 — 显示已有对话 */}
              {currentConversationDetail?.messages && currentConversationDetail.messages.length > 0 && (
                <div style={{ width: "100%", maxWidth: 700, padding: "0 24px" }}>
                  {currentConversationDetail.messages
                    .filter((m) => m.role === "user" || m.role === "assistant")
                    .slice(-6)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          marginBottom: 6,
                          padding: "6px 12px",
                          borderRadius: 6,
                          background: msg.role === "user" ? "#e8f0fe" : "#f8fafc",
                          border: msg.role === "user" ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: "#64748b",
                          opacity: 0.85,
                        }}
                      >
                        <span style={{ fontSize: 10, color: "#94a3b8", marginRight: 8 }}>
                          {msg.role === "user" ? "你" : "AI"}
                        </span>
                        <span style={{ whiteSpace: "pre-wrap" }}>
                          {(msg.textContent ?? (() => { try { return JSON.parse(msg.content).text ?? msg.content; } catch { return msg.content; } })()).slice(0, 200)}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <div style={{ textAlign: "center", color: "#999" }}>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Text type="secondary" style={{ fontSize: 15, display: "block", marginBottom: 8 }}>
                    {isAgentThinking ? "AI 正在生成界面..." : "准备中..."}
                  </Text>
                </motion.div>

                {isAgentThinking && (
                  <Button
                    type="default"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={handleCancelAgent}
                    style={{ marginTop: 16 }}
                  >
                    取消生成
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              {...fadeSlide}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
              }}
            >
              <WelcomeGallery onPromptSelect={handlePromptSelect} />
            </motion.div>
          )}
        </AnimatePresence>
    </Content>
  );
}
