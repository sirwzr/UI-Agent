"use client";

import React, { useMemo } from "react";
import { Tree, Typography, Input, Empty } from "antd";
import {
  AppstoreOutlined,
  LineChartOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  TableOutlined,
  StarOutlined,
  TagOutlined,
  ClockCircleOutlined,
  FormOutlined,
  BarsOutlined,
  LayoutOutlined,
  FileTextOutlined,
  NumberOutlined,
  CheckSquareOutlined,
  DownSquareOutlined,
  UserOutlined,
  SearchOutlined,
  StepForwardOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { A2UIComponent } from "@/lib/a2ui/render-surface";
import { useAppStore } from "@/stores/app";

const { Text } = Typography;

const typeIcons: Record<string, React.ReactNode> = {
  Column: <LayoutOutlined />,
  Row: <BarsOutlined />,
  Card: <AppstoreOutlined />,
  List: <BarsOutlined />,
  Tabs: <BarsOutlined />,
  Text: <FileTextOutlined />,
  Image: <PictureOutlined />,
  Divider: <BarsOutlined />,
  TextField: <FormOutlined />,
  DateTimeInput: <ClockCircleOutlined />,
  CheckBox: <CheckSquareOutlined />,
  ChoicePicker: <DownSquareOutlined />,
  Slider: <BarsOutlined />,
  Button: <ThunderboltOutlined />,
  Modal: <AppstoreOutlined />,
  Spinner: <ThunderboltOutlined />,
  ProgressStep: <StepForwardOutlined />,
  Table: <TableOutlined />,
  Statistic: <NumberOutlined />,
  Tag: <TagOutlined />,
  Timeline: <ClockCircleOutlined />,
  Form: <FormOutlined />,
  SearchBar: <SearchOutlined />,
  Chart: <LineChartOutlined />,
  Carousel: <PictureOutlined />,
  Video: <PlayCircleOutlined />,
  Audio: <SoundOutlined />,
  RichText: <FileTextOutlined />,
  Rating: <StarOutlined />,
  QuickActionRow: <ThunderboltOutlined />,
  CollapsibleSection: <DownSquareOutlined />,
  StatusBadge: <TagOutlined />,
  Avatar: <UserOutlined />,
  NumberAnimation: <NumberOutlined />,
};

interface TreeNode {
  title: React.ReactNode;
  key: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
}

function buildTree(
  comps: A2UIComponent[],
  rootId: string,
  compMap: Map<string, A2UIComponent>,
  selectedId: string | null,
): TreeNode[] {
  const comp = compMap.get(rootId);
  if (!comp) return [];

  const childIds = comp.children ?? [];
  const childNodes: TreeNode[] = [];
  for (const cid of childIds) {
    const childTree = buildTree(comps, cid, compMap, selectedId);
    childNodes.push(...childTree);
  }

  const label = comp.text || comp.title || comp.label || comp.id;
  const isSelected = comp.id === selectedId;

  return [{
    key: comp.id,
    title: (
      <span style={{
        color: isSelected ? "#3b82f6" : undefined,
        fontWeight: isSelected ? 600 : undefined,
      }}>
        <Text style={{ fontSize: 12, color: "#94a3b8", marginRight: 6 }}>
          {comp.component}
        </Text>
        <Text ellipsis style={{ fontSize: 13, maxWidth: 140 }}>
          {typeof label === "string" ? label.slice(0, 24) : comp.id}
        </Text>
      </span>
    ),
    icon: typeIcons[comp.component] || <AppstoreOutlined />,
    children: childNodes.length > 0 ? childNodes : undefined,
  }];
}

export function ComponentTreePanel() {
  const surfaces = useAppStore((s) => s.surfaces);
  const selectedComponentId = useAppStore((s) => s.selectedComponentId);
  const setSelectedComponentId = useAppStore((s) => s.setSelectedComponentId);

  const treeData = useMemo(() => {
    if (!surfaces.length) return [];
    const surface = surfaces[0];
    const compMap = new Map<string, A2UIComponent>();
    for (const comp of surface.components) {
      compMap.set(comp.id, comp);
    }
    return buildTree(surface.components, "root", compMap, selectedComponentId);
  }, [surfaces, selectedComponentId]);

  const selectedKeys = selectedComponentId ? [selectedComponentId] : [];

  return (
    <div
      style={{
        width: 260,
        borderLeft: "1px solid var(--border-color, #e8ecf0)",
        background: "#fafbfc",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color, #e8ecf0)" }}>
        <Text strong style={{ fontSize: 13 }}>组件树</Text>
        <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
          {surfaces[0]?.components.length ?? 0} 个组件
        </Text>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "8px 4px" }}>
        {treeData.length > 0 ? (
          <Tree
            treeData={treeData}
            selectedKeys={selectedKeys}
            onSelect={(keys) => {
              if (keys.length > 0) {
                setSelectedComponentId(keys[0] as string);
              }
            }}
            showIcon
            defaultExpandAll
            style={{ fontSize: 13 }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text type="secondary" style={{ fontSize: 12 }}>暂无组件</Text>}
            style={{ marginTop: 32 }}
          />
        )}
      </div>
    </div>
  );
}
