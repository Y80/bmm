# Next 配置 output: standalone 可以减少镜像大小，因为它只会把用到的依赖打包到 .next/standalone/node_modules 下
# 但是还有一些重要依赖不会被打包，比如 zx、drizzle-kit 等，它们只有手动执行相关 scripts 才会被用到，不属于 Next 应用的一部分
# 已经尝试使用 COPY 手动复制这些依赖，但是很麻烦而且不好维护
# 所以还是使用普通的 output 模式，通过手动删除不必要的文件，可控制镜像大小仅增加 ~300Mb

# https://github.com/vercel/next.js/tree/canary/examples/with-docker

FROM node:24-alpine AS base
RUN corepack enable && pnpm -v


FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc .

RUN pnpm install --frozen-lockfile


FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# docker 构建镜像时不需要预先配置数据库，所以不需要执行 db-init 脚本，这里直接 next build 就行
# 忽略构建错误，因为在 Github Action 中构建时，全是静态的类型检查会导致一些错误
# RUN export IGNORE_BUILD_ERRORS=true && pnpm next build 
RUN pnpm run docker:build 



FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# zx 依赖 bash
RUN apk add bash

COPY --from=builder /app/public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
