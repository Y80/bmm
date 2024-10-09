# 使用 node:18-alpine 作为基础镜像
FROM node:18-alpine

ARG DB_CONNECTION_URL
ENV DB_CONNECTION_URL=${DB_CONNECTION_URL}

# zx 依赖 bash 
RUN apk update && apk add bash

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install
RUN pnpm run build

# 暴露应用端口
# EXPOSE 3000

# 启动 Next.js 应用
# CMD ["pnpm", "run", "start"]

