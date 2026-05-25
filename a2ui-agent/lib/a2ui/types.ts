// ===== A2UI v0.9 TypeScript 类型定义 =====
// 参照: https://github.com/google/A2UI

export type A2UIVersion = "v0.9";

// ---- 消息信封 ----
export interface A2UIEnvelope {
  version: A2UIVersion;
  createSurface?: CreateSurfaceMessage;
  updateComponents?: UpdateComponentsMessage;
  updateDataModel?: UpdateDataModelMessage;
  deleteSurface?: DeleteSurfaceMessage;
}

// ---- createSurface ----
export interface CreateSurfaceMessage {
  surfaceId: string;
  catalogId: string;
}

// ---- updateComponents ----
export interface UpdateComponentsMessage {
  surfaceId: string;
  components: ComponentDef[];
}

// ---- Component 定义 ----
export interface ComponentDef {
  id: string;
  component: string;
  weight?: number;
  // 通用属性
  children?: string[];
  child?: string;
  text?: string;
  variant?: string;
  label?: string;
  url?: string;
  alt?: string;
  // 按钮
  action?: ActionDef;
  primary?: boolean;
  disabled?: boolean;
  // 输入
  value?: DynamicValue;
  inputType?: string;
  placeholder?: string;
  validation?: ValidationDef;
  // 日期时间
  enableDate?: boolean;
  enableTime?: boolean;
  // 选择器
  options?: string[];
  // 布局
  align?: string;
  gap?: number;
  // 卡片
  title?: string;
  // 标签页
  tabs?: TabDef[];
  // 进度
  steps?: string[];
  currentStep?: number;
  // 弹窗
  actions?: string[];
  // 地图
  center?: LatLng;
  markers?: DynamicValue;
  // 图表
  data?: DynamicValue;
  type?: string;
  // 图片
  fit?: string;
  name?: string;
  size?: number;
  shape?: string;
  // 媒体
  src?: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  caption?: string;
  interval?: number;
  // 评分
  allowHalf?: boolean;
  // 图表
  xField?: string;
  yField?: string;
  height?: number;
  color?: string;
  // 富文本
  content?: string;
  // 状态
  status?: string;
  // 可折叠
  defaultOpen?: boolean;
  // 数字动画
  duration?: number;
  // 动画
  animation?: {
    type?: string;
    delay?: number;
    duration?: number;
    stagger?: number;
  };
}

export interface ActionDef {
  name: string;
  context?: Record<string, unknown>;
}

export interface DynamicValue {
  path?: string;
  literalString?: string;
  literalNumber?: number;
  literalBool?: boolean;
}

export interface ValidationDef {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface TabDef {
  label: string;
  child: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

// ---- updateDataModel ----
export interface UpdateDataModelMessage {
  surfaceId: string;
  path?: string;
  value?: unknown;
  op?: "replace" | "add" | "remove";
}

// ---- deleteSurface ----
export interface DeleteSurfaceMessage {
  surfaceId: string;
}

// ---- JSONL 每行解析 ----
export type A2UIJsonLine = A2UIEnvelope;

// 从 LLM 流式输出中解析 A2UI JSONL 行
export function parseA2UILine(line: string): A2UIEnvelope | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as A2UIEnvelope;
    if (parsed.version !== "v0.9") return null;
    return parsed;
  } catch {
    return null;
  }
}

// 判断一条消息是否是文本（非 JSON）
export function isTextLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.length > 0 && !trimmed.startsWith("{");
}
