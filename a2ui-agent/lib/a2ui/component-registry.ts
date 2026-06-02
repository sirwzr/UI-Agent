// ===== A2UI 组件注册中心 =====
// 统一管理所有可用组件的注册、查询和文档生成
// 新增组件只需三步：1) Zod Schema → 2) Renderer → 3) 在此注册
//
// ===== 添加自定义组件的标准流程 =====
//
// Step 1: 在 catalog-definitions.ts 中定义 Zod Schema
//   export const a2uiDefinitions = {
//     ...existing,
//     MyCustomComp: {
//       description: "组件用途说明（给 LLM 看的）",
//       props: z.object({
//         title: z.string().describe("标题文字"),
//         // ... more props with .describe()
//       }),
//     },
//   };
//
// Step 2: 在 render-surface.tsx 的 RenderComponent 中添加 case
//   case "MyCustomComp":
//     return <YourReactComponent title={comp.title} ... />;
//
// Step 3: (可选) 在此文件中注册元数据
//   registerComponentMetadata("MyCustomComp", {
//     displayName: "自定义组件",
//     category: "自定义",
//     usageExample: { id: "example", component: "MyCustomComp", ... },
//   });
//
// 完成后运行项目，catalog-generator.ts 会自动将新组件注入 system prompt。

import type { A2UIComponent } from "./render-surface";

export interface ComponentMeta {
  /** 人类可读的组件名称 */
  displayName: string;
  /** 所属分类 */
  category:
    | "布局容器"
    | "文本与显示"
    | "表单输入"
    | "交互反馈"
    | "数据展示"
    | "媒体"
    | "自定义";
  /** 最小使用示例 */
  usageExample?: Partial<A2UIComponent>;
  /** 使用注意事项 */
  notes?: string;
}

const metadataRegistry = new Map<string, ComponentMeta>();

export function registerComponentMetadata(componentName: string, meta: ComponentMeta): void {
  metadataRegistry.set(componentName, meta);
}

export function getComponentMetadata(componentName: string): ComponentMeta | undefined {
  return metadataRegistry.get(componentName);
}

export function getAllRegisteredComponents(): string[] {
  return Array.from(metadataRegistry.keys());
}

export function getComponentsByCategory(category: ComponentMeta["category"]): string[] {
  const result: string[] = [];
  for (const [name, meta] of metadataRegistry) {
    if (meta.category === category) result.push(name);
  }
  return result;
}

// ===== 初始化：注册所有内置组件元数据 =====

const builtinMeta: [string, ComponentMeta][] = [
  // 布局容器
  ["Column", { displayName: "垂直布局", category: "布局容器", notes: "页面主容器首选" }],
  ["Row", { displayName: "水平布局", category: "布局容器", notes: "Statistic 行、按钮组用此组件" }],
  ["Card", { displayName: "卡片", category: "布局容器", notes: "信息分组，可带标题" }],
  ["List", { displayName: "列表", category: "布局容器" }],
  ["Tabs", { displayName: "标签页", category: "布局容器", notes: "2-5 个 tab 为佳" }],
  ["CollapsibleSection", { displayName: "可折叠区域", category: "布局容器" }],
  ["Form", { displayName: "表单容器", category: "布局容器" }],

  // 文本与显示
  ["Text", { displayName: "文本", category: "文本与显示" }],
  ["Image", { displayName: "图片", category: "文本与显示", notes: "URL 必须来自搜索工具" }],
  ["Divider", { displayName: "分割线", category: "文本与显示" }],
  ["RichText", { displayName: "富文本", category: "文本与显示", notes: "支持 Markdown" }],
  ["Empty", { displayName: "空状态", category: "文本与显示" }],
  ["Skeleton", { displayName: "骨架屏", category: "文本与显示" }],

  // 表单输入
  ["TextField", { displayName: "文本输入", category: "表单输入" }],
  ["DateTimeInput", { displayName: "日期时间选择", category: "表单输入" }],
  ["CheckBox", { displayName: "复选框", category: "表单输入" }],
  ["ChoicePicker", { displayName: "下拉选择", category: "表单输入" }],
  ["Slider", { displayName: "滑块", category: "表单输入" }],
  ["Radio", { displayName: "单选按钮组", category: "表单输入" }],
  ["Switch", { displayName: "开关", category: "表单输入" }],
  ["SearchBar", { displayName: "搜索栏", category: "表单输入" }],

  // 交互反馈
  ["Button", { displayName: "按钮", category: "交互反馈" }],
  ["QuickActionRow", { displayName: "快捷操作组", category: "交互反馈", notes: "3-5 个按钮最佳" }],
  ["Rating", { displayName: "评分", category: "交互反馈" }],
  ["Modal", { displayName: "模态对话框", category: "交互反馈" }],
  ["Spinner", { displayName: "加载指示器", category: "交互反馈" }],
  ["Tooltip", { displayName: "提示气泡", category: "交互反馈" }],
  ["Drawer", { displayName: "抽屉面板", category: "交互反馈" }],

  // 数据展示
  ["Statistic", { displayName: "统计数值", category: "数据展示", notes: "每行 3-4 个" }],
  ["Table", { displayName: "数据表格", category: "数据展示", notes: "≥ 6 行" }],
  ["Chart", { displayName: "图表", category: "数据展示", notes: "每次 ≤ 2 个，≥ 8 数据点" }],
  ["Tag", { displayName: "标签", category: "数据展示" }],
  ["Timeline", { displayName: "时间线", category: "数据展示" }],
  ["NumberAnimation", { displayName: "数字动画", category: "数据展示", notes: "每页 ≤ 3 个" }],
  ["StatusBadge", { displayName: "状态徽章", category: "数据展示" }],
  ["Progress", { displayName: "进度条", category: "数据展示" }],
  ["Avatar", { displayName: "头像", category: "数据展示" }],
  ["Breadcrumb", { displayName: "面包屑", category: "数据展示" }],
  ["Menu", { displayName: "导航菜单", category: "数据展示" }],
  ["ProgressStep", { displayName: "步骤条", category: "数据展示" }],

  // 媒体
  ["Carousel", { displayName: "轮播图", category: "媒体", notes: "3-6 张，URL 来自搜索" }],
  ["Video", { displayName: "视频播放器", category: "媒体" }],
  ["Audio", { displayName: "音频播放器", category: "媒体" }],
];

for (const [name, meta] of builtinMeta) {
  registerComponentMetadata(name, meta);
}
