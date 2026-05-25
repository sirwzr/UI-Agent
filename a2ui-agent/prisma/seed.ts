// ===== 种子数据 =====
// 使用: pnpm tsx prisma/seed.ts
// 在 docker compose up postgres 之后、prisma migrate dev 之后运行

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. 创建演示 admin 用户
  const user = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: {
      email: "dev@example.com",
      name: "Developer",
      role: "admin",
    },
  });
  console.log(`  User: ${user.email} (id: ${user.id})`);

  // 2. 创建 3 个演示对话
  const conversations = [
    {
      title: "餐厅预订表单",
      surfaceId: "booking-form",
      messages: [
        { role: "user", content: "帮我做一个餐厅预订表单，包含日期、时间、人数、备注" },
        {
          role: "assistant",
          content:
            '正在为您创建餐厅预订表单...\n\n{"version":"v0.9","createSurface":{"surfaceId":"booking-form","catalogId":"https://a2ui.org/specification/v0_9/basic_catalog.json"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"booking-form","components":[{"id":"root","component":"Column","children":["title-text","date-field","time-field","count-field","note-field","submit-btn"]},{"id":"title-text","component":"Text","text":"餐厅预订","variant":"h1"},{"id":"date-field","component":"DateTimeInput","label":"预订日期","enableDate":true,"value":{"path":"/data/date"}},{"id":"time-field","component":"DateTimeInput","label":"预订时间","enableTime":true,"value":{"path":"/data/time"}},{"id":"count-field","component":"TextField","label":"用餐人数","inputType":"number","placeholder":"请输入人数","validation":{"required":true,"min":1,"max":20},"value":{"path":"/data/count"}},{"id":"note-field","component":"TextField","label":"备注","placeholder":"特殊要求...","value":{"path":"/data/note"}},{"id":"submit-btn","component":"Button","text":"确认预订","primary":true,"action":{"name":"confirm_booking"}}]}}\n{"version":"v0.9","updateDataModel":{"surfaceId":"booking-form","path":"/data","value":{"date":"","time":"","count":1,"note":""}}}',
        },
      ],
    },
    {
      title: "产品搜索页面",
      surfaceId: "search-products",
      messages: [
        { role: "user", content: "我要搜索产品，帮我做一个产品搜索页面" },
        {
          role: "assistant",
          content:
            '为您生成产品搜索界面...\n\n{"version":"v0.9","createSurface":{"surfaceId":"search-products","catalogId":"https://a2ui.org/specification/v0_9/basic_catalog.json"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"search-products","components":[{"id":"root","component":"Column","children":["title-text","search-card","results-card"]},{"id":"title-text","component":"Text","text":"产品搜索","variant":"h1"},{"id":"search-card","component":"Card","title":"搜索条件","children":["search-row"]},{"id":"search-row","component":"Row","children":["keyword-field","cuisine-picker","search-btn"]},{"id":"keyword-field","component":"TextField","label":"关键词","placeholder":"输入产品名称","value":{"path":"/data/keyword"}},{"id":"cuisine-picker","component":"ChoicePicker","label":"分类","options":["全部","电子产品","服装","食品","图书"],"value":{"path":"/data/category"}},{"id":"search-btn","component":"Button","text":"搜索","primary":true,"action":{"name":"search_restaurants"}},{"id":"results-card","component":"Card","title":"搜索结果","children":["results-list"]},{"id":"results-list","component":"List","children":[]}]}}\n{"version":"v0.9","updateDataModel":{"surfaceId":"search-products","path":"/data","value":{"keyword":"","category":"全部"}}}',
        },
      ],
    },
    {
      title: "用户注册页面",
      surfaceId: "register-form",
      messages: [
        { role: "user", content: "做一个用户注册页面，需要邮箱、密码、确认密码、同意协议" },
        {
          role: "assistant",
          content:
            '正在生成注册表单...\n\n{"version":"v0.9","createSurface":{"surfaceId":"register-form","catalogId":"https://a2ui.org/specification/v0_9/basic_catalog.json"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"register-form","components":[{"id":"root","component":"Column","children":["title-text","card","reg-btn"]},{"id":"title-text","component":"Text","text":"用户注册","variant":"h1"},{"id":"card","component":"Card","title":"注册信息","children":["email-field","password-field","confirm-field","agree-check"]},{"id":"email-field","component":"TextField","label":"邮箱","inputType":"email","placeholder":"请输入邮箱","validation":{"required":true},"value":{"path":"/data/email"}},{"id":"password-field","component":"TextField","label":"密码","inputType":"password","placeholder":"至少8位字符","validation":{"required":true,"minLength":8},"value":{"path":"/data/password"}},{"id":"confirm-field","component":"TextField","label":"确认密码","inputType":"password","placeholder":"再次输入密码","validation":{"required":true},"value":{"path":"/data/confirmPassword"}},{"id":"agree-check","component":"CheckBox","label":"我已阅读并同意服务条款和隐私政策","value":{"path":"/data/agreed"}},{"id":"reg-btn","component":"Button","text":"注册","primary":true,"action":{"name":"submit_form"}}]}}\n{"version":"v0.9","updateDataModel":{"surfaceId":"register-form","path":"/data","value":{"email":"","password":"","confirmPassword":"","agreed":false}}}',
        },
      ],
    },
  ];

  for (const conv of conversations) {
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: conv.title,
        status: "active",
        messages: {
          create: conv.messages.map((m) => ({
            role: m.role,
            content: m.content,
            textContent: m.content.split("\n")[0],
          })),
        },
        surfaceStates: {
          create: {
            surfaceId: conv.surfaceId,
            dataModel: {},
            componentTree: {},
          },
        },
      },
    });
    console.log(`  Conversation: ${conversation.title} (id: ${conversation.id})`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
