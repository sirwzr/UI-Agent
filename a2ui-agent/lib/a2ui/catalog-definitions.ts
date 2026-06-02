// ===== A2UI 组件 Zod Schema 定义 =====
// 平台无关的组件契约 — 供 CopilotKit createCatalog 使用
// 每个 prop 的 .describe() 直接暴露给 LLM，是 LLM 理解组件的唯一语义来源
// 新增组件在此定义后，catalog-generator.ts 自动同步到 system prompt
import { z } from "zod";

const actionDef = z.object({
  name: z.string().describe("action 名称，用于标识用户点击了哪个按钮"),
  context: z.record(z.unknown()).optional().describe("action 附加上下文参数"),
});

const validationDef = z.object({
  required: z.boolean().optional().describe("是否必填"),
  min: z.number().optional().describe("最小值"),
  max: z.number().optional().describe("最大值"),
  minLength: z.number().optional().describe("最小字符数"),
  maxLength: z.number().optional().describe("最大字符数"),
  pattern: z.string().optional().describe("正则校验规则"),
});

export const a2uiDefinitions = {
  // ===== 布局容器 =====
  Column: {
    description: "垂直布局容器，子组件纵向排列。适合页面主容器、表单、信息流等自上而下的内容",
    props: z.object({
      children: z.array(z.string()).optional().describe("子组件 ID 列表，按数组顺序从上到下排列"),
      align: z.enum(["start", "center", "end", "stretch"]).optional().describe("水平对齐方式。start=左对齐, center=居中, end=右对齐, stretch=拉伸填充。默认 stretch"),
      gap: z.number().optional().describe("子组件间距（px）。紧凑内容用 8-12，常规用 16，宽松用 20-24。默认 0"),
    }),
  },
  Row: {
    description: "水平布局容器，子组件横向排列。适合 Statistic 行、按钮组、标签展示等并排内容。每行建议 2-4 个子组件",
    props: z.object({
      children: z.array(z.string()).optional().describe("子组件 ID 列表，按数组顺序从左到右排列"),
      align: z.enum(["top", "middle", "bottom"]).optional().describe("垂直对齐方式。top=顶部对齐, middle=居中对齐, bottom=底部对齐。默认 middle"),
      gap: z.number().optional().describe("子组件间距（px）。建议 12-16。默认 0"),
    }),
  },
  Card: {
    description: "卡片容器，带标题、边框和圆角。适合信息分组展示、产品详情、数据面板等需要视觉分隔的内容块",
    props: z.object({
      title: z.string().optional().describe("卡片标题，显示在卡片顶部"),
      children: z.array(z.string()).optional().describe("卡片内部子组件 ID 列表"),
    }),
  },
  List: {
    description: "列表容器，子组件作为列表项依次展示。适合搜索结果、商品列表、文章目录等重复结构",
    props: z.object({
      children: z.array(z.string()).optional().describe("列表项 ID 列表，每项通常是一个 Card 或 Row"),
    }),
  },
  Tabs: {
    description: "标签页容器，用于在同一区域内切换不同内容视图。适合分类展示、多维度数据切换等场景。建议 2-5 个 tab",
    props: z.object({
      tabs: z.array(z.object({
        label: z.string().describe("标签页标题，建议 2-4 个字"),
        child: z.string().describe("该 tab 对应的子组件 ID"),
      })).optional().describe("标签页配置数组"),
    }),
  },

  // ===== 文本与显示 =====
  Text: {
    description: "文本显示组件。h1 用于页面主标题，h2 用于分区标题，body 用于正文，caption 用于辅助说明。每个界面最多 1 个 h1",
    props: z.object({
      text: z.string().describe("显示的文本内容"),
      variant: z.enum(["h1", "h2", "body", "caption"]).optional().describe("文本层级。h1=页面主标题(24px), h2=分区标题(18px), body=正文(14px), caption=辅助说明(12px)。默认 body"),
    }),
  },
  Image: {
    description: "图片展示组件。url 必须来自 web_search 返回的 images 数组或 Pexels API，禁止编造 URL",
    props: z.object({
      url: z.string().describe("图片 URL。必须来自搜索工具返回的真实 URL"),
      alt: z.string().optional().describe("图片替代文字，用于无障碍访问和加载失败时的占位提示"),
      fit: z.enum(["contain", "cover"]).optional().describe("图片填充方式。contain=完整显示留白, cover=裁剪填充满。默认 cover"),
    }),
  },
  Divider: {
    description: "分割线，用于视觉上分隔不同内容区域",
    props: z.object({}),
  },

  // ===== 表单输入 =====
  TextField: {
    description: "文本输入框。支持纯文本、数字、邮箱、密码四种类型，可配置验证规则",
    props: z.object({
      label: z.string().optional().describe("输入框标签，放在输入框上方或左侧"),
      inputType: z.enum(["text", "number", "email", "password"]).optional().describe("输入类型。text=文本, number=数字, email=邮箱, password=密码。默认 text"),
      placeholder: z.string().optional().describe("占位提示文字，输入框为空时显示"),
      value: z.string().optional().describe("当前值/默认值"),
      validation: validationDef.optional().describe("输入验证规则"),
    }),
  },
  DateTimeInput: {
    description: "日期时间选择器，可单独选择日期或时间",
    props: z.object({
      label: z.string().optional().describe("选择器标签"),
      enableDate: z.boolean().optional().describe("是否启用日期选择。默认 true"),
      enableTime: z.boolean().optional().describe("是否启用时间选择。默认 false"),
    }),
  },
  CheckBox: {
    description: "复选框，用于布尔值选择。适合同意协议、启用功能等二元选择场景",
    props: z.object({
      label: z.string().optional().describe("复选框旁边的标签文字"),
      value: z.boolean().optional().describe("选中状态。true=已勾选, false=未勾选。默认 false"),
    }),
  },
  ChoicePicker: {
    description: "下拉选择器，适合从 3-10 个选项中选取一个值。选项多时用此组件而非一组 Button",
    props: z.object({
      label: z.string().optional().describe("选择器标签"),
      options: z.array(z.string()).optional().describe("可选值列表，建议 3-10 项"),
      value: z.string().optional().describe("当前选中值"),
    }),
  },
  Slider: {
    description: "滑块输入，适合数值范围选择（如价格区间、评分筛选）",
    props: z.object({
      label: z.string().optional().describe("滑块标签"),
      min: z.number().optional().describe("最小值。默认 0"),
      max: z.number().optional().describe("最大值。默认 100"),
      value: z.number().optional().describe("当前值"),
    }),
  },

  // ===== 交互 =====
  Button: {
    description: "按钮。primary=true 用于主要操作（提交、购买），primary=false 用于次要操作（取消、返回）。action 绑定点击行为",
    props: z.object({
      text: z.string().optional().describe("按钮文字，也可以不写 text 而通过 child 子组件来渲染内容"),
      child: z.string().optional().describe("按钮内部的子组件 ID，与 text 二选一"),
      action: actionDef.optional().describe("点击时触发的 action，包含 name 和可选的 context"),
      primary: z.boolean().optional().describe("是否为主要按钮。主按钮使用品牌色填充，次按钮使用边框样式。默认 false"),
      disabled: z.boolean().optional().describe("是否禁用。默认 false"),
    }),
  },

  // ===== 反馈 =====
  Modal: {
    description: "模态对话框，在页面中央弹出，需要用户操作后才能关闭。适合确认操作、显示详情、收集输入等场景",
    props: z.object({
      title: z.string().optional().describe("对话框标题"),
      children: z.array(z.string()).optional().describe("对话框内部子组件 ID 列表"),
    }),
  },
  Spinner: {
    description: "加载指示器，旋转动画。适合数据加载中、操作处理中等等待状态",
    props: z.object({
      text: z.string().optional().describe("加载提示文字，如「正在加载数据...」"),
    }),
  },

  // ===== 数据展示 =====
  Table: {
    description: "数据表格。columns 定义列结构，dataSource.records 存放数据。适合结构化数据展示如订单列表、用户管理、排行榜",
    props: z.object({
      columns: z.array(z.object({
        title: z.string().describe("列标题"),
        dataIndex: z.string().describe("数据字段名，对应 records 中每条数据的 key"),
      })).optional().describe("表格列定义"),
      dataSource: z.record(z.unknown()).optional().describe("表格数据源，格式为 { records: [{ col1: val1, col2: val2 }, ...] }"),
    }),
  },
  Statistic: {
    description: "统计数值卡片，大字体展示数值+趋势箭头。适合仪表盘顶部的 KPI 指标行。每行建议放 3-4 个 Statistic",
    props: z.object({
      title: z.string().optional().describe("指标名称，如「总销售额」「活跃用户」"),
      value: z.union([z.string(), z.number()]).optional().describe("指标数值，如 128430 或 '1,234'"),
      prefix: z.string().optional().describe("数值前缀，如 '¥'、'$'"),
      suffix: z.string().optional().describe("数值后缀，如 '%'、'人'、'次'"),
      trend: z.enum(["up", "down"]).optional().describe("趋势方向。up=上升(绿色箭头), down=下降(红色箭头)。不传则不显示箭头"),
    }),
  },
  Tag: {
    description: "标签/徽章，用于标记状态、分类、属性。适合展示订单状态、产品标签、用户角色",
    props: z.object({
      text: z.string().describe("标签文字"),
      color: z.string().optional().describe("标签颜色，支持预定义值：blue/green/red/orange/purple/cyan/gray 或十六进制色值"),
    }),
  },
  Timeline: {
    description: "时间线组件，适合展示操作日志、订单流转、项目里程碑等时间维度信息",
    props: z.object({
      items: z.array(z.object({
        label: z.string().describe("时间点标签，如「2025-01-15」或「第一阶段」"),
        content: z.string().describe("时间点对应的内容描述"),
      })).optional().describe("时间线条目数组"),
    }),
  },

  // ===== 表单容器 =====
  Form: {
    description: "表单容器，统一管理表单内部组件的布局和间距。适合登录、注册、设置、数据录入等场景",
    props: z.object({
      children: z.array(z.string()).optional().describe("表单内子组件 ID 列表，通常包含 TextField、ChoicePicker、DateTimeInput、Button 等"),
      title: z.string().optional().describe("表单标题，如「用户注册」「系统设置」"),
    }),
  },
  SearchBar: {
    description: "搜索栏，包含输入框和搜索按钮。用户输入关键词后点击搜索触发 action",
    props: z.object({
      placeholder: z.string().optional().describe("搜索框占位提示，如「搜索商品...」"),
      action: actionDef.optional().describe("搜索触发 action"),
    }),
  },

  // ===== 步骤与导航 =====
  ProgressStep: {
    description: "步骤进度条，展示多步骤流程的当前进度。适合注册向导、订单流程、任务引导等",
    props: z.object({
      steps: z.array(z.string()).optional().describe("步骤名称数组，如 ['填写信息', '验证邮箱', '设置偏好', '完成注册']"),
      currentStep: z.number().optional().describe("当前步骤序号，从 0 开始。默认 0"),
    }),
  },

  // ===== 数据可视化 =====
  Chart: {
    description: "数据图表组件。数据必须来自 web_search 或真实统计数据，禁止编造。每次调用 render_a2ui 最多使用 2 个 Chart",
    props: z.object({
      type: z.enum(["bar", "line", "pie", "area"]).describe("图表类型。bar=柱状图适合分类对比(如各品类销售额), line=折线图适合趋势展示(如月度变化), pie=饼图适合占比分析(不超过6个分类), area=面积图适合累积趋势。默认 bar"),
      title: z.string().optional().describe("图表标题，如「月度销售趋势」"),
      data: z.array(z.record(z.unknown())).optional().describe("图表数据数组，如 [{month: '1月', sales: 42000}, ...]"),
      xField: z.string().optional().describe("X 轴字段名，对应 data 中的 key，如 'month'"),
      yField: z.string().optional().describe("Y 轴字段名，对应 data 中的 key，如 'sales'"),
      color: z.string().optional().describe("图表主色，十六进制格式如 '#2563eb'。默认使用蓝色"),
      height: z.number().optional().describe("图表高度（px），建议 260-320。默认 280"),
    }),
  },

  // ===== 媒体组件 =====
  Carousel: {
    description: "轮播图，自动或手动轮播多张图片。适合产品展示、广告横幅、图片画廊。items 中 url 必须来自搜索工具",
    props: z.object({
      items: z.array(z.object({
        url: z.string().describe("图片 URL，必须来自搜索工具返回的真实 URL"),
        alt: z.string().optional().describe("图片说明"),
        caption: z.string().optional().describe("图片下方标题文字"),
      })).optional().describe("轮播图片列表，建议 3-6 张"),
      autoplay: z.boolean().optional().describe("是否自动播放。默认 true"),
      interval: z.number().optional().describe("自动播放间隔（毫秒）。默认 3000"),
    }),
  },
  Video: {
    description: "视频播放器。src 必须来自 Pexels Videos API 或其他真实视频源，禁止编造 URL",
    props: z.object({
      src: z.string().url("视频 src 必须是有效的 URL").describe("视频文件 URL"),
      title: z.string().optional().describe("视频标题"),
      poster: z.string().url().optional().describe("视频封面图 URL"),
      autoplay: z.boolean().optional().describe("是否自动播放。默认 false"),
      controls: z.boolean().optional().describe("是否显示播放控件。默认 true"),
    }),
  },
  Audio: {
    description: "音频播放器。src 可使用系统提供的公开音频源 URL",
    props: z.object({
      src: z.string().url("音频 src 必须是有效的 URL").describe("音频文件 URL"),
      title: z.string().optional().describe("音频标题"),
      autoplay: z.boolean().optional().describe("是否自动播放。默认 false"),
      controls: z.boolean().optional().describe("是否显示播放控件。默认 true"),
    }),
  },

  // ===== 内容 =====
  RichText: {
    description: "富文本渲染，支持 Markdown 格式（加粗、斜体、链接、列表、代码块）。适合产品描述、文章正文、帮助文档等长文本内容",
    props: z.object({
      content: z.string().describe("Markdown 格式文本内容"),
      variant: z.enum(["body", "hint"]).optional().describe("文本风格。body=常规正文, hint=浅色辅助文字。默认 body"),
    }),
  },

  // ===== 交互扩展 =====
  Rating: {
    description: "星级评分组件，可交互或只读。适合商品评分、服务评价、满意度调查",
    props: z.object({
      label: z.string().optional().describe("评分标签，如「商品评分」"),
      value: z.number().optional().describe("当前评分值，0 到 max 之间"),
      max: z.number().optional().describe("最大星级数。默认 5"),
      allowHalf: z.boolean().optional().describe("是否允许半星评分。默认 false"),
      disabled: z.boolean().optional().describe("是否禁用交互（只读展示）。默认 false"),
    }),
  },
  QuickActionRow: {
    description: "快捷操作按钮组，比多个独立 Button 更紧凑。适合提问场景中的选项按钮、CTA 按钮组。建议 3-5 个按钮，其中一个设 primary",
    props: z.object({
      actions: z.array(z.object({
        label: z.string().describe("按钮显示文字，建议 2-6 个字"),
        name: z.string().describe("action 名称，点击后回传给 Agent。命名规则：用下划线分隔，如 style_dark_tech、product_electronics"),
        primary: z.boolean().optional().describe("是否为主要操作按钮（高亮填充）。一组中仅 1 个设 true。默认 false"),
      })).optional().describe("按钮配置数组，建议 3-5 个"),
    }),
  },

  // ===== 布局扩展 =====
  CollapsibleSection: {
    description: "可折叠区域，点击标题展开/折叠内容。适合 FAQ、筛选面板、详情展示等需要节省空间的场景",
    props: z.object({
      title: z.string().describe("折叠区域标题，始终可见"),
      children: z.array(z.string()).optional().describe("折叠区域内部子组件 ID 列表"),
      defaultOpen: z.boolean().optional().describe("是否默认展开。默认 false（折叠）"),
    }),
  },

  // ===== 显示扩展 =====
  StatusBadge: {
    description: "状态徽章，带颜色圆点+文字。适合展示在线状态、任务进度、订单状态等",
    props: z.object({
      text: z.string().describe("状态文字，如「在线」「已完成」「处理中」"),
      status: z.enum(["success", "error", "warning", "info", "default"]).optional().describe("状态类型。success=绿色, error=红色, warning=橙色, info=蓝色, default=灰色"),
    }),
  },
  Avatar: {
    description: "头像组件，展示用户或品牌图片。无图片时显示名称首字母",
    props: z.object({
      src: z.string().optional().describe("头像图片 URL"),
      name: z.string().optional().describe("用户/品牌名称，无图片时显示首字母"),
      size: z.number().optional().describe("头像尺寸（px）。默认 40"),
      shape: z.enum(["circle", "square"]).optional().describe("头像形状。默认 circle"),
    }),
  },
  NumberAnimation: {
    description: "数字滚动动画，数字从 0 滚动到目标值。适合突出展示关键指标如价格、销量。每个界面最多用 3 个",
    props: z.object({
      value: z.number().describe("目标数值"),
      prefix: z.string().optional().describe("数值前缀，如 '¥'"),
      suffix: z.string().optional().describe("数值后缀，如 '%'"),
      duration: z.number().optional().describe("动画持续时间（毫秒）。默认 1500"),
      label: z.string().optional().describe("数值标签，如「累计销量」"),
    }),
  },

  // ===== 表单扩展 =====
  Radio: {
    description: "单选按钮组，所有选项同时可见。适合 2-5 个互斥选项的场景（6+ 选项用 ChoicePicker）",
    props: z.object({
      label: z.string().optional().describe("单选组标签"),
      options: z.array(z.string()).optional().describe("可选项文字数组，建议 2-5 项"),
      value: z.string().optional().describe("当前选中值"),
    }),
  },
  Switch: {
    description: "开关切换，适合布尔值即时生效的设置项，如「启用通知」「暗黑模式」",
    props: z.object({
      label: z.string().optional().describe("开关标签"),
      checked: z.boolean().optional().describe("开关状态。默认 false"),
    }),
  },
  Progress: {
    description: "进度条，展示任务完成百分比。适合下载进度、任务进度、存储用量等",
    props: z.object({
      percent: z.number().describe("进度百分比，0-100 的整数"),
      status: z.enum(["success", "exception", "normal", "active"]).optional().describe("进度状态。success=绿色已完成, exception=红色异常, normal=蓝色, active=动画中"),
      showInfo: z.boolean().optional().describe("是否显示百分比文字。默认 true"),
    }),
  },
  Skeleton: {
    description: "骨架屏加载占位，在数据加载前展示灰色占位块。配合 Spinner 使用",
    props: z.object({
      type: z.enum(["card", "list", "paragraph"]).optional().describe("占位类型。card=卡片骨架, list=列表骨架, paragraph=段落骨架。默认 card"),
      count: z.number().optional().describe("占位块数量。默认 1"),
    }),
  },
  Empty: {
    description: "空状态占位，当搜索无结果或列表为空时展示。含插图+描述文字",
    props: z.object({
      description: z.string().optional().describe("空状态描述文字，如「暂无相关数据」"),
    }),
  },
  Breadcrumb: {
    description: "面包屑导航，展示页面层级路径。适合深层页面的位置指示",
    props: z.object({
      items: z.array(z.object({
        label: z.string().describe("面包屑文字"),
        href: z.string().optional().describe("面包屑链接，最后一项通常无 href"),
      })).optional().describe("面包屑路径数组"),
    }),
  },
  Drawer: {
    description: "抽屉面板，从屏幕边缘滑出的侧面板。适合详情查看、筛选面板、设置面板",
    props: z.object({
      title: z.string().optional().describe("抽屉标题"),
      children: z.array(z.string()).optional().describe("抽屉内部子组件 ID 列表"),
      placement: z.enum(["top", "right", "bottom", "left"]).optional().describe("滑出方向。默认 right"),
      open: z.boolean().optional().describe("是否可见。默认 false"),
    }),
  },
  Menu: {
    description: "导航菜单，垂直或水平展示菜单项。适合侧边栏导航或顶部导航",
    props: z.object({
      items: z.array(z.object({
        label: z.string().describe("菜单项文字"),
        key: z.string().describe("菜单项唯一标识"),
        icon: z.string().optional().describe("菜单项图标名称（暂用于语义标注）"),
      })).optional().describe("菜单项数组"),
      mode: z.enum(["vertical", "horizontal", "inline"]).optional().describe("菜单模式。vertical=垂直菜单, horizontal=水平导航, inline=内嵌菜单。默认 vertical"),
    }),
  },
  Tooltip: {
    description: "文字提示气泡，鼠标悬浮在子组件上时弹出提示文字",
    props: z.object({
      text: z.string().describe("提示文字内容"),
      child: z.string().describe("被包裹的子组件 ID"),
    }),
  },
};
