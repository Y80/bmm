# 使用 node:18-alpine 作为基础镜像
FROM node:18-alpine

ENV DB_CONNECTION_URL postgresql://postgres:postgres@postgres:5432/bmm

# zx 依赖 bash 
RUN apk update && apk add bash

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制项目文件
COPY . .

# 安装依赖
RUN pnpm install

# 构建 Next.js 项目
RUN pnpm run build

# 暴露应用端口
EXPOSE 9090

# 启动 Next.js 应用
# CMD ["pnpm", "run", "start"]

