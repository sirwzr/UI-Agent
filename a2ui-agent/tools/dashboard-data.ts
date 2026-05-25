// ===== 仪表盘数据工具 =====
// 提供模拟统计数据源

import type { ToolDef } from "./index";

// 模拟数据生成器
function generateSalesData() {
  return {
    totalSales: 128430,
    totalOrders: 1842,
    newUsers: 356,
    conversionRate: 12.5,
    revenueByMonth: [
      { month: "1月", revenue: 18500 },
      { month: "2月", revenue: 22300 },
      { month: "3月", revenue: 19800 },
      { month: "4月", revenue: 25600 },
      { month: "5月", revenue: 28230 },
    ],
    topProducts: [
      { name: "产品 A", sales: 423, revenue: 84500 },
      { name: "产品 B", sales: 312, revenue: 62400 },
      { name: "产品 C", sales: 256, revenue: 51200 },
    ],
    recentOrders: [
      { id: "1024", status: "已完成", amount: 328, customer: "张三" },
      { id: "1025", status: "处理中", amount: 156, customer: "李四" },
      { id: "1026", status: "已完成", amount: 892, customer: "王五" },
      { id: "1027", status: "已取消", amount: 45, customer: "赵六" },
    ],
    metrics: {
      gmv: 428000,
      avgOrderValue: 232.5,
      customerSatisfaction: 4.8,
      returnRate: 2.3,
    },
  };
}

function generateUserStats() {
  return {
    totalUsers: 12580,
    activeToday: 1842,
    newThisWeek: 356,
    retentionRate: 68.5,
    userByChannel: [
      { channel: "直接访问", count: 4520 },
      { channel: "搜索引擎", count: 3850 },
      { channel: "社交媒体", count: 2210 },
      { channel: "邮件营销", count: 2000 },
    ],
    activityTimeline: [
      { time: "09:00", users: 120 },
      { time: "10:00", users: 280 },
      { time: "11:00", users: 450 },
      { time: "12:00", users: 380 },
      { time: "13:00", users: 320 },
      { time: "14:00", users: 510 },
      { time: "15:00", users: 620 },
    ],
  };
}

function generateProjectStats() {
  return {
    total: 48,
    inProgress: 24,
    completed: 18,
    delayed: 6,
    milestones: [
      { name: "需求分析", progress: 100 },
      { name: "UI 设计", progress: 85 },
      { name: "后端开发", progress: 60 },
      { name: "前端开发", progress: 45 },
      { name: "测试", progress: 20 },
    ],
  };
}

export const dashboardTools: ToolDef[] = [
  {
    name: "fetch_dashboard_data",
    description: "获取仪表盘统计数据（销售/用户/项目进度等）",
    parameters: {
      type: "object",
      properties: {
        dashboardType: {
          type: "string",
          description: "仪表盘类型: sales / users / project",
          enum: ["sales", "users", "project"],
        },
      },
      required: ["dashboardType"],
    },
    handler: async (args) => {
      const { dashboardType } = args as {
        dashboardType: "sales" | "users" | "project";
      };

      let data: Record<string, unknown>;

      switch (dashboardType) {
        case "sales":
          data = { ...generateSalesData(), type: "sales" };
          break;
        case "users":
          data = { ...generateUserStats(), type: "users" };
          break;
        case "project":
          data = { ...generateProjectStats(), type: "project" };
          break;
        default:
          data = { ...generateSalesData(), type: "sales" };
      }

      return { success: true, data };
    },
  },
];
