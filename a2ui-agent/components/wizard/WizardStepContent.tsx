"use client";

import React from "react";
import { Checkbox, Typography } from "antd";
import type { ContentOption } from "@/lib/wizard/wizardConfig";

const { Text } = Typography;

interface WizardStepContentProps {
  title: string;
  description: string;
  contentOptions: ContentOption[];
  selected: string[];
  onChange: (keys: string[]) => void;
}

export function WizardStepContent({
  title,
  description,
  contentOptions,
  selected,
  onChange,
}: WizardStepContentProps) {
  return (
    <div>
      <Text strong style={{ fontSize: 16, display: "block", marginBottom: 6, color: "#0f172a" }}>
        {title}
      </Text>
      <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 24 }}>
        {description}
      </Text>

      <Checkbox.Group value={selected} onChange={(vals) => onChange(vals as string[])}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {contentOptions.map((opt) => (
            <div
              key={opt.key}
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                border: selected.includes(opt.key) ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
                background: selected.includes(opt.key) ? "#eff6ff" : "#fff",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onClick={() => {
                const next = selected.includes(opt.key)
                  ? selected.filter((k) => k !== opt.key)
                  : [...selected, opt.key];
                onChange(next);
              }}
            >
              <Checkbox checked={selected.includes(opt.key)} style={{ marginRight: 6 }}>
                <Text style={{ fontSize: 13, color: selected.includes(opt.key) ? "#1d4ed8" : "#334155" }}>
                  {opt.label}
                </Text>
              </Checkbox>
            </div>
          ))}
        </div>
      </Checkbox.Group>
    </div>
  );
}
