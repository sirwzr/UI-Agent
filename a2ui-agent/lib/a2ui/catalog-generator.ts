// ===== 组件目录动态生成器 =====
// 遍历 a2uiDefinitions 的 Zod Schema，提取每个组件的描述和 prop 文档
// 生成 Markdown 格式文本，注入到 Agent system prompt 中
// 新增/修改组件只需改 catalog-definitions.ts，无需手动同步 prompt

import { a2uiDefinitions } from "./catalog-definitions";
import { z } from "zod";

interface PropDoc {
  name: string;
  required: boolean;
  description: string;
}

interface ComponentDoc {
  name: string;
  description: string;
  props: PropDoc[];
}

function isZodObject(schema: z.ZodTypeAny): schema is z.ZodObject<z.ZodRawShape> {
  return schema instanceof z.ZodObject;
}

function extractProps(schema: z.ZodObject<z.ZodRawShape>): PropDoc[] {
  const shape = schema.shape;
  const props: PropDoc[] = [];

  for (const [key, zodType] of Object.entries(shape)) {
    // 判断是否可选
    const isOptional = zodType instanceof z.ZodOptional;
    const inner = isOptional ? (zodType as z.ZodOptional<z.ZodTypeAny>).unwrap() : zodType;

    // 提取描述
    const desc = inner.description ?? "";

    if (key === "children" || key === "child") {
      // 跳过 children/child（通用概念，不需要逐组件重复解释）
      if (!desc) continue;
    }

    props.push({
      name: key,
      required: !isOptional,
      description: desc,
    });
  }

  return props;
}

function formatPropDoc(prop: PropDoc): string {
  const req = prop.required ? "(必填)" : "(可选)";
  const desc = prop.description || "—";
  return `  - **${prop.name}** ${req}: ${desc}`;
}

export function generateComponentDocs(): string {
  const lines: string[] = [];
  lines.push("## 可用组件目录\n");

  const entries = Object.entries(a2uiDefinitions);
  const groups: Record<string, string[]> = {
    "布局容器": ["Column", "Row", "Card", "List", "Tabs", "CollapsibleSection", "Form"],
    "文本与显示": ["Text", "Image", "Divider", "RichText", "Empty", "Skeleton"],
    "表单输入": ["TextField", "DateTimeInput", "CheckBox", "ChoicePicker", "Slider", "Radio", "Switch", "SearchBar"],
    "交互反馈": ["Button", "QuickActionRow", "Rating", "Modal", "Spinner", "Tooltip", "Drawer"],
    "数据展示": ["Statistic", "Table", "Chart", "Tag", "Timeline", "NumberAnimation", "StatusBadge", "Progress", "Avatar", "Breadcrumb", "Menu", "ProgressStep"],
    "媒体": ["Carousel", "Video", "Audio"],
  };

  const grouped = new Map<string, ComponentDoc[]>();

  for (const [compName, def] of entries) {
    const propsSchema = def.props;
    if (!isZodObject(propsSchema)) continue;

    const doc: ComponentDoc = {
      name: compName,
      description: (def as { description?: string }).description ?? "",
      props: extractProps(propsSchema as z.ZodObject<z.ZodRawShape>),
    };

    // 找到该组件属于哪个组
    let groupName = "其他";
    for (const [gName, names] of Object.entries(groups)) {
      if (names.includes(compName)) {
        groupName = gName;
        break;
      }
    }

    if (!grouped.has(groupName)) {
      grouped.set(groupName, []);
    }
    grouped.get(groupName)!.push(doc);
  }

  // 按顺序输出
  const groupOrder = ["布局容器", "文本与显示", "表单输入", "交互反馈", "数据展示", "媒体", "其他"];
  for (const gName of groupOrder) {
    const docs = grouped.get(gName);
    if (!docs || docs.length === 0) continue;

    lines.push(`### ${gName}`);
    lines.push("");

    for (const doc of docs) {
      lines.push(`**${doc.name}** — ${doc.description}`);
      if (doc.props.length > 0) {
        for (const prop of doc.props) {
          lines.push(formatPropDoc(prop));
        }
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}
