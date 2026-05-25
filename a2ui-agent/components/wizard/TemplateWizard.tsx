"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button, Typography } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { WizardProgress } from "./WizardProgress";
import { WizardStepScene } from "./WizardStepScene";
import { WizardStepContent } from "./WizardStepContent";
import { WizardStepStyle } from "./WizardStepStyle";
import { getWizardConfig, composePrompt, composeTitle } from "@/lib/wizard/wizardConfig";

const { Text, Title } = Typography;

const STEPS = [
  { label: "确认场景", description: "选择用途" },
  { label: "定制内容", description: "突出元素" },
  { label: "选择风格", description: "视觉偏好" },
];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

interface TemplateWizardProps {
  template: { prompt: string; title: string; category: string };
  onComplete: (composedPrompt: string, title: string) => void;
  onCancel: () => void;
}

export function TemplateWizard({ template, onComplete, onCancel }: TemplateWizardProps) {
  const config = useMemo(() => getWizardConfig(template.category), [template.category]);

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [sceneChoice, setSceneChoice] = useState<string | null>(null);
  const [customScene, setCustomScene] = useState("");
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, 2));
  }, []);

  const goBack = useCallback(() => {
    if (currentStep === 0) {
      onCancel();
    } else {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep, onCancel]);

  const handleGenerate = useCallback(() => {
    const prompt = composePrompt(
      template.prompt,
      sceneChoice,
      customScene,
      selectedContent,
      selectedStyle,
      config,
    );
    const title = composeTitle(template.title, selectedStyle, config);
    onComplete(prompt, title);
  }, [template, sceneChoice, customScene, selectedContent, selectedStyle, config, onComplete]);

  const canNext = () => {
    switch (currentStep) {
      case 0: return sceneChoice !== null && (sceneChoice !== "custom" || customScene.trim().length > 0);
      case 1: return true;
      case 2: return selectedStyle !== null;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WizardStepScene
            title={config.step1.title}
            description={config.step1.description}
            choices={config.step1.choices}
            allowCustom={config.step1.allowCustom}
            selected={sceneChoice}
            customValue={customScene}
            onSelect={setSceneChoice}
            onCustomChange={setCustomScene}
          />
        );
      case 1:
        return (
          <WizardStepContent
            title={config.step2.title}
            description={config.step2.description}
            contentOptions={config.step2.contentOptions}
            selected={selectedContent}
            onChange={setSelectedContent}
          />
        );
      case 2:
        return (
          <WizardStepStyle
            title={config.step3.title}
            description={config.step3.description}
            styles={config.step3.styles}
            selected={selectedStyle}
            onSelect={setSelectedStyle}
          />
        );
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "40px 32px 32px",
        minHeight: "100%",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={goBack} style={{ marginBottom: 16, color: "#64748b" }}>
          返回
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>{template.title.slice(-2) === "示" ? "📊" : template.title.slice(0, 2)}</span>
          <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
            {template.title}
          </Title>
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>
          通过以下 3 步引导，帮你定制最合适的界面
        </Text>
      </div>

      <WizardProgress steps={STEPS} currentStep={currentStep} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ minHeight: 240 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom actions */}
      <div
        style={{
          marginTop: 40,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 20,
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <Button onClick={goBack} icon={<ArrowLeftOutlined />}>
          {currentStep === 0 ? "返回首页" : "上一步"}
        </Button>

        {currentStep < 2 ? (
          <Button
            type="primary"
            onClick={goNext}
            disabled={!canNext()}
            icon={<ArrowRightOutlined />}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              border: "none",
              borderRadius: 8,
            }}
          >
            下一步
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={handleGenerate}
            disabled={!canNext()}
            icon={<ThunderboltOutlined />}
            style={{
              background: selectedStyle ? "linear-gradient(135deg, #3b82f6, #6366f1)" : undefined,
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              height: 40,
              padding: "0 24px",
            }}
          >
            生成界面
          </Button>
        )}
      </div>
    </div>
  );
}
