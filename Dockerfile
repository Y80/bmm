FROM node:22-alpine

ARG DB_CONNECTION_URL
ENV DB_CONNECTION_URL=${DB_CONNECTION_URL}

WORKDIR /app
COPY . .

# zx 依赖 bash 
RUN apk update && apk add bash && npm install -g pnpm && pnpm install

# RUN pnpm run build

# 暴露应用端口
# EXPOSE 3000

# 启动 Next.js 应用
# CMD ["pnpm", "run", "start"]

