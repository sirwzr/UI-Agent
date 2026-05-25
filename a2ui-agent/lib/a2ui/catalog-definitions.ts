// ===== A2UI 组件 Zod Schema 定义 =====
// 平台无关的组件契约 — 供 CopilotKit createCatalog 使用
import { z } from "zod";

const actionDef = z.object({
  name: z.string(),
  context: z.record(z.unknown()).optional(),
});

const validationDef = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
});

export const a2uiDefinitions = {
  // ---- 布局 ----
  Column: {
    description: "垂直布局容器，子组件纵向排列",
    props: z.object({
      children: z.array(z.string()).optional(),
      align: z.enum(["start", "center", "end", "stretch"]).optional(),
      gap: z.number().optional(),
    }),
  },
  Row: {
    description: "水平布局容器，子组件横向排列",
    props: z.object({
      children: z.array(z.string()).optional(),
      align: z.enum(["top", "middle", "bottom"]).optional(),
      gap: z.number().optional(),
    }),
  },
  Card: {
    description: "卡片容器，带标题和边框",
    props: z.object({
      title: z.string().optional(),
      children: z.array(z.string()).optional(),
    }),
  },
  List: {
    description: "列表容器，子组件作为列表项展示",
    props: z.object({
      children: z.array(z.string()).optional(),
    }),
  },
  Tabs: {
    description: "标签页容器，每个 tab 可包含一个子组件",
    props: z.object({
      tabs: z.array(z.object({ label: z.string(), child: z.string() })).optional(),
    }),
  },

  // ---- 显示 ----
  Text: {
    description: "文本显示，支持 h1/h2/body/caption 变体",
    props: z.object({
      text: z.string(),
      variant: z.enum(["h1", "h2", "body", "caption"]).optional(),
    }),
  },
  Image: {
    description: "图片展示",
    props: z.object({
      url: z.string(),
      alt: z.string().optional(),
      fit: z.enum(["contain", "cover"]).optional(),
    }),
  },
  Divider: {
    description: "分割线",
    props: z.object({}),
  },

  // ---- 输入 ----
  TextField: {
    description: "文本/数字输入框，支持验证",
    props: z.object({
      label: z.string().optional(),
      inputType: z.enum(["text", "number", "email", "password"]).optional(),
      placeholder: z.string().optional(),
      value: z.string().optional(),
      validation: validationDef.optional(),
    }),
  },
  DateTimeInput: {
    description: "日期时间选择器",
    props: z.object({
      label: z.string().optional(),
      enableDate: z.boolean().optional(),
      enableTime: z.boolean().optional(),
    }),
  },
  CheckBox: {
    description: "复选框",
    props: z.object({
      label: z.string().optional(),
      value: z.boolean().optional(),
    }),
  },
  ChoicePicker: {
    description: "下拉选择器",
    props: z.object({
      label: z.string().optional(),
      options: z.array(z.string()).optional(),
      value: z.string().optional(),
    }),
  },
  Slider: {
    description: "滑块输入",
    props: z.object({
      label: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      value: z.number().optional(),
    }),
  },

  // ---- 交互 ----
  Button: {
    description: "按钮，可绑定 action 触发工具调用",
    props: z.object({
      text: z.string().optional(),
      child: z.string().optional(),
      action: actionDef.optional(),
      primary: z.boolean().optional(),
      disabled: z.boolean().optional(),
    }),
  },

  // ---- 反馈 ----
  Modal: {
    description: "模态对话框",
    props: z.object({
      title: z.string().optional(),
      children: z.array(z.string()).optional(),
    }),
  },
  Spinner: {
    description: "加载指示器",
    props: z.object({
      text: z.string().optional(),
    }),
  },

  // ---- 数据展示 ----
  Table: {
    description: "数据表格，支持列定义和数据绑定",
    props: z.object({
      columns: z.array(z.object({ title: z.string(), dataIndex: z.string() })).optional(),
      dataSource: z.record(z.unknown()).optional(),
    }),
  },
  Statistic: {
    description: "统计数值卡片，用于仪表盘",
    props: z.object({
      title: z.string().optional(),
      value: z.union([z.string(), z.number()]).optional(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
      trend: z.enum(["up", "down"]).optional(),
    }),
  },
  Tag: {
    description: "标签/徽章",
    props: z.object({
      text: z.string(),
      color: z.string().optional(),
    }),
  },
  Timeline: {
    description: "时间线组件",
    props: z.object({
      items: z.array(z.object({ label: z.string(), content: z.string() })).optional(),
    }),
  },

  // ---- 布局扩展 ----
  Form: {
    description: "表单容器，带布局和间距",
    props: z.object({
      children: z.array(z.string()).optional(),
      title: z.string().optional(),
    }),
  },
  SearchBar: {
    description: "搜索栏，带搜索按钮和 action",
    props: z.object({
      placeholder: z.string().optional(),
      action: actionDef.optional(),
    }),
  },

  // ---- 自定义 ----
  ProgressStep: {
    description: "步骤进度条",
    props: z.object({
      steps: z.array(z.string()).optional(),
      currentStep: z.number().optional(),
    }),
  },

  // ---- 数据可视化 ----
  Chart: {
    description: "数据图表，支持柱状图(bar)、折线图(line)、饼图(pie)、面积图(area)",
    props: z.object({
      type: z.enum(["bar", "line", "pie", "area"]),
      title: z.string().optional(),
      data: z.array(z.record(z.unknown())).optional(),
      xField: z.string().optional(),
      yField: z.string().optional(),
      color: z.string().optional(),
      height: z.number().optional(),
    }),
  },

  // ---- 媒体 ----
  Carousel: {
    description: "轮播图，支持自动播放",
    props: z.object({
      items: z.array(z.object({
        url: z.string(),
        alt: z.string().optional(),
        caption: z.string().optional(),
      })).optional(),
      autoplay: z.boolean().optional(),
      interval: z.number().optional(),
    }),
  },
  Video: {
    description: "视频播放器，src 必须是有效的视频 URL",
    props: z.object({
      src: z.string().url("视频 src 必须是有效的 URL"),
      title: z.string().optional(),
      poster: z.string().url().optional(),
      autoplay: z.boolean().optional(),
      controls: z.boolean().optional(),
    }),
  },
  Audio: {
    description: "音频播放器，src 必须是有效的音频 URL",
    props: z.object({
      src: z.string().url("音频 src 必须是有效的 URL"),
      title: z.string().optional(),
      autoplay: z.boolean().optional(),
      controls: z.boolean().optional(),
    }),
  },

  // ---- 内容 ----
  RichText: {
    description: "富文本/Markdown 渲染",
    props: z.object({
      content: z.string(),
      variant: z.enum(["body", "hint"]).optional(),
    }),
  },

  // ---- 交互扩展 ----
  Rating: {
    description: "星级评分",
    props: z.object({
      label: z.string().optional(),
      value: z.number().optional(),
      max: z.number().optional(),
      allowHalf: z.boolean().optional(),
      disabled: z.boolean().optional(),
    }),
  },
  QuickActionRow: {
    description: "快捷操作按钮组，比多个 Button 更紧凑",
    props: z.object({
      actions: z.array(z.object({
        label: z.string(),
        name: z.string(),
        primary: z.boolean().optional(),
      })).optional(),
    }),
  },

  // ---- 布局扩展 ----
  CollapsibleSection: {
    description: "可折叠区域",
    props: z.object({
      title: z.string(),
      children: z.array(z.string()).optional(),
      defaultOpen: z.boolean().optional(),
    }),
  },

  // ---- 显示扩展 ----
  StatusBadge: {
    description: "状态徽章",
    props: z.object({
      text: z.string(),
      status: z.enum(["success", "error", "warning", "info", "default"]).optional(),
    }),
  },
  Avatar: {
    description: "头像",
    props: z.object({
      src: z.string().optional(),
      name: z.string().optional(),
      size: z.number().optional(),
      shape: z.enum(["circle", "square"]).optional(),
    }),
  },
  NumberAnimation: {
    description: "数字滚动动画，用于突出展示数值变化",
    props: z.object({
      value: z.number(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
      duration: z.number().optional(),
      label: z.string().optional(),
    }),
  },
};
