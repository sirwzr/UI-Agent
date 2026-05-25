# A2UI 组件目录

共 32 种组件，分为 9 个类别。

## 布局组件

| 组件 | 渲染 | 关键 Props |
|------|------|-----------|
| `Column` | `div` flex column | `children[]`, `gap`, `align` |
| `Row` | `Row` + `Col` | `children[]`, `gap`, `align` |
| `Card` | `Card` | `title`, `children[]` |
| `List` | `List` | `children[]` |
| `Tabs` | `Tabs` | `tabs[{label,child}]` |
| `Form` | `Form` vertical | `title`, `children[]` |
| `CollapsibleSection` | `Collapse` | `title`, `children[]`, `defaultOpen` |

## 显示组件

| 组件 | 渲染 | 关键 Props |
|------|------|-----------|
| `Text` | `Title` / `Text` | `text`, `variant`(h1/h2/body/caption) |
| `Image` | `Image` | `url`, `alt`, `fit`(contain/cover) |
| `Divider` | `Divider` | — |
| `StatusBadge` | `Tag` | `text`, `status`(success/error/warning/info/default) |
| `Avatar` | `Avatar` | `src`, `name`, `size`, `shape`(circle/square) |

## 输入组件

| 组件 | 渲染 | 关键 Props |
|------|------|-----------|
| `TextField` | `Input` / `InputNumber` | `label`, `inputType`(text/number/email/password), `placeholder`, `validation{required,min,max}` |
| `DateTimeInput` | `DatePicker` | `label`, `enableTime` |
| `CheckBox` | `Checkbox` | `label`, `value` |
| `ChoicePicker` | `Select` | `label`, `options[]`, `value` |
| `Slider` | `Slider` | `label`, `min`, `max`, `value` |

## 交互组件

| 组件 | 渲染 | 关键 Props |
|------|------|-----------|
| `Button` | `Button` | `text`/`child`, `action{name,context}`, `primary`, `disabled` |
| `SearchBar` | `Input.Search` | `placeholder`, `action{name}` |
| `Rating` | `Rate` | `label`, `value`, `max`, `allowHalf` |

## 反馈组件

| 组件 | 渲染 | 关键 Props |
|------|------|-----------|
| `Modal` | `Modal` | `title`, `children[]` |
| `Spinner` | `Spin` | `text` |

## 数据展示组件

| 组件 | 渲染 | 关键 Props |
|------|------|-----------|
| `Table` | `Table` | `columns[{title,dataIndex}]`, `dataSource{records[]}` |
| `Statistic` | `Card` + `Statistic` | `title`, `value`, `prefix`, `suffix`, `trend`(up/down) |
| `Tag` | `Tag` | `text`, `color` |
| `Timeline` | `Timeline` | `items[{label,content}]` |
| `ProgressStep` | `Steps` | `steps[]`, `currentStep` |
| `NumberAnimation` | `Card` + `Statistic` | `value`, `prefix`, `suffix`, `duration`, `label` |

## 数据可视化

| 组件 | 渲染 | 关键 Props |
|------|------|-----------|
| `Chart` | `ResponsiveContainer` + `BarChart`/`LineChart`/`PieChart`/`AreaChart` | `type`(bar/line/pie/area), `title`, `data[{...}]`, `xField`, `yField`, `color`, `height` |

## 媒体组件

| 组件 | 渲染 | 关键 Props |
|------|------|-----------|
| `Carousel` | `Carousel` + `Image` | `items[{url,alt,caption}]`, `autoplay`, `interval` |
| `Video` | `<video>` | `src`, `title`, `poster`, `autoplay`, `controls` |
| `Audio` | `<audio>` | `src`, `title`, `autoplay`, `controls` |
| `RichText` | `<ReactMarkdown>` | `content`(Markdown), `variant`(body/hint) |

## 快捷操作

| 组件 | 渲染 | 关键 Props |
|------|------|-----------|
| `QuickActionRow` | `Button` × N | `actions[{label,name,primary}]` |

## Wizard 向导组件（v3 新增）

引导用户在 CenterPanel 中通过 3 步交互式选择来定制界面需求。

| 组件 | 文件 | 用途 |
|------|------|------|
| `TemplateWizard` | `components/wizard/TemplateWizard.tsx` | 主向导容器，管理 3 步状态、步骤切换动画 |
| `WizardProgress` | `components/wizard/WizardProgress.tsx` | Ant Design `Steps` 进度指示器（3 点） |
| `WizardStepScene` | `components/wizard/WizardStepScene.tsx` | 步骤 1：场景选择卡片（Radio）+ 自定义输入 |
| `WizardStepContent` | `components/wizard/WizardStepContent.tsx` | 步骤 2：内容选项多选网格（Checkbox） |
| `WizardStepStyle` | `components/wizard/WizardStepStyle.tsx` | 步骤 3：风格预设卡片 + 颜色预览 |

### 向导配置文件

`lib/wizard/wizardConfig.ts` — 按 8 个类别定义向导配置：

```ts
interface CategoryWizardConfig {
  step1: { title, description, choices: WizardChoice[], allowCustom }
  step2: { title, description, contentOptions: { key, label }[] }
  step3: { title, description, styles: StylePreset[] }
}
```

辅助函数：
- `getWizardConfig(category)` — 查找类别对应配置
- `composePrompt(scene, content, style, basePrompt)` — 组合最终 prompt
- `composeTitle(templateTitle, styleLabel)` — 生成「模板名 · 风格名」格式标题

## 模板示例

### Chart (柱状图)

```json
{
  "id": "chart",
  "component": "Chart",
  "type": "bar",
  "title": "月度销售",
  "data": [
    {"month": "1月", "sales": 42000},
    {"month": "2月", "sales": 38000}
  ],
  "xField": "month",
  "yField": "sales",
  "color": "#3b82f6",
  "height": 280
}
```

### Carousel (轮播)

```json
{
  "id": "carousel",
  "component": "Carousel",
  "items": [
    {"url": "https://picsum.photos/seed/p1/800/400", "caption": "图片1"},
    {"url": "https://picsum.photos/seed/p2/800/400", "caption": "图片2"}
  ],
  "autoplay": true,
  "interval": 3000
}
```

### QuickActionRow (快捷操作)

```json
{
  "id": "actions",
  "component": "QuickActionRow",
  "actions": [
    {"label": "立即购买", "name": "buy_now", "primary": true},
    {"label": "加入购物车", "name": "add_cart"}
  ]
}
```
