# Next 配置 output: standalone 可以减少镜像大小，因为它只会把用到的依赖打包到 .next/standalone/node_modules 下
# 但是还有一些重要依赖不会被打包，比如 zx、drizzle-kit 等，它们只有手动执行相关 scripts 才会被用到，不属于 Next 应用的一部分
# 已经尝试使用 COPY 手动复制这些依赖，但是很麻烦而且不好维护
# 所以还是使用普通的 output 模式，通过手动删除不必要的文件，可控制镜像大小仅增加 ~300Mb


FROM node:20-alpine AS base
COPY package.json .
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
RUN pnpm next build && pnpm prune --prod
# 清理一些体积较大的、运行时不需要的文件
RUN rm -rf doc .next/cache .next/trace \
node_modules/.pnpm/@libsql+linux-arm64-gnu@* \
node_modules/.pnpm/@types+* \
node_modules/.pnpm/caniuse* \
node_modules/.pnpm/@ant-design+icons* \
node_modules/.pnpm/vite* \
node_modules/.pnpm/typescript@* \
node_modules/.pnpm/eslint*
RUN find node_modules/.pnpm/ -type f -name "*.ts" -delete


FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# zx 依赖 bash
RUN apk add bash
COPY --from=builder /app .

EXPOSE 3000

CMD ["pnpm", "run", "start"]
