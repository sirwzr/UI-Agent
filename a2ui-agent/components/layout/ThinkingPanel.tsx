"use client";

import React from "react";
import { Layout, Steps, Typography, Spin, Tag } from "antd";
import { LoadingOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/app";

const { Sider } = Layout;
const { Text } = Typography;

const statusIcon = (status: string) => {
  switch (status) {
    case "in-progress":
      return <LoadingOutlined style={{ color: "#3b82f6" }} spin />;
    case "done":
      return <CheckCircleOutlined style={{ color: "#22c55e" }} />;
    default:
      return <ClockCircleOutlined style={{ color: "#cbd5e1" }} />;
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "in-progress": return "process";
    case "done": return "finish";
    default: return "wait";
  }
};

export function ThinkingPanel() {
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const thinkingStages = useAppStore((s) => s.thinkingStages);
  const isAgentThinking = useAppStore((s) => s.isAgentThinking);
  const searchStatus = useAppStore((s) => s.searchStatus);

  if (!rightPanelOpen) return null;

  const currentIdx =
    thinkingStages.findIndex((s) => s.status === "in-progress") >= 0
      ? thinkingStages.findIndex((s) => s.status === "in-progress")
      : thinkingStages.filter((s) => s.status === "done").length;

  return (
    <Sider
      width={360}
      style={{
        background: "var(--sidebar-gradient, linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%))",
        borderLeft: "1px solid var(--border-color, #e2e8f0)",
        overflow: "auto",
        padding: "24px 20px",
      }}
    >
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <Text strong style={{ fontSize: 15, color: "#0f172a" }}>
          思考过程
        </Text>
        {isAgentThinking && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <Spin indicator={<LoadingOutlined style={{ fontSize: 12, color: "#3b82f6" }} spin />} size="small" />
            </motion.span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              生成中...
            </Text>
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {thinkingStages.every((s) => s.status === "pending") && !isAgentThinking ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}
          >
            <ClockCircleOutlined style={{ fontSize: 32, marginBottom: 12, display: "block", color: "#cbd5e1" }} />
            <Text type="secondary">等待任务开始...</Text>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Steps
              direction="vertical"
              size="small"
              current={currentIdx}
              items={thinkingStages.map((stage) => ({
                title: (
                  <motion.span
                    key={stage.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      fontSize: 13,
                      fontWeight: stage.status === "in-progress" ? 600 : 400,
                      color: stage.status === "done" ? "#0f172a" : stage.status === "in-progress" ? "#3b82f6" : "#94a3b8",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {stage.label}
                    {stage.id === "search" && searchStatus?.status === "fallback" && (
                      <Tag
                        color="warning"
                        style={{ fontSize: 10, lineHeight: "18px", padding: "0 6px", margin: 0 }}
                        icon={<WarningOutlined style={{ fontSize: 10 }} />}
                      >
                        备用数据
                      </Tag>
                    )}
                  </motion.span>
                ),
                status: statusLabel(stage.status) as "process" | "finish" | "wait",
                icon: statusIcon(stage.status),
              }))}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Sider>
  );
}
