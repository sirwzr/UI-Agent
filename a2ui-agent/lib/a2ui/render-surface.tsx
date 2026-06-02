"use client";

import React, { useState, useEffect } from "react";
import { Typography, Input, InputNumber, Button, DatePicker, Checkbox, Select, Slider, Card, Divider, Steps, Tabs, Image, Row, Col, List, Table, Statistic, Tag, Timeline, Form, Spin, Carousel, Rate, Collapse, Avatar, Modal, Radio, Switch, Progress, Skeleton, Empty, Breadcrumb, Drawer, Menu, Tooltip } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from "recharts";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

const { Title, Text: AntText } = Typography;

export interface A2UIComponent {
  id: string;
  component: string;
  children?: string[];
  child?: string;
  text?: string;
  variant?: string;
  label?: string;
  inputType?: string;
  placeholder?: string;
  validation?: { required?: boolean; min?: number; max?: number };
  enableDate?: boolean;
  enableTime?: boolean;
  action?: { name?: string; event?: { name: string; context?: Record<string, unknown> }; context?: Record<string, unknown> };
  primary?: boolean;
  variant_?: string;
  disabled?: boolean;
  title?: string;
  value?: string | number;
  prefix?: string;
  suffix?: string;
  trend?: string;
  color?: string;
  items?: ({ label: string; content: string } | { url: string; alt?: string; caption?: string } | { label: string; href?: string } | { label: string; key: string; icon?: string })[];
  tabs?: { label: string; child: string }[];
  columns?: { title: string; dataIndex: string }[];
  dataSource?: Record<string, unknown>;
  options?: string[];
  min?: number;
  max?: number;
  currentStep?: number;
  steps?: string[];
  gap?: number;
  align?: string;
  fit?: string;
  alt?: string;
  url?: string;
  autoplay?: boolean;
  interval?: number;
  caption?: string;
  src?: string;
  poster?: string;
  controls?: boolean;
  allowHalf?: boolean;
  name?: string;
  size?: number;
  shape?: "circle" | "square";
  type?: string;
  data?: Record<string, unknown>[];
  xField?: string;
  yField?: string;
  height?: number;
  content?: string;
  description?: string;
  status?: string;
  defaultOpen?: boolean;
  actions?: { label: string; name: string; primary?: boolean }[];
  duration?: number;
  checked?: boolean;
  percent?: number;
  showInfo?: boolean;
  placement?: string;
  open?: boolean;
  mode?: string;
  count?: number;
  animation?: {
    type?: "fadeInUp" | "fadeIn" | "slideInLeft" | "slideInRight" | "scaleIn" | "none";
    delay?: number;
    duration?: number;
    stagger?: number;
  };
}

export type ActionHandler = (action: { name: string; context: Record<string, unknown> }) => void;

function withAnimation(
  comp: A2UIComponent,
  el: React.ReactElement,
  index: number,
  selectedComponentId?: string | null,
  onSelectComponent?: (id: string) => void,
): React.ReactElement {
  const isSelected = selectedComponentId === comp.id;
  const anim = comp.animation;
  const animType = anim?.type ?? "fadeInUp";

  const variants: Record<string, Record<string, Record<string, unknown>>> = {
    fadeInUp: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
    fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
    slideInLeft: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
    slideInRight: { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } },
    scaleIn: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
  };
  const variant = variants[animType] ?? variants.fadeInUp;
  const delay = (anim?.delay ?? 0) + (anim?.stagger ?? 0.04) * index;

  const handleClick = (e: React.MouseEvent) => {
    if (onSelectComponent) {
      e.stopPropagation();
      onSelectComponent(comp.id);
    }
  };

  const selectionStyle = isSelected ? {
    outline: "2px solid #3b82f6",
    outlineOffset: 2,
    borderRadius: 6,
  } : {};

  const wrapper = (
    <motion.div
      initial={animType === "none" ? undefined : "hidden"}
      animate={animType === "none" ? undefined : "visible"}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants={animType === "none" ? undefined : (variant as any)}
      transition={{
        duration: anim?.duration ?? 0.3,
        delay,
        ease: "easeOut",
      }}
      onClick={handleClick}
      style={{ cursor: onSelectComponent ? "pointer" : undefined, ...selectionStyle }}
      whileHover={onSelectComponent && !isSelected ? { backgroundColor: "rgba(59,130,246,0.03)" } : undefined}
    >
      {el}
    </motion.div>
  );

  return wrapper;
}

// ---- Interactive wrapper for stateful components ----
function InteractiveTextField({ comp }: { comp: A2UIComponent }) {
  const [value, setValue] = useState(comp.value != null ? String(comp.value) : "");

  if (comp.inputType === "number") {
    return (
      <div style={{ marginBottom: 12 }}>
        {comp.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{comp.label}</AntText>}
        <InputNumber
          value={Number(value) || 0}
          onChange={(v) => setValue(String(v ?? ""))}
          placeholder={comp.placeholder ?? comp.label}
          min={comp.validation?.min}
          max={comp.validation?.max}
          style={{ width: "100%" }}
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {comp.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{comp.label}</AntText>}
      <Input
        type={comp.inputType ?? "text"}
        placeholder={comp.placeholder ?? comp.label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={comp.validation?.required}
      />
    </div>
  );
}

function InteractiveDateTimeInput({ comp }: { comp: A2UIComponent }) {
  const [value, setValue] = useState<any>(null);

  return (
    <div style={{ marginBottom: 12 }}>
      {comp.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{comp.label}</AntText>}
      <DatePicker
        showTime={comp.enableTime}
        value={value}
        onChange={(v) => setValue(v)}
        placeholder={comp.label ?? "选择日期"}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function InteractiveCheckBox({ comp }: { comp: A2UIComponent }) {
  const [checked, setChecked] = useState(!!comp.value);

  return (
    <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} style={{ marginBottom: 12 }}>
      {comp.label}
    </Checkbox>
  );
}

function InteractiveChoicePicker({ comp }: { comp: A2UIComponent }) {
  const [value, setValue] = useState(comp.value != null ? String(comp.value) : undefined);

  return (
    <div style={{ marginBottom: 12 }}>
      {comp.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{comp.label}</AntText>}
      <Select
        value={value}
        onChange={(v) => setValue(v)}
        placeholder={comp.label ?? "请选择"}
        options={(comp.options ?? []).map((opt) => ({ label: opt, value: opt }))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function InteractiveSlider({ comp }: { comp: A2UIComponent }) {
  const [value, setValue] = useState(typeof comp.value === "number" ? comp.value : (comp.min ?? 0));

  return (
    <div style={{ marginBottom: 12 }}>
      {comp.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{comp.label}</AntText>}
      <Slider min={comp.min ?? 0} max={comp.max ?? 100} value={value} onChange={(v) => setValue(v)} />
    </div>
  );
}

function InteractiveRating({ comp }: { comp: A2UIComponent }) {
  const [val, setVal] = useState(typeof comp.value === "number" ? comp.value : 0);

  return (
    <div style={{ marginBottom: 12 }}>
      {comp.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{comp.label}</AntText>}
      <Rate value={val} onChange={(v) => setVal(v)} count={comp.max ?? 5} allowHalf={comp.allowHalf} disabled={comp.disabled} />
    </div>
  );
}

function InteractiveNumberAnimation({ comp }: { comp: A2UIComponent }) {
  const target = typeof comp.value === "number" ? comp.value : 0;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const dur = comp.duration ?? 1500;
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
  }, [target, comp.duration]);

  return (
    <Card size="small" style={{ minWidth: 120, textAlign: "center", marginBottom: 12 }}>
      <Statistic title={comp.label} value={displayValue} prefix={comp.prefix} suffix={comp.suffix} valueStyle={{ fontSize: 24, fontWeight: 600 }} />
    </Card>
  );
}

// ---- Phase 5 new interactive components ----
function InteractiveRadio({ comp }: { comp: A2UIComponent }) {
  const [val, setVal] = useState(comp.value != null ? String(comp.value) : undefined);

  return (
    <div style={{ marginBottom: 12 }}>
      {comp.label && <AntText strong style={{ display: "block", marginBottom: 4 }}>{comp.label}</AntText>}
      <Radio.Group value={val} onChange={(e) => setVal(e.target.value)}>
        {(comp.options ?? []).map((opt) => (
          <Radio key={opt} value={opt}>{opt}</Radio>
        ))}
      </Radio.Group>
    </div>
  );
}

function InteractiveSwitch({ comp }: { comp: A2UIComponent }) {
  const [checked, setChecked] = useState(comp.checked ?? false);

  return (
    <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <Switch checked={checked} onChange={(v) => setChecked(v)} />
      {comp.label && <AntText>{comp.label}</AntText>}
    </div>
  );
}

function InteractiveDrawer({ comp, allComponents, onAction, selectedComponentId, onSelectComponent }: {
  comp: A2UIComponent;
  allComponents: Map<string, A2UIComponent>;
  onAction?: ActionHandler;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string) => void;
}) {
  const [open, setOpen] = useState(comp.open ?? true);

  return (
    <Drawer
      title={comp.title}
      placement={(comp.placement as "top" | "right" | "bottom" | "left") ?? "right"}
      open={open}
      onClose={() => setOpen(false)}
    >
      {(comp.children ?? []).map((childId, i) => {
        const child = allComponents.get(childId);
        if (!child) return null;
        return <RenderComponent key={childId} comp={child} allComponents={allComponents} onAction={onAction} index={i} selectedComponentId={selectedComponentId} onSelectComponent={onSelectComponent} />;
      })}
    </Drawer>
  );
}

export function RenderComponent({
  comp,
  allComponents,
  onAction,
  index = 0,
  selectedComponentId,
  onSelectComponent,
}: {
  comp: A2UIComponent;
  allComponents: Map<string, A2UIComponent>;
  onAction?: ActionHandler;
  index?: number;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string) => void;
}) {
  const children = comp.children?.map((cid, i) => {
    const child = allComponents.get(cid);
    if (!child) return null;
    return <RenderComponent key={cid} comp={child} allComponents={allComponents} onAction={onAction} index={i} selectedComponentId={selectedComponentId} onSelectComponent={onSelectComponent} />;
  });

  const childEl = comp.child ? (() => {
    const c = allComponents.get(comp.child!);
    if (!c) return null;
    return <RenderComponent comp={c} allComponents={allComponents} onAction={onAction} index={0} selectedComponentId={selectedComponentId} onSelectComponent={onSelectComponent} />;
  })() : null;

  const isPrimary = comp.primary || comp.variant_ === "primary";

  const result = (() => {
  switch (comp.component) {
    case "Column":
      return <div style={{ display: "flex", flexDirection: "column", gap: comp.gap ?? 16 }}>{children}</div>;
    case "Row":
      return <Row gutter={comp.gap ?? 12}>{children?.map((c, i) => <Col key={i}>{c}</Col>)}</Row>;
    case "Card":
      return <Card title={comp.title} style={{ marginBottom: 16 }}>{children}</Card>;
    case "Form":
      return <div style={{ marginBottom: 16 }}>{comp.title && <Title level={4} style={{ marginBottom: 16 }}>{comp.title}</Title>}<Form layout="vertical">{children}</Form></div>;
    case "List":
      return <List>{(comp.children ?? []).map((cid) => <List.Item key={cid}>{allComponents.get(cid) && <RenderComponent comp={allComponents.get(cid)!} allComponents={allComponents} onAction={onAction} />}</List.Item>)}</List>;
    case "Tabs":
      return <Tabs items={(comp.tabs ?? []).map((tab) => ({ key: tab.label, label: tab.label, children: allComponents.get(tab.child) ? <RenderComponent comp={allComponents.get(tab.child)!} allComponents={allComponents} onAction={onAction} /> : null }))} />;
    case "Text":
      switch (comp.variant) {
        case "h1": return <Title level={2}>{comp.text}</Title>;
        case "h2": return <Title level={4}>{comp.text}</Title>;
        case "caption": return <AntText type="secondary">{comp.text}</AntText>;
        default: return <AntText>{comp.text}</AntText>;
      }
    case "Image":
      return <Image src={comp.url || undefined} alt={comp.alt ?? ""} style={{ objectFit: (comp.fit as "contain" | "cover") ?? "cover", maxWidth: "100%" }} />;
    case "Divider":
      return <Divider />;
    case "TextField":
      return <InteractiveTextField comp={comp} />;
    case "DateTimeInput":
      return <InteractiveDateTimeInput comp={comp} />;
    case "CheckBox":
      return <InteractiveCheckBox comp={comp} />;
    case "ChoicePicker":
      return <InteractiveChoicePicker comp={comp} />;
    case "Slider":
      return <InteractiveSlider comp={comp} />;
    case "Button": {
      const action = comp.action;
      const actionName = action?.name ?? action?.event?.name;
      const actionContext = action?.context ?? action?.event?.context ?? {};
      const handleClick = () => {
        if (actionName && onAction) {
          onAction({ name: actionName, context: actionContext as Record<string, unknown> });
        }
      };
      return <Button type={isPrimary ? "primary" : "default"} disabled={comp.disabled} onClick={handleClick} style={{ marginTop: 8 }}>
        {childEl ?? comp.text}
      </Button>;
    }
    case "SearchBar": {
      const action = comp.action;
      const actionName = action?.name ?? action?.event?.name;
      const handleSearch = (value: string) => {
        if (actionName && onAction) {
          onAction({ name: actionName, context: { keyword: value } });
        }
      };
      return <Input.Search placeholder={comp.placeholder ?? "搜索..."} onSearch={handleSearch} allowClear style={{ flex: 1 }} />;
    }
    case "Modal":
      return <Modal title={comp.title} open={true} footer={null} closable={true}>{children}</Modal>;
    case "Spinner":
      return <div style={{ textAlign: "center", padding: 40 }}><Spin indicator={<LoadingOutlined spin />} tip={comp.text}><div style={{ minHeight: 60 }} /></Spin></div>;
    case "ProgressStep":
      return <Steps current={comp.currentStep ?? 0} items={(comp.steps ?? []).map((step) => ({ title: step }))} style={{ marginBottom: 24 }} />;
    case "Table": {
      const raw = comp.dataSource;
      const records = Array.isArray(raw)
        ? raw
        : (raw as unknown as { records?: Record<string, unknown>[] } | undefined)?.records;
      const data = Array.isArray(records) ? records : [];
      return <Table columns={comp.columns ?? []} dataSource={data} rowKey="id" size="middle" pagination={{ pageSize: 10 }} style={{ marginBottom: 12 }} />;
    }
    case "Statistic":
      return <Card size="small" style={{ minWidth: 140, textAlign: "center" }}><Statistic title={comp.title} value={comp.value} prefix={comp.prefix} suffix={comp.suffix} valueStyle={{ fontSize: 20 }} /></Card>;
    case "Tag":
      return <Tag color={comp.color}>{comp.text}</Tag>;
    case "Timeline":
      return <Timeline items={(comp.items ?? []).map((item) => {
        const tlItem = item as { label: string; content: string };
        return { children: <div><AntText strong>{tlItem.label}</AntText><div><AntText type="secondary">{tlItem.content}</AntText></div></div> };
      })} />;
    case "Chart": {
      const chartData = (comp.data ?? []) as Record<string, unknown>[];
      const xf = comp.xField ?? "name";
      const yf = comp.yField ?? "value";
      const chartColor = comp.color ?? "#2563eb";
      const chartHeight = comp.height ?? 280;
      const chartType = comp.type ?? "bar";
      const chartEl = (() => {
        switch (chartType) {
          case "line":
            return <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={xf} /><YAxis /><ReTooltip /><Line type="monotone" dataKey={yf} stroke={chartColor} strokeWidth={2} /></LineChart>;
          case "pie": {
            const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2"];
            return <PieChart><Pie data={chartData} dataKey={yf} nameKey={xf} cx="50%" cy="50%" outerRadius={80} label>{(chartData).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><ReTooltip /></PieChart>;
          }
          case "area":
            return <AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={xf} /><YAxis /><ReTooltip /><Area type="monotone" dataKey={yf} stroke={chartColor} fill={chartColor} fillOpacity={0.2} /></AreaChart>;
          default:
            return <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={xf} /><YAxis /><ReTooltip /><Bar dataKey={yf} fill={chartColor} radius={[4, 4, 0, 0]} /></BarChart>;
        }
      })();
      return (
        <div style={{ marginBottom: 16 }}>
          {comp.title && <Title level={5} style={{ marginBottom: 8 }}>{comp.title}</Title>}
          <ResponsiveContainer width="100%" height={chartHeight}>
            {chartEl}
          </ResponsiveContainer>
        </div>
      );
    }
    case "Carousel": {
      const carItems = (comp.items ?? []) as unknown as { url: string; alt?: string; caption?: string }[];
      return (
        <div style={{ marginBottom: 16 }}>
          <Carousel autoplay={comp.autoplay ?? false} autoplaySpeed={comp.autoplay ? (comp.interval ?? 3000) : undefined}>
            {carItems.map((item, i) => (
              <div key={i}>
                <Image src={item.url || undefined} alt={item.alt ?? ""} style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 8 }} preview={false} />
                {item.caption && <div style={{ textAlign: "center", padding: "8px 0" }}><AntText type="secondary">{item.caption}</AntText></div>}
              </div>
            ))}
          </Carousel>
        </div>
      );
    }
    case "Video":
      if (!comp.src) {
        return <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8f9fc", borderRadius: 8, marginBottom: 16 }}>
          <AntText type="secondary">暂无视频资源</AntText>
        </div>;
      }
      return (
        <div style={{ marginBottom: 16 }}>
          {comp.title && <AntText strong style={{ display: "block", marginBottom: 8 }}>{comp.title}</AntText>}
          <video
            src={comp.src}
            poster={comp.poster || undefined}
            autoPlay={comp.autoplay}
            controls={comp.controls ?? true}
            style={{ width: "100%", borderRadius: 8, maxHeight: 480 }}
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const fallback = el.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div style={{ display: "none", padding: "40px 20px", textAlign: "center", background: "#f8f9fc", borderRadius: 8, marginBottom: 16 }}>
            <AntText type="secondary">视频加载失败，请检查网络后重试</AntText>
          </div>
        </div>
      );
    case "Audio":
      if (!comp.src) {
        return <div style={{ padding: "24px 16px", textAlign: "center", background: "#f8f9fc", borderRadius: 8, marginBottom: 12 }}>
          <AntText type="secondary">暂无音频资源</AntText>
        </div>;
      }
      return (
        <div style={{ marginBottom: 12, padding: "12px 16px", background: "#f8f9fc", borderRadius: 8 }}>
          {comp.title && <AntText strong style={{ display: "block", marginBottom: 8 }}>{comp.title}</AntText>}
          <audio
            src={comp.src}
            autoPlay={comp.autoplay}
            controls={comp.controls ?? true}
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
    case "RichText": {
      const rtColor = comp.variant === "hint" ? "#999" : undefined;
      return (
        <div style={{ color: rtColor, marginBottom: 8, lineHeight: 1.7 }}>
          <ReactMarkdown>{comp.content ?? comp.text ?? ""}</ReactMarkdown>
        </div>
      );
    }
    case "Rating":
      return <InteractiveRating comp={comp} />;
    case "QuickActionRow":
      return (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {(comp.actions ?? []).map((action, i) => (
            <Button
              key={i}
              type={action.primary ? "primary" : "default"}
              onClick={() => onAction?.({ name: action.name, context: {} })}
            >
              {action.label}
            </Button>
          ))}
        </div>
      );
    case "CollapsibleSection": {
      const items = [{
        key: "1",
        label: comp.title ?? "展开",
        children: children,
      }];
      return (
        <Collapse defaultActiveKey={comp.defaultOpen ? ["1"] : []} items={items} style={{ marginBottom: 12 }} />
      );
    }
    case "StatusBadge": {
      const colorMap: Record<string, string> = { success: "#52c41a", error: "#ff4d4f", warning: "#faad14", info: "#1677ff", default: "#d9d9d9" };
      return <Tag color={colorMap[comp.status ?? "default"]} style={{ marginBottom: 8 }}>{comp.text}</Tag>;
    }
    case "Avatar":
      return (
        <Avatar src={comp.src || undefined} size={comp.size ?? 40} shape={comp.shape ?? "circle"} style={{ backgroundColor: comp.src ? undefined : "#2563eb" }}>
          {!comp.src ? (comp.name?.charAt(0)?.toUpperCase() ?? "?") : null}
        </Avatar>
      );
    case "NumberAnimation":
      return <InteractiveNumberAnimation comp={comp} />;

    // ---- Phase 5 新增组件 ----
    case "Radio":
      return <InteractiveRadio comp={comp} />;
    case "Switch":
      return <InteractiveSwitch comp={comp} />;
    case "Progress":
      return (
        <div style={{ marginBottom: 12 }}>
          <Progress percent={comp.percent ?? 0} status={comp.status as "success" | "exception" | "normal" | "active"} showInfo={comp.showInfo ?? true} />
        </div>
      );
    case "Skeleton": {
      const count = comp.count ?? 1;
      if (comp.type === "list") {
        return (
          <div style={{ marginBottom: 12 }}>
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} active avatar paragraph={{ rows: 1 }} style={{ marginBottom: 8 }} />
            ))}
          </div>
        );
      }
      if (comp.type === "paragraph") {
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
    case "Empty":
      return <Empty description={comp.description ?? "暂无数据"} style={{ marginBottom: 12 }} />;
    case "Breadcrumb":
      return (
        <Breadcrumb
          style={{ marginBottom: 12 }}
          items={(comp.items ?? []).map((item) => {
            const bi = item as { label: string; href?: string };
            return { title: bi.href ? <a href={bi.href}>{bi.label}</a> : bi.label };
          })}
        />
      );
    case "Drawer":
      return <InteractiveDrawer comp={comp} allComponents={allComponents} onAction={onAction} selectedComponentId={selectedComponentId} onSelectComponent={onSelectComponent} />;
    case "Menu":
      return (
        <Menu
          mode={(comp.mode as "vertical" | "horizontal" | "inline") ?? "inline"}
          style={{ marginBottom: 12 }}
          items={(comp.items ?? []).map((item) => {
            const mi = item as { label: string; key: string; icon?: string };
            return { key: mi.key, label: mi.label, icon: mi.icon ? <AntText>{mi.icon}</AntText> : undefined };
          })}
        />
      );
    case "Tooltip": {
      const tooltipChild = comp.child ? allComponents.get(comp.child) : null;
      return (
        <Tooltip title={comp.text}>
          <span style={{ display: "inline-block" }}>
            {tooltipChild ? <RenderComponent comp={tooltipChild} allComponents={allComponents} onAction={onAction} index={0} selectedComponentId={selectedComponentId} onSelectComponent={onSelectComponent} /> : null}
          </span>
        </Tooltip>
      );
    }
    default:
      return <AntText type="secondary">[{comp.component}]</AntText>;
  }
  })();

  return withAnimation(comp, result, index, selectedComponentId, onSelectComponent);
}


export interface ParsedSurface {
  surfaceId: string;
  catalogId?: string;
  components: A2UIComponent[];
}

export function parseSurfaces(operations: Record<string, unknown>[]): ParsedSurface[] {
  const map = new Map<string, ParsedSurface>();
  for (const op of operations) {
    const cs = op.createSurface as { surfaceId?: string; catalogId?: string } | undefined;
    const uc = op.updateComponents as { surfaceId?: string; components?: A2UIComponent[] } | undefined;
    const sid = cs?.surfaceId ?? uc?.surfaceId ?? "default";
    if (!map.has(sid)) {
      map.set(sid, { surfaceId: sid, catalogId: cs?.catalogId, components: [] });
    }
    const entry = map.get(sid)!;
    if (cs?.catalogId) entry.catalogId = cs.catalogId;
    if (uc?.components) entry.components = uc.components;
  }
  return Array.from(map.values());
}

export function RenderA2UITree({
  surfaces,
  onAction,
  selectedComponentId,
  onSelectComponent,
}: {
  surfaces: ParsedSurface[];
  onAction?: ActionHandler;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string) => void;
}) {
  if (!surfaces.length) return null;
  return (
    <div style={{ padding: "16px 0", maxWidth: 1100, margin: "0 auto" }}>
      {surfaces.map((surface) => {
        const compMap = new Map<string, A2UIComponent>();
        for (const comp of surface.components) {
          compMap.set(comp.id, comp);
        }
        const root = compMap.get("root");
        if (!root) return null;
        return (
          <div key={surface.surfaceId} style={{ background: "#fff", borderRadius: 10, padding: 24, border: "1px solid #e8ecf0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", maxWidth: "100%" }}>
            <RenderComponent comp={root} allComponents={compMap} onAction={onAction} selectedComponentId={selectedComponentId} onSelectComponent={onSelectComponent} />
          </div>
        );
      })}
    </div>
  );
}
