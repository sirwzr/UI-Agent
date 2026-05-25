"use client";

import React, { useMemo, useState } from "react";
import { Typography, Row, Col, Segmented } from "antd";
import { BulbOutlined, HistoryOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { TEMPLATES } from "@/lib/a2ui/templates";
import { TemplateCard } from "./TemplateCard";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const { Text, Title } = Typography;

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
    <div className="welcome-gradient" style={{ padding: "56px 24px 48px", maxWidth: 1080, margin: "0 auto", width: "100%", minHeight: "100%" }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ textAlign: "center", marginBottom: 48, position: "relative" }}
      >
        {/* 背景 orb */}
        <div
          className="hero-orb"
          style={{
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent)",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="hero-orb"
          style={{
            width: 200,
            height: 200,
            background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent)",
            top: -60,
            right: "10%",
          }}
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: "linear-gradient(135deg, #eff6ff, #ede9fe)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 4px 20px rgba(59,130,246,0.12)",
          }}
        >
          <BulbOutlined style={{ fontSize: 36, color: "#3b82f6" }} />
        </motion.div>

        <Title className="gradient-text" style={{ marginTop: 0, marginBottom: 12, fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px" }}>
          AI 界面生成助手
        </Title>
        <Text style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>
          告诉我您需要什么样的界面，我会为您实时生成
        </Text>
      </motion.div>

      {/* 继续上次 */}
      {lastPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass-card"
          style={{
            padding: "18px 24px",
            marginBottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            maxWidth: 540,
            marginLeft: "auto",
            marginRight: "auto",
            borderRadius: 14,
          }}
          onClick={() => onPromptSelect(lastPrompt, "继续上次", "")}
          whileHover={{ y: -3, boxShadow: "0 6px 24px rgba(0,0,0,0.08)" }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #eff6ff, #ede9fe)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <HistoryOutlined style={{ fontSize: 20, color: "#3b82f6" }} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <Text strong style={{ fontSize: 14, color: "#0f172a" }}>继续上次的工作</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
              {lastPrompt}
            </Text>
          </div>
        </motion.div>
      )}

      {/* 模板画廊 */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <Text style={{ fontSize: 16, color: "#0f172a", fontWeight: 600 }}>
            快速开始
          </Text>
          <Text type="secondary" style={{ marginLeft: 10, fontSize: 13 }}>
            点击模板卡片生成对应界面
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

      <Row gutter={[18, 18]}>
        {filtered.map((tpl, i) => (
          <Col key={tpl.id} xs={24} sm={12} md={8} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.35 }}
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
