"use client";

import React, { useCallback } from "react";
import { Layout, Typography, Button, Result, Spin } from "antd";
import { HomeOutlined, PartitionOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/app";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { RenderA2UITree } from "@/lib/a2ui/render-surface";
import { WelcomeGallery } from "@/components/welcome/WelcomeGallery";
import { TemplateWizard } from "@/components/wizard/TemplateWizard";
import { ComponentTreePanel } from "@/components/editor/ComponentTreePanel";
import { ComponentInspector } from "@/components/editor/ComponentInspector";

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
  const agentError = useAppStore((s) => s.agentError);
  const setAgentError = useAppStore((s) => s.setAgentError);
  const setPendingPrompt = useAppStore((s) => s.setPendingPrompt);
  const goHome = useAppStore((s) => s.goHome);
  const editorOpen = useAppStore((s) => s.editorOpen);
  const toggleEditor = useAppStore((s) => s.toggleEditor);
  const selectedComponentId = useAppStore((s) => s.selectedComponentId);
  const setSelectedComponentId = useAppStore((s) => s.setSelectedComponentId);
  const activeWizard = useAppStore((s) => s.activeWizard);
  const setActiveWizard = useAppStore((s) => s.setActiveWizard);
  const cancelAgent = useAppStore((s) => s.cancelAgent);
  const isAgentThinking = useAppStore((s) => s.isAgentThinking);
  const { updateLastPrompt } = useUserPreferences();

  // 模板卡片点击 → 打开向导
  const handlePromptSelect = useCallback(
    (prompt: string, title: string, category: string) => {
      updateLastPrompt(prompt);
      // 「继续上次」无类别，跳过向导直接发送
      if (!category) {
        setPendingPrompt({ prompt, title });
        return;
      }
      setActiveWizard({ template: { prompt, title, category } });
    },
    [updateLastPrompt, setPendingPrompt, setActiveWizard],
  );

  // 向导完成 → 触发聊天注入
  const handleWizardComplete = useCallback(
    (composedPrompt: string, title: string) => {
      setActiveWizard(null);
      setPendingPrompt({ prompt: composedPrompt, title });
    },
    [setActiveWizard, setPendingPrompt],
  );

  const handleWizardCancel = useCallback(() => {
    setActiveWizard(null);
  }, [setActiveWizard]);

  const handleRetry = useCallback(() => {
    setAgentError(null);
    goHome();
  }, [setAgentError, goHome]);

  const handleCancelAgent = useCallback(() => {
    cancelAgent();
    goHome();
  }, [cancelAgent, goHome]);

  return (
    <Content style={{ flex: 1, overflow: "auto", background: "#fff" }}>
      {/* Wizard 向导（替换旧 TemplateConfirmModal） */}
      {activeWizard && (
        <TemplateWizard
          template={activeWizard.template}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}

      {!activeWizard && (
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
              style={{ display: "flex", minHeight: "100%", background: "#f5f5f5" }}
            >
              <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
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
                <RenderA2UITree
                  surfaces={surfaces}
                  onAction={runAgentAction ?? undefined}
                  selectedComponentId={selectedComponentId}
                  onSelectComponent={setSelectedComponentId}
                />
              </div>

              {editorOpen && (
                <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid #e8ecf0" }}>
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

              <div style={{ textAlign: "center", color: "#999" }}>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Text type="secondary" style={{ fontSize: 15, display: "block", marginBottom: 8 }}>
                    {isAgentThinking ? "AI 正在生成界面..." : "在左侧输入框中描述您的需求，界面将在此处实时生成"}
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
      )}
    </Content>
  );
}
