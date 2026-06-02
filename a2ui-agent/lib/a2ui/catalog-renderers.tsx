"use client";

// ===== A2UI 组件 React 渲染器 =====
// 将 A2UI v0.9 组件渲染为 Ant Design 组件
// 接收 { props, children, dispatch } — CopilotKit RendererProps 接口

import React, { useState, useEffect } from "react";
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
  Table,
  Statistic,
  Tag,
  Timeline,
  Form,
  Carousel,
  Rate,
  Collapse,
  Avatar,
  Radio,
  Switch,
  Progress,
  Skeleton,
  Empty,
  Breadcrumb,
  Drawer,
  Menu,
  Tooltip,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import type { RendererProps } from "@copilotkit/a2ui-renderer";
import ReactMarkdown from "react-markdown";

const { Title, Text: AntText } = Typography;

// ---- 布局 ----
function ColumnRenderer({ props, children }: RendererProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: (props as { gap?: number }).gap ?? 16,
        alignItems:
          (props as { align?: string }).align === "center" ? "center"
            : (props as { align?: string }).align === "end" ? "flex-end"
            : "stretch",
      }}
    >
      {((props as { children?: string[] }).children ?? []).map((childId: string) => (
        <div key={childId}>{children(childId)}</div>
      ))}
    </div>
  );
}

function RowRenderer({ props, children }: RendererProps) {
  return (
    <Row gutter={(props as { gap?: number }).gap ?? 12}>
      {((props as { children?: string[] }).children ?? []).map((childId: string) => (
        <Col key={childId}>{children(childId)}</Col>
      ))}
    </Row>
  );
}

function CardRenderer({ props, children }: RendererProps) {
  const p = props as { title?: string; children?: string[] };
  return (
    <Card title={p.title} style={{ marginBottom: 16 }}>
      {(p.children ?? []).map((childId: string) => (
        <div key={childId}>{children(childId)}</div>
      ))}
    </Card>
  );
}

function ListRenderer({ props, children }: RendererProps) {
  return (
    <List>
      {((props as { children?: string[] }).children ?? []).map((childId: string) => (
        <List.Item key={childId}>{children(childId)}</List.Item>
      ))}
    </List>
  );
}

function TabsRenderer({ props, children }: RendererProps) {
  const p = props as { tabs?: { label: string; child: string }[] };
  const items = (p.tabs ?? []).map((tab: { label: string; child: string }) => ({
    key: tab.label,
    label: tab.label,
    children: children(tab.child),
  }));
  return <Tabs items={items} />;
}

// ---- 显示 ----
function TextRenderer({ props }: RendererProps) {
  const p = props as { text: string; variant?: string };
  switch (p.variant) {
    case "h1":
      return <Title level={2}>{p.text}</Title>;
    case "h2":
      return <Title level={4}>{p.text}</Title>;
    case "caption":
      return <AntText type="secondary">{p.text}</AntText>;
    default:
      return <AntText>{p.text}</AntText>;
  }
}

function ImageRenderer({ props }: RendererProps) {
  const p = props as { url: string; alt?: string; fit?: string; height?: number };
  return (
    <Image
      src={p.url}
      alt={p.alt ?? ""}
      style={{
        objectFit: (p.fit as "contain" | "cover") ?? "cover",
        width: "100%",
        maxHeight: p.height ?? 280,
        borderRadius: 8,
      }}
    />
  );
}

function DividerRenderer() {
  return <Divider />;
}

// ---- 输入 ----
function TextFieldRenderer({ props }: RendererProps) {
  const p = props as {
    label?: string;
    inputType?: string;
    placeholder?: string;
    value?: string;
    validation?: { required?: boolean; min?: number; max?: number };
  };
  const [value, setValue] = useState(p.value ?? "");

  if (p.inputType === "number") {
    return (
      <div style={{ marginBottom: 12 }}>
        {p.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{p.label}</AntText>}
        <InputNumber
          value={Number(value) || 0}
          onChange={(v) => setValue(String(v ?? ""))}
          placeholder={p.placeholder ?? p.label}
          min={p.validation?.min}
          max={p.validation?.max}
          style={{ width: "100%" }}
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {p.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{p.label}</AntText>}
      <Input
        type={p.inputType ?? "text"}
        placeholder={p.placeholder ?? p.label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={p.validation?.required}
      />
    </div>
  );
}

function DateTimeInputRenderer({ props }: RendererProps) {
  const p = props as { label?: string; enableTime?: boolean };
  const [value, setValue] = useState<any>(null);

  return (
    <div style={{ marginBottom: 12 }}>
      {p.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{p.label}</AntText>}
      <DatePicker
        showTime={p.enableTime}
        value={value}
        onChange={(v) => setValue(v)}
        placeholder={p.label ?? "选择日期"}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function CheckBoxRenderer({ props }: RendererProps) {
  const p = props as { label?: string; value?: boolean };
  const [checked, setChecked] = useState(p.value ?? false);

  return (
    <Checkbox
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
      style={{ marginBottom: 12 }}
    >
      {p.label}
    </Checkbox>
  );
}

function ChoicePickerRenderer({ props }: RendererProps) {
  const p = props as { label?: string; options?: string[]; value?: string };
  const [value, setValue] = useState(p.value);

  return (
    <div style={{ marginBottom: 12 }}>
      {p.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{p.label}</AntText>}
      <Select
        value={value}
        onChange={(v) => setValue(v)}
        placeholder={p.label ?? "请选择"}
        options={(p.options ?? []).map((opt: string) => ({ label: opt, value: opt }))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function SliderRenderer({ props }: RendererProps) {
  const p = props as { label?: string; min?: number; max?: number; value?: number };
  const [value, setValue] = useState(p.value ?? (p.min ?? 0));

  return (
    <div style={{ marginBottom: 12 }}>
      {p.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{p.label}</AntText>}
      <Slider
        min={p.min ?? 0}
        max={p.max ?? 100}
        value={value}
        onChange={(v) => setValue(v)}
      />
    </div>
  );
}

// ---- 交互 ----
function ButtonRenderer({ props, children, dispatch }: RendererProps) {
  const p = props as {
    text?: string;
    child?: string;
    action?: { name?: string; event?: { name: string; context?: Record<string, unknown> }; context?: Record<string, unknown> };
    variant?: string;
    primary?: boolean;
    disabled?: boolean;
  };

  const handleClick = () => {
    if (!dispatch) return;
    const flatAction = p.action;
    if (!flatAction) return;
    const actionName = flatAction.name ?? flatAction.event?.name;
    const actionContext = flatAction.context ?? flatAction.event?.context ?? {};
    if (actionName) {
      dispatch({
        userAction: { name: actionName, context: actionContext },
      });
    }
  };

  return (
    <Button
      type={p.primary || p.variant === "primary" ? "primary" : "default"}
      disabled={p.disabled}
      onClick={handleClick}
      style={{ marginTop: 8 }}
    >
      {p.child ? children(p.child) : p.text}
    </Button>
  );
}

// ---- 反馈 ----
function ModalRenderer({ props, children }: RendererProps) {
  const p = props as { title?: string; children?: string[] };
  return (
    <Modal title={p.title} open={true} footer={null} closable={true}>
      {(p.children ?? []).map((childId: string) => (
        <div key={childId} style={{ marginBottom: 8 }}>
          {children(childId)}
        </div>
      ))}
    </Modal>
  );
}

function SpinnerRenderer({ props }: RendererProps) {
  const p = props as { text?: string };
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <Spin indicator={<LoadingOutlined spin />} tip={p.text}>
        <div style={{ minHeight: 60 }} />
      </Spin>
    </div>
  );
}

// ---- 数据展示 ----
function TableRenderer({ props }: RendererProps) {
  const p = props as {
    columns?: { title: string; dataIndex: string }[];
    dataSource?: Record<string, unknown>[];
  };
  const records = Array.isArray(p.dataSource)
    ? p.dataSource
    : (p.dataSource as unknown as { records?: Record<string, unknown>[] } | undefined)?.records;
  const data = Array.isArray(records) ? records : [];

  return (
    <Table
      columns={p.columns ?? []}
      dataSource={data as Record<string, unknown>[]}
      rowKey="id"
      size="middle"
      pagination={{ pageSize: 10, showSizeChanger: true }}
      style={{ marginBottom: 12 }}
    />
  );
}

function StatisticRenderer({ props }: RendererProps) {
  const p = props as {
    title?: string;
    value?: string | number;
    prefix?: string;
    suffix?: string;
    trend?: "up" | "down";
  };
  const trendColor = p.trend === "up" ? "#3f8600" : p.trend === "down" ? "#cf1322" : undefined;
  const trendArrow = p.trend === "up" ? "↑" : p.trend === "down" ? "↓" : undefined;

  return (
    <Card size="small" style={{ minWidth: 140, textAlign: "center" }}>
      <Statistic
        title={p.title}
        value={p.value}
        prefix={p.prefix}
        suffix={p.suffix}
        valueStyle={trendColor ? { color: trendColor, fontSize: 20 } : { fontSize: 20 }}
      />
      {trendArrow && (
        <AntText style={{ color: trendColor, fontSize: 12 }}>{trendArrow}</AntText>
      )}
    </Card>
  );
}

function TagRenderer({ props }: RendererProps) {
  const p = props as { text: string; color?: string };
  return <Tag color={p.color}>{p.text}</Tag>;
}

function TimelineRenderer({ props }: RendererProps) {
  const p = props as { items?: { label: string; content: string }[] };
  return (
    <Timeline
      items={(p.items ?? []).map((item) => ({
        children: (
          <div>
            <AntText strong>{item.label}</AntText>
            <div><AntText type="secondary">{item.content}</AntText></div>
          </div>
        ),
      }))}
    />
  );
}

// ---- 布局扩展 ----
function FormRenderer({ props, children }: RendererProps) {
  const p = props as { title?: string; children?: string[] };
  return (
    <div style={{ marginBottom: 16 }}>
      {p.title && <Title level={4} style={{ marginBottom: 16 }}>{p.title}</Title>}
      <Form layout="vertical">
        {(p.children ?? []).map((childId: string) => (
          <div key={childId}>{children(childId)}</div>
        ))}
      </Form>
    </div>
  );
}

function SearchBarRenderer({ props, dispatch }: RendererProps) {
  const p = props as {
    placeholder?: string;
    action?: { name: string; context?: Record<string, unknown> };
  };

  const handleSearch = (value: string) => {
    if (p.action && dispatch) {
      dispatch({
        userAction: {
          name: p.action.name,
          context: { ...p.action.context, keyword: value },
        },
      });
    }
  };

  return (
    <Input.Search
      placeholder={p.placeholder ?? "搜索..."}
      onSearch={handleSearch}
      allowClear
      style={{ flex: 1 }}
    />
  );
}

// ---- 自定义 ----
function ProgressStepRenderer({ props }: RendererProps) {
  const p = props as { steps?: string[]; currentStep?: number };
  return (
    <Steps
      current={p.currentStep ?? 0}
      items={(p.steps ?? []).map((step: string) => ({ title: step }))}
      style={{ marginBottom: 24 }}
    />
  );
}

// ---- 数据可视化 ----
function ChartRenderer({ props }: RendererProps) {
  const p = props as { type?: string; title?: string; height?: number };
  return (
    <Card size="small" title={p.title ?? "图表"} style={{ marginBottom: 12, minHeight: p.height ?? 200 }}>
      <div style={{ textAlign: "center", color: "#999" }}>
        [{p.type ?? "bar"} 图表]
      </div>
    </Card>
  );
}

// ---- 媒体 ----
function CarouselRenderer({ props }: RendererProps) {
  const p = props as { items?: { url: string; alt?: string; caption?: string }[]; autoplay?: boolean; interval?: number };
  return (
    <div style={{ marginBottom: 12 }}>
      <Carousel autoplay={p.autoplay ?? true} autoplaySpeed={(p.interval ?? 3000)}>
        {(p.items ?? []).map((item, i) => (
          <div key={i}>
            <Image src={item.url} alt={item.alt ?? ""} style={{ width: "100%", maxHeight: 300, objectFit: "cover" }} />
            {item.caption && <div style={{ textAlign: "center", padding: 8 }}><AntText type="secondary">{item.caption}</AntText></div>}
          </div>
        ))}
      </Carousel>
    </div>
  );
}

function VideoRenderer({ props }: RendererProps) {
  const p = props as { src?: string; title?: string; poster?: string; autoplay?: boolean; controls?: boolean };
  if (!p.src) {
    return <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8f9fc", borderRadius: 8, marginBottom: 12 }}>
      <AntText type="secondary">暂无视频资源</AntText>
    </div>;
  }
  return (
    <div style={{ marginBottom: 12 }}>
      {p.title && <AntText strong style={{ display: "block", marginBottom: 4 }}>{p.title}</AntText>}
      <video
        src={p.src}
        poster={p.poster}
        autoPlay={p.autoplay}
        controls={p.controls ?? true}
        style={{ width: "100%", borderRadius: 8 }}
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          const fallback = el.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "block";
        }}
      />
      <div style={{ display: "none", padding: "40px 20px", textAlign: "center", background: "#f8f9fc", borderRadius: 8, marginBottom: 12 }}>
        <AntText type="secondary">视频加载失败，请检查网络后重试</AntText>
      </div>
    </div>
  );
}

function AudioRenderer({ props }: RendererProps) {
  const p = props as { src?: string; title?: string; autoplay?: boolean; controls?: boolean };
  if (!p.src) {
    return <div style={{ padding: "24px 16px", textAlign: "center", background: "#f8f9fc", borderRadius: 8, marginBottom: 12 }}>
      <AntText type="secondary">暂无音频资源</AntText>
    </div>;
  }
  return (
    <div style={{ marginBottom: 12 }}>
      {p.title && <AntText strong style={{ display: "block", marginBottom: 4 }}>{p.title}</AntText>}
      <audio
        src={p.src}
        autoPlay={p.autoplay}
        controls={p.controls ?? true}
        style={{ width: "100%" }}
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          const fallback = el.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "block";
        }}
      />
      <div style={{ display: "none", padding: "24px 16px", textAlign: "center", background: "#f8f9fc", borderRadius: 8 }}>
        <AntText type="secondary">音频加载失败，请检查网络后重试</AntText>
      </div>
    </div>
  );
}

// ---- 内容 ----
function RichTextRenderer({ props }: RendererProps) {
  const p = props as { content: string; variant?: string };
  const color = p.variant === "hint" ? "#999" : undefined;
  return (
    <div style={{ color, marginBottom: 8 }}>
      <ReactMarkdown>{p.content}</ReactMarkdown>
    </div>
  );
}

// ---- 交互扩展 ----
function RatingRenderer({ props }: RendererProps) {
  const p = props as { label?: string; value?: number; max?: number; allowHalf?: boolean; disabled?: boolean };
  const [val, setVal] = useState(p.value ?? 0);

  return (
    <div style={{ marginBottom: 12 }}>
      {p.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{p.label}</AntText>}
      <Rate
        value={val}
        onChange={(v) => setVal(v)}
        count={p.max ?? 5}
        allowHalf={p.allowHalf}
        disabled={p.disabled}
      />
    </div>
  );
}

function QuickActionRowRenderer({ props, dispatch }: RendererProps) {
  const p = props as { actions?: { label: string; name: string; primary?: boolean }[] };
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
      {(p.actions ?? []).map((action, i) => (
        <Button
          key={i}
          type={action.primary ? "primary" : "default"}
          onClick={() => {
            if (dispatch) {
              dispatch({
                userAction: { name: action.name, context: {} },
              });
            }
          }}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

// ---- 布局扩展 ----
function CollapsibleSectionRenderer({ props, children }: RendererProps) {
  const p = props as { title: string; children?: string[]; defaultOpen?: boolean };
  return (
    <Collapse
      defaultActiveKey={p.defaultOpen ? ["1"] : []}
      items={[{
        key: "1",
        label: p.title,
        children: (p.children ?? []).map((childId: string) => (
          <div key={childId}>{children(childId)}</div>
        )),
      }]}
      style={{ marginBottom: 12 }}
    />
  );
}

// ---- 显示扩展 ----
function StatusBadgeRenderer({ props }: RendererProps) {
  const p = props as { text: string; status?: string };
  const colorMap: Record<string, string> = {
    success: "#52c41a",
    error: "#ff4d4f",
    warning: "#faad14",
    info: "#1677ff",
    default: "#d9d9d9",
  };
  const color = colorMap[p.status ?? "default"];
  return <Tag color={color}>{p.text}</Tag>;
}

function AvatarRenderer({ props }: RendererProps) {
  const p = props as { src?: string; name?: string; size?: number; shape?: "circle" | "square" };
  const textContent = p.name?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <Avatar
      src={p.src}
      size={p.size ?? 40}
      shape={p.shape ?? "circle"}
      style={{ backgroundColor: p.src ? undefined : "#1677ff" }}
    >
      {!p.src ? textContent : null}
    </Avatar>
  );
}

function NumberAnimationRenderer({ props }: RendererProps) {
  const p = props as { value: number; prefix?: string; suffix?: string; duration?: number; label?: string };
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = p.value;
    const dur = p.duration ?? 1500;
    const startTime = Date.now();
    const startValue = 0;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / dur, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(startValue + (target - startValue) * eased));
      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [p.value, p.duration]);

  return (
    <Card size="small" style={{ minWidth: 120, textAlign: "center" }}>
      <Statistic
        title={p.label}
        value={displayValue}
        prefix={p.prefix}
        suffix={p.suffix}
        valueStyle={{ fontSize: 24, fontWeight: 600 }}
      />
    </Card>
  );
}

// ---- Phase 5 新增组件渲染器 ----
function RadioRenderer({ props }: RendererProps) {
  const p = props as { label?: string; options?: string[]; value?: string };
  const [val, setVal] = useState(p.value);

  return (
    <div style={{ marginBottom: 12 }}>
      {p.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{p.label}</AntText>}
      <Radio.Group value={val} onChange={(e) => setVal(e.target.value)}>
        {(p.options ?? []).map((opt) => (
          <Radio key={opt} value={opt}>{opt}</Radio>
        ))}
      </Radio.Group>
    </div>
  );
}

function SwitchRenderer({ props }: RendererProps) {
  const p = props as { label?: string; checked?: boolean };
  const [checked, setChecked] = useState(p.checked ?? false);

  return (
    <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <Switch checked={checked} onChange={(v) => setChecked(v)} />
      {p.label && <AntText>{p.label}</AntText>}
    </div>
  );
}

function ProgressRenderer({ props }: RendererProps) {
  const p = props as { percent: number; status?: "success" | "exception" | "normal" | "active"; showInfo?: boolean };
  return (
    <div style={{ marginBottom: 12 }}>
      <Progress percent={p.percent} status={p.status} showInfo={p.showInfo ?? true} />
    </div>
  );
}

function SkeletonRenderer({ props }: RendererProps) {
  const p = props as { type?: "card" | "list" | "paragraph"; count?: number };
  const count = p.count ?? 1;

  if (p.type === "list") {
    return (
      <div style={{ marginBottom: 12 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} active avatar paragraph={{ rows: 1 }} style={{ marginBottom: 8 }} />
        ))}
      </div>
    );
  }
  if (p.type === "paragraph") {
    return (
      <div style={{ marginBottom: 12 }}>
        <Skeleton active paragraph={{ rows: count }} />
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 12 }}>
      <Skeleton active />
    </div>
  );
}

function EmptyRenderer({ props }: RendererProps) {
  const p = props as { description?: string };
  return <Empty description={p.description ?? "暂无数据"} style={{ marginBottom: 12 }} />;
}

function BreadcrumbRenderer({ props }: RendererProps) {
  const p = props as { items?: { label: string; href?: string }[] };
  return (
    <Breadcrumb
      style={{ marginBottom: 12 }}
      items={(p.items ?? []).map((item) => ({
        title: item.href ? <a href={item.href}>{item.label}</a> : item.label,
      }))}
    />
  );
}

function DrawerRenderer({ props, children }: RendererProps) {
  const p = props as { title?: string; children?: string[]; placement?: "top" | "right" | "bottom" | "left"; open?: boolean };
  const [open, setOpen] = useState(p.open ?? true);

  return (
    <Drawer
      title={p.title}
      placement={p.placement ?? "right"}
      open={open}
      onClose={() => setOpen(false)}
    >
      {(p.children ?? []).map((childId: string) => (
        <div key={childId}>{children(childId)}</div>
      ))}
    </Drawer>
  );
}

function MenuRenderer({ props }: RendererProps) {
  const p = props as { items?: { label: string; key: string; icon?: string }[]; mode?: "vertical" | "horizontal" | "inline" };
  return (
    <Menu
      mode={p.mode ?? "inline"}
      style={{ marginBottom: 12 }}
      items={(p.items ?? []).map((item) => ({
        key: item.key,
        label: item.label,
        icon: item.icon ? <AntText>{item.icon}</AntText> : undefined,
      }))}
    />
  );
}

function TooltipRenderer({ props, children }: RendererProps) {
  const p = props as { text: string; child: string };
  return (
    <Tooltip title={p.text}>
      <span style={{ display: "inline-block" }}>{children(p.child)}</span>
    </Tooltip>
  );
}

export const a2uiRenderers = {
  Column: ColumnRenderer,
  Row: RowRenderer,
  Card: CardRenderer,
  List: ListRenderer,
  Tabs: TabsRenderer,
  Text: TextRenderer,
  Image: ImageRenderer,
  Divider: DividerRenderer,
  TextField: TextFieldRenderer,
  DateTimeInput: DateTimeInputRenderer,
  CheckBox: CheckBoxRenderer,
  ChoicePicker: ChoicePickerRenderer,
  Slider: SliderRenderer,
  Button: ButtonRenderer,
  Modal: ModalRenderer,
  Spinner: SpinnerRenderer,
  ProgressStep: ProgressStepRenderer,
  Table: TableRenderer,
  Statistic: StatisticRenderer,
  Tag: TagRenderer,
  Timeline: TimelineRenderer,
  Form: FormRenderer,
  SearchBar: SearchBarRenderer,
  Chart: ChartRenderer,
  Carousel: CarouselRenderer,
  Video: VideoRenderer,
  Audio: AudioRenderer,
  RichText: RichTextRenderer,
  Rating: RatingRenderer,
  QuickActionRow: QuickActionRowRenderer,
  CollapsibleSection: CollapsibleSectionRenderer,
  StatusBadge: StatusBadgeRenderer,
  Avatar: AvatarRenderer,
  NumberAnimation: NumberAnimationRenderer,
  Radio: RadioRenderer,
  Switch: SwitchRenderer,
  Progress: ProgressRenderer,
  Skeleton: SkeletonRenderer,
  Empty: EmptyRenderer,
  Breadcrumb: BreadcrumbRenderer,
  Drawer: DrawerRenderer,
  Menu: MenuRenderer,
  Tooltip: TooltipRenderer,
};
