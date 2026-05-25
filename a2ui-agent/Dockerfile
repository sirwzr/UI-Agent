FROM node:22-alpine AS base

# ---- Dependencies ----
FROM base AS deps
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# ---- Builder ----
FROM base AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# ---- Production ----
FROM base AS runner
RUN corepack enable pnpm
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
