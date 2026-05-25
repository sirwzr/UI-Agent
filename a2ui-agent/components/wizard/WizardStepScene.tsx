"use client";

import React from "react";
import { Input, Typography } from "antd";
import { motion } from "framer-motion";
import type { WizardChoice } from "@/lib/wizard/wizardConfig";

const { Text } = Typography;

interface WizardStepSceneProps {
  title: string;
  description: string;
  choices: WizardChoice[];
  allowCustom: boolean;
  selected: string | null;
  customValue: string;
  onSelect: (key: string | null) => void;
  onCustomChange: (value: string) => void;
}

export function WizardStepScene({
  title,
  description,
  choices,
  allowCustom,
  selected,
  customValue,
  onSelect,
  onCustomChange,
}: WizardStepSceneProps) {
  const isCustom = selected === "custom";

  return (
    <div>
      <Text strong style={{ fontSize: 16, display: "block", marginBottom: 6, color: "#0f172a" }}>
        {title}
      </Text>
      <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 24 }}>
        {description}
      </Text>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        {choices.map((choice) => {
          const isSelected = selected === choice.key;
          return (
            <motion.div
              key={choice.key}
              whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(59,130,246,0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(choice.key)}
              style={{
                padding: "18px 16px",
                borderRadius: 12,
                border: isSelected ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                background: isSelected ? "#eff6ff" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 28, flexShrink: 0 }}>{choice.icon}</span>
              <div>
                <Text strong style={{ fontSize: 14, display: "block", color: isSelected ? "#1d4ed8" : "#0f172a" }}>
                  {choice.label}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {choice.promptSuffix.slice(0, 30)}
                </Text>
              </div>
            </motion.div>
          );
        })}
      </div>

      {allowCustom && (
        <div
          onClick={() => onSelect("custom")}
          style={{
            padding: "14px 16px",
            borderRadius: 12,
            border: isCustom ? "2px solid #3b82f6" : "1px dashed #cbd5e1",
            background: isCustom ? "#eff6ff" : "#fafbfc",
            cursor: "pointer",
          }}
        >
          <Text style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: isCustom ? 8 : 0 }}>
            ✏️ 自定义场景描述
          </Text>
          {isCustom && (
            <Input.TextArea
              value={customValue}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder="详细描述你的使用场景..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ marginTop: 6, fontSize: 13 }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}
