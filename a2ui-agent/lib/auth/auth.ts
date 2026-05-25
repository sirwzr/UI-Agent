import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export type UserRole = "user" | "admin";

// 无数据库时的 mock 用户 ID（必须是合法 UUID 格式，否则 PostgreSQL UUID 列会拒绝）
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      ...((!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) && {
        enabled: false,
      }),
    }),
    // 开发环境简易凭证登录
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            id: "dev",
            name: "开发环境登录",
            credentials: {
              email: { label: "Email", type: "text", value: "dev@example.com" },
              name: { label: "Name", type: "text", value: "Developer" },
            },
            async authorize(credentials) {
              const email =
                (credentials as { email: string }).email || "dev@example.com";
              const name =
                (credentials as { name: string }).name || "Developer";

              // 尝试数据库，失败则返回 mock user
              if (process.env.DATABASE_URL) {
                try {
                  const { prisma } = await import("@/lib/db/prisma");
                  let user = await prisma.user.findUnique({ where: { email } });
                  if (!user) {
                    user = await prisma.user.create({
                      data: { email, name, role: "admin" },
                    });
                  }
                  console.log("[auth] DB user found/created:", user.id);
                  return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role as UserRole,
                  };
                } catch (err) {
                  console.error("[auth] DB error, falling back to mock:", err);
                }
              }

              // 无数据库 mock 登录
              return {
                id: MOCK_USER_ID,
                email,
                name,
                role: "admin" as UserRole,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role ?? "user";
        token.id = user.id ?? token.sub;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: (token.role as UserRole) ?? "user",
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: { strategy: "jwt" },
});
