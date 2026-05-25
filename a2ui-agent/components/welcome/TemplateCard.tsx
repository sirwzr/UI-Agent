"use client";

import React from "react";
import { Card, Typography, Tag } from "antd";
import { motion } from "framer-motion";
import type { TemplateDef } from "@/lib/a2ui/templates";
import { RenderComponent } from "@/lib/a2ui/render-surface";

const { Text } = Typography;

export function TemplateCard({
  template,
  onClick,
}: {
  template: TemplateDef;
  onClick: (prompt: string, title: string, category: string) => void;
}) {
  const compMap = new Map(template.components.map((c) => [c.id, c]));
  const root = compMap.get("root");

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
      whileTap={{ y: -2, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ borderRadius: 14, height: "100%" }}
    >
      <Card
        hoverable
        size="small"
        className="template-card-hover"
        onClick={() => onClick(template.prompt, template.title, template.category)}
        style={{
          height: "100%",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--border-color, #e2e8f0)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
        styles={{ body: { padding: "16px 18px" } }}
        cover={
          <div
            style={{
              height: 180,
              overflow: "hidden",
              background: "linear-gradient(135deg, #fafbfc 0%, #f0f4f8 100%)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              borderBottom: "1px solid #e8ecf0",
              position: "relative",
            }}
          >
            {/* Emoji 图标 */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 12,
                fontSize: 26,
                opacity: 0.85,
                zIndex: 1,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            >
              {template.emoji}
            </div>
            <div
              style={{
                width: "182%",
                transform: "scale(0.55)",
                transformOrigin: "top left",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {root ? (
                <RenderComponent comp={root} allComponents={compMap} />
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>预览不可用</Text>
              )}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 48,
                background: "linear-gradient(transparent, rgba(250,251,252,0.95) 80%)",
                pointerEvents: "none",
              }}
            />
          </div>
        }
      >
        <Card.Meta
          title={
            <Text strong style={{ fontSize: 14, color: "#0f172a" }}>
              {template.title}
            </Text>
          }
          description={
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 10, lineHeight: 1.5 }}
                ellipsis
              >
                {template.description}
              </Text>
              <Tag
                color="blue"
                style={{
                  fontSize: 11,
                  borderRadius: 6,
                  background: "#eff6ff",
                  border: "none",
                  color: "#3b82f6",
                }}
              >
                {template.category}
              </Tag>
            </div>
          }
        />
      </Card>
    </motion.div>
  );
}
