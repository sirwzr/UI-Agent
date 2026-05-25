// ===== A2UI 组件 → Ant Design 映射 =====
// CopilotKit A2UI Renderer 使用此主题将 A2UI JSON 转换为真实的 Ant Design 组件

import React from "react";
import {
  Typography,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Checkbox,
  Select,
  Slider,
  Modal,
  Spin,
  Card,
  Divider,
  Steps,
  Tabs,
  Image,
  Row,
  Col,
  List,
} from "antd";
import {
  LoadingOutlined,
} from "@ant-design/icons";
import type { ComponentDef } from "./types";

const { Title, Text: AntText, Paragraph } = Typography;

// A2UI 组件渲染器类型
export type A2UIComponentRenderer = (
  props: ComponentDef,
  childrenMap: Record<string, React.ReactNode>,
) => React.ReactNode;

// 组件注册表
export const a2uiComponentRenderers: Record<string, A2UIComponentRenderer> = {
  // ---- 布局 ----
  Column: (props, childrenMap) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: props.gap ?? 16,
        alignItems: props.align === "center" ? "center"
          : props.align === "end" ? "flex-end"
          : "stretch",
      }}
    >
      {(props.children ?? []).map((childId) => (
        <div key={childId}>{childrenMap[childId]}</div>
      ))}
    </div>
  ),

  Row: (props, childrenMap) => (
    <Row gutter={props.gap ?? 12} align={props.align as "top" | "middle" | "bottom"}>
      {(props.children ?? []).map((childId) => (
        <Col key={childId}>{childrenMap[childId]}</Col>
      ))}
    </Row>
  ),

  Card: (props, childrenMap) => (
    <Card title={props.title} style={{ marginBottom: 16 }}>
      {(props.children ?? []).map((childId) => (
        <div key={childId}>{childrenMap[childId]}</div>
      ))}
    </Card>
  ),

  List: (props, childrenMap) => (
    <List>
      {(props.children ?? []).map((childId) => (
        <List.Item key={childId}>{childrenMap[childId]}</List.Item>
      ))}
    </List>
  ),

  Tabs: (props, childrenMap) => {
    const items = (props.tabs ?? []).map((tab) => ({
      key: tab.label,
      label: tab.label,
      children: childrenMap[tab.child],
    }));
    return <Tabs items={items} />;
  },

  // ---- 显示 ----
  Text: (props) => {
    switch (props.variant) {
      case "h1":
        return <Title level={2}>{props.text}</Title>;
      case "h2":
        return <Title level={4}>{props.text}</Title>;
      case "caption":
        return <AntText type="secondary">{props.text}</AntText>;
      default:
        return <AntText>{props.text}</AntText>;
    }
  },

  Image: (props) => (
    <Image
      src={props.url}
      alt={props.alt ?? ""}
      style={{
        objectFit: (props.fit as "contain" | "cover") ?? "cover",
        maxWidth: "100%",
      }}
      fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4="
    />
  ),

  Divider: () => <Divider />,

  // ---- 输入 ----
  TextField: (props) => {
    const { inputType, label, placeholder, validation } = props;

    if (inputType === "number") {
      return (
        <div style={{ marginBottom: 12 }}>
          {label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{label}</AntText>}
          <InputNumber
            placeholder={placeholder ?? label}
            min={validation?.min}
            max={validation?.max}
            style={{ width: "100%" }}
          />
        </div>
      );
    }

    return (
      <div style={{ marginBottom: 12 }}>
        {label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{label}</AntText>}
        <Input
          type={inputType ?? "text"}
          placeholder={placeholder ?? label}
          required={validation?.required}
        />
      </div>
    );
  },

  DateTimeInput: (props) => (
    <div style={{ marginBottom: 12 }}>
      {props.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{props.label}</AntText>}
      <DatePicker
        showTime={props.enableTime}
        placeholder={props.label ?? "选择日期"}
        style={{ width: "100%" }}
      />
    </div>
  ),

  CheckBox: (props) => (
    <Checkbox style={{ marginBottom: 12 }}>
      {props.label}
    </Checkbox>
  ),

  ChoicePicker: (props) => (
    <div style={{ marginBottom: 12 }}>
      {props.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{props.label}</AntText>}
      <Select
        placeholder={props.label ?? "请选择"}
        options={(props.options ?? []).map((opt) => ({ label: opt, value: opt }))}
        style={{ width: "100%" }}
      />
    </div>
  ),

  Slider: (props) => (
    <div style={{ marginBottom: 12 }}>
      {props.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{props.label}</AntText>}
      <Slider min={props.validation?.min ?? 0} max={props.validation?.max ?? 100} />
    </div>
  ),

  // ---- 交互 ----
  Button: (props, childrenMap) => (
    <Button
      type={props.primary ? "primary" : "default"}
      disabled={props.disabled}
      style={{ marginTop: 8 }}
    >
      {props.child ? childrenMap[props.child] : props.text}
    </Button>
  ),

  // ---- 反馈 ----
  Modal: (props, childrenMap) => (
    <Modal
      title={props.title}
      open={true}
      footer={null}
      closable={true}
    >
      {(props.children ?? []).map((childId) => (
        <div key={childId} style={{ marginBottom: 8 }}>{childrenMap[childId]}</div>
      ))}
    </Modal>
  ),

  Spinner: (props) => (
    <div style={{ textAlign: "center", padding: 40 }}>
      <Spin indicator={<LoadingOutlined spin />} tip={props.text}>
        <div style={{ minHeight: 60 }} />
      </Spin>
    </div>
  ),

  // ---- 自定义 ----
  ProgressStep: (props) => (
    <Steps
      current={props.currentStep ?? 0}
      items={(props.steps ?? []).map((step) => ({ title: step }))}
      style={{ marginBottom: 24 }}
    />
  ),
};

// 获取组件渲染器
export function getComponentRenderer(componentType: string): A2UIComponentRenderer | undefined {
  return a2uiComponentRenderers[componentType];
}

// 渲染整个 A2UI 组件树
export function renderA2UIComponent(
  component: ComponentDef,
  childrenMap: Record<string, React.ReactNode>,
): React.ReactNode {
  const renderer = getComponentRenderer(component.component);
  if (!renderer) {
    console.warn(`Unknown A2UI component: ${component.component}`);
    return <AntText type="danger">未知组件: {component.component}</AntText>;
  }
  return renderer(component, childrenMap);
}
