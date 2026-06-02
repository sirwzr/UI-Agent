"use client";

import React, { useMemo, useState } from "react";
import { Typography, Row, Col, Segmented } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { TEMPLATES } from "@/lib/a2ui/templates";
import { TemplateCard } from "./TemplateCard";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const { Text } = Typography;

export function WelcomeGallery({
  onPromptSelect,
}: {
  onPromptSelect: (prompt: string, title: string, category: string) => void;
}) {
  const { lastPrompt } = useUserPreferences();
  const [category, setCategory] = useState<string>("全部");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(TEMPLATES.map((t) => t.category)));
    return ["全部", ...cats];
  }, []);

  const filtered = useMemo(
    () =>
      category === "全部"
        ? TEMPLATES
        : TEMPLATES.filter((t) => t.category === category),
    [category],
  );

  return (
    <div style={{ padding: "24px 24px 32px", width: "100%", minHeight: "100%" }}>
      {/* Hero — 简洁 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ textAlign: "center", marginBottom: 36 }}
      >
        <h1
          className="gradient-text"
          style={{
            margin: "0 0 8px",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.5px",
            lineHeight: 1.3,
          }}
        >
          AI 界面生成助手
        </h1>
        <Text style={{ fontSize: 14, color: "#64748b" }}>
          告诉我您需要什么样的界面，我会为您实时生成
        </Text>
      </motion.div>

      {/* 继续上次 */}
      {lastPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{
            padding: "14px 20px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#fafbfc",
            transition: "box-shadow 0.2s",
          }}
          onClick={() => onPromptSelect(lastPrompt, "继续上次", "")}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "";
          }}
        >
          <HistoryOutlined style={{ fontSize: 18, color: "#3b82f6" }} />
          <div style={{ overflow: "hidden" }}>
            <Text strong style={{ fontSize: 13, color: "#0f172a" }}>继续上次的工作</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
              {lastPrompt}
            </Text>
          </div>
        </motion.div>
      )}

      {/* 模板画廊 */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: 600 }}>
            快速开始
          </Text>
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
            选择模板开始引导式创建
          </Text>
        </div>
        <Segmented
          options={categories}
          value={category}
          onChange={(val) => setCategory(val as string)}
          size="small"
          style={{ background: "#f1f5f9" }}
        />
      </div>

      <Row gutter={[14, 14]}>
        {filtered.map((tpl, i) => (
          <Col key={tpl.id} xs={24} sm={12} md={8} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04, duration: 0.3 }}
            >
              <TemplateCard template={tpl} onClick={onPromptSelect} />
            </motion.div>
          </Col>
        ))}
      </Row>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
          <Text type="secondary">该分类暂无模板</Text>
        </div>
      )}
    </div>
  );
}
