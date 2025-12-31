# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 ffmpeg（用于视频处理）
RUN apk add --no-cache ffmpeg

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建应用（使用 standalone 模式）
ENV STANDALONE=true
RUN npm run build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 安装 ffmpeg（用于视频处理）
RUN apk add --no-cache ffmpeg

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 创建上传和输出目录
RUN mkdir -p /app/uploads /app/outputs && chown -R app:nodejs /app

# 设置权限
RUN chown -R app:nodejs /app

USER app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV UPLOAD_DIR=/app/uploads
ENV OUTPUT_DIR=/app/outputs

CMD ["node", "server.js"]
