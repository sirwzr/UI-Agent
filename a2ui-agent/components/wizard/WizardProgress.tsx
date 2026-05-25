"use client";

import React from "react";
import { Steps } from "antd";
import { motion } from "framer-motion";

interface WizardProgressProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
}

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div style={{ marginBottom: 32, padding: "0 8px" }}>
      <Steps
        current={currentStep}
        size="small"
        items={steps.map((s, i) => ({
          title: (
            <motion.span
              animate={{
                color: i === currentStep ? "#3b82f6" : i < currentStep ? "#22c55e" : "#94a3b8",
                fontWeight: i === currentStep ? 600 : 400,
              }}
              style={{ fontSize: 13 }}
            >
              {s.label}
            </motion.span>
          ),
          description: s.description ? (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{s.description}</span>
          ) : undefined,
        }))}
      />
    </div>
  );
}
