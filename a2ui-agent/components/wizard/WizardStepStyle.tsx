"use client";

import React from "react";
import { Typography } from "antd";
import { motion } from "framer-motion";
import type { StylePreset } from "@/lib/wizard/wizardConfig";

const { Text } = Typography;

interface WizardStepStyleProps {
  title: string;
  description: string;
  styles: StylePreset[];
  selected: string | null;
  onSelect: (key: string) => void;
}

export function WizardStepStyle({
  title,
  description,
  styles,
  selected,
  onSelect,
}: WizardStepStyleProps) {
  return (
    <div>
      <Text strong style={{ fontSize: 16, display: "block", marginBottom: 6, color: "#0f172a" }}>
        {title}
      </Text>
      <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 24 }}>
        {description}
      </Text>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {styles.map((style) => {
          const isSelected = selected === style.key;
          const { bg, accent, text: textColor } = style.visualPreview;
          return (
            <motion.div
              key={style.key}
              whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(style.key)}
              style={{
                borderRadius: 14,
                border: isSelected ? "2.5px solid #3b82f6" : "1px solid #e2e8f0",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: isSelected ? "0 4px 20px rgba(59,130,246,0.2)" : undefined,
              }}
            >
              {/* 颜色预览 */}
              <div
                style={{
                  height: 64,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "0 16px",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: accent,
                    boxShadow: `0 2px 8px ${accent}66`,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ height: 8, borderRadius: 4, background: accent, opacity: 0.3, width: "60%" }} />
                  <div style={{ height: 6, borderRadius: 3, background: textColor, opacity: 0.2, width: "40%" }} />
                </div>
              </div>
              <div style={{ padding: "14px 16px", background: isSelected ? "#eff6ff" : "#fff" }}>
                <Text strong style={{ fontSize: 14, display: "block", color: isSelected ? "#1d4ed8" : "#0f172a" }}>
                  {style.emoji} {style.label}
                </Text>
                <Text type="secondary" style={{ fontSize: 11, marginTop: 2, display: "block" }}>
                  {style.description}
                </Text>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
