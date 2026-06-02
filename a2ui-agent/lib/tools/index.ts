// ===== 工具统一注册入口 =====
// 所有 Agent 可用工具在此集中管理
// 新增工具只需三步：
//   1. 创建 lib/tools/yourTool.ts，使用 defineTool 定义
//   2. 在此文件 import 并添加到 allTools 数组
//   3. Agent 的 system prompt 中添加工具说明
//
// 示例：接入自定义 API
//   import { defineTool } from "@copilotkit/runtime/v2";
//   export const crmTool = defineTool({
//     name: "query_crm",
//     description: "查询 CRM 系统中的客户数据",
//     parameters: z.object({ customerId: z.string() }),
//     execute: async ({ customerId }) => { ... },
//   });
//   然后在此文件 import 并加入 allTools 即可

export { webSearchTool } from "./webSearch";
export { locationSearchTool } from "./locationSearch";
export { weatherSearchTool } from "./weatherSearch";

import { webSearchTool } from "./webSearch";
import { locationSearchTool } from "./locationSearch";
import { weatherSearchTool } from "./weatherSearch";

export const allTools = [webSearchTool, locationSearchTool, weatherSearchTool];
