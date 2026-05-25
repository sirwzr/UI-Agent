"use client";

import React, { useMemo, useCallback } from "react";
import { Form, Input, InputNumber, Select, Switch, Typography, Empty, ColorPicker, Slider } from "antd";
import type { A2UIComponent } from "@/lib/a2ui/render-surface";
import { useAppStore } from "@/stores/app";

const { Text, Title } = Typography;

const EDITABLE_PROPS: Record<string, { key: string; label: string; type: "text" | "number" | "color" | "select" | "switch" | "slider"; options?: string[] }[]> = {
  Text: [
    { key: "text", label: "文本内容", type: "text" },
  ],
  Statistic: [
    { key: "title", label: "标题", type: "text" },
    { key: "value", label: "数值", type: "text" },
    { key: "prefix", label: "前缀", type: "text" },
    { key: "suffix", label: "后缀", type: "text" },
  ],
  Chart: [
    { key: "title", label: "标题", type: "text" },
    { key: "type", label: "图表类型", type: "select", options: ["bar", "line", "pie", "area"] },
    { key: "color", label: "颜色", type: "color" },
    { key: "height", label: "高度", type: "number" },
  ],
  NumberAnimation: [
    { key: "label", label: "标签", type: "text" },
    { key: "value", label: "数值", type: "number" },
    { key: "prefix", label: "前缀", type: "text" },
    { key: "suffix", label: "后缀", type: "text" },
    { key: "duration", label: "动画时长(ms)", type: "number" },
  ],
  Tag: [
    { key: "text", label: "文本", type: "text" },
    { key: "color", label: "颜色", type: "select", options: ["blue", "green", "red", "orange", "purple", "cyan", "magenta", "gold"] },
  ],
  StatusBadge: [
    { key: "text", label: "文本", type: "text" },
    { key: "status", label: "状态", type: "select", options: ["success", "error", "warning", "info", "default"] },
  ],
  Rating: [
    { key: "label", label: "标签", type: "text" },
    { key: "value", label: "星级", type: "slider" },
    { key: "max", label: "最大星级", type: "number" },
  ],
  QuickActionRow: [],
  Button: [],
  Image: [
    { key: "url", label: "图片URL", type: "text" },
    { key: "alt", label: "替代文本", type: "text" },
  ],
  Carousel: [],
  Video: [
    { key: "src", label: "视频URL", type: "text" },
    { key: "title", label: "标题", type: "text" },
  ],
  Audio: [
    { key: "src", label: "音频URL", type: "text" },
    { key: "title", label: "标题", type: "text" },
  ],
};

export function ComponentInspector() {
  const surfaces = useAppStore((s) => s.surfaces);
  const selectedComponentId = useAppStore((s) => s.selectedComponentId);
  const setSelectedComponentId = useAppStore((s) => s.setSelectedComponentId);
  const updateComponentProp = useAppStore((s) => s.updateComponentProp);

  const comp = useMemo(() => {
    if (!selectedComponentId || !surfaces.length) return null;
    const surface = surfaces[0];
    return surface.components.find((c) => c.id === selectedComponentId) ?? null;
  }, [surfaces, selectedComponentId]);

  const propsDef = useMemo(() => {
    if (!comp) return [];
    return EDITABLE_PROPS[comp.component] ?? [];
  }, [comp]);

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (!comp || !surfaces.length) return;
      updateComponentProp(surfaces[0].surfaceId, comp.id, key, value);
    },
    [comp, surfaces, updateComponentProp],
  );

  if (!comp) {
    return (
      <div style={{ padding: 16, borderTop: "1px solid var(--border-color, #e8ecf0)", background: "#fafbfc" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="secondary" style={{ fontSize: 12 }}>点击组件树中节点查看属性</Text>}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        borderTop: "1px solid var(--border-color, #e8ecf0)",
        background: "#fafbfc",
        maxHeight: 240,
        overflow: "auto",
      }}
    >
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-color, #e8ecf0)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Text strong style={{ fontSize: 13 }}>属性编辑</Text>
          <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
            {comp.component} · {comp.id}
          </Text>
        </div>
        <Text
          type="secondary"
          style={{ fontSize: 11, cursor: "pointer" }}
          onClick={() => setSelectedComponentId(null)}
        >
          关闭
        </Text>
      </div>

      <div style={{ padding: "8px 16px 12px" }}>
        <Form layout="vertical" size="small">
          {propsDef.map((def) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = (comp as any)[def.key];
            return (
              <Form.Item key={def.key} label={<Text style={{ fontSize: 12 }}>{def.label}</Text>} style={{ marginBottom: 8 }}>
                {def.type === "text" && (
                  <Input
                    value={value as string ?? ""}
                    onChange={(e) => handleChange(def.key, e.target.value)}
                    size="small"
                  />
                )}
                {def.type === "number" && (
                  <InputNumber
                    value={value as number ?? 0}
                    onChange={(v) => handleChange(def.key, v)}
                    size="small"
                    style={{ width: "100%" }}
                  />
                )}
                {def.type === "color" && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <ColorPicker
                      value={value as string ?? "#2563eb"}
                      onChange={(c) => handleChange(def.key, c.toHexString())}
                      size="small"
                    />
                    <Input
                      value={value as string ?? ""}
                      onChange={(e) => handleChange(def.key, e.target.value)}
                      size="small"
                      style={{ flex: 1 }}
                    />
                  </div>
                )}
                {def.type === "select" && (
                  <Select
                    value={value as string ?? ""}
                    onChange={(v) => handleChange(def.key, v)}
                    options={(def.options ?? []).map((o) => ({ label: o, value: o }))}
                    size="small"
                    style={{ width: "100%" }}
                  />
                )}
                {def.type === "switch" && (
                  <Switch
                    checked={!!value}
                    onChange={(v) => handleChange(def.key, v)}
                    size="small"
                  />
                )}
                {def.type === "slider" && (
                  <Slider
                    value={value as number ?? 0}
                    onChange={(v) => handleChange(def.key, v)}
                    min={0}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    max={(comp as any).max as number ?? 5}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    step={comp.component === "Rating" && (comp as any).allowHalf ? 0.5 : 1}
                  />
                )}
              </Form.Item>
            );
          })}
          {propsDef.length === 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>此组件类型暂无可编辑属性</Text>
          )}
        </Form>
      </div>
    </div>
  );
}
