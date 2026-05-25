// ===== 自定义 A2UI 组件注册 =====
// 扩展标准 A2UI 目录，注册业务自定义组件

import type { A2UIComponentRenderer } from "./theme";
import { a2uiComponentRenderers } from "./theme";

export interface CustomComponentDef {
  name: string;
  renderer: A2UIComponentRenderer;
  propsSchema: Record<string, unknown>;
}

// 在此注册自定义组件
export const customComponents: CustomComponentDef[] = [
  // 示例：添加一个状态标签组件
  // {
  //   name: "StatusBadge",
  //   renderer: (props) => <Tag color={props.color}>{props.text}</Tag>,
  //   propsSchema: { text: "string", color: "string" },
  // },
];

// 注册所有自定义组件到渲染器映射
export function registerCustomComponents(): void {
  for (const comp of customComponents) {
    if (a2uiComponentRenderers[comp.name]) {
      console.warn(`Component "${comp.name}" already registered, skipping`);
      continue;
    }
    a2uiComponentRenderers[comp.name] = comp.renderer;
  }
}

// 获取可用于 LLM System Prompt 的自定义组件描述
export function getCustomComponentsMarkdown(): string {
  if (customComponents.length === 0) return "";
  return customComponents
    .map((c) => `| ${c.name} | — | — | 自定义组件 |`)
    .join("\n");
}
