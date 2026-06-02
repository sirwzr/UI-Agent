"use client";

import React from "react";
import { Card, Typography, Tag } from "antd";
import { motion } from "framer-motion";
import type { TemplateDef } from "@/lib/a2ui/templates";

const { Text } = Typography;

export function TemplateCard({
  template,
  onClick,
}: {
  template: TemplateDef;
  onClick: (prompt: string, title: string, category: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      whileTap={{ y: -1, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ borderRadius: 12, height: "100%" }}
    >
      <Card
        hoverable
        size="small"
        onClick={() => onClick(template.prompt, template.title, template.category)}
        style={{
          height: "100%",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
        styles={{ body: { padding: "14px 16px" } }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* 左侧 emoji 图标 */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(135deg, #f0f4ff, #ede9fe)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 22,
            }}
          >
            {template.emoji}
          </div>

          {/* 右侧文本 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginBottom: 4 }}>
              {template.title}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: 11, display: "block", marginBottom: 8, lineHeight: 1.4 }}
              ellipsis
            >
              {template.description}
            </Text>
            <Tag
              color="blue"
              style={{
                fontSize: 10,
                borderRadius: 5,
                background: "#eff6ff",
                border: "none",
                color: "#3b82f6",
                lineHeight: "18px",
              }}
            >
              {template.category}
            </Tag>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
