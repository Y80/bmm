# 使用 node:18-alpine 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装 pnpm
RUN npm install -g pnpm

RUN apk add --no-cache postgresql-client

# RUN until pg_isready -h postgres -U postgres; do echo waiting for postgres; sleep 2; done; 


# 安装依赖
RUN pnpm install

# 构建 Next.js 项目
# RUN pnpm run build

# 暴露应用端口
EXPOSE 9090

# 启动 Next.js 应用
# CMD ["pnpm", "run", "start"]

