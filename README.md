# AI高光剪辑工具

智能视频高光片段自动识别工具，支持AI自动分析并生成专业的剪辑执行方案，支持一键切合并成视频。

## 功能特点

- **上传SRT字幕** - 自动解析SRT字幕文件
- **AI智能分析** - 使用GPT-4o识别高光片段
- **视频切合并成** - 一键将选中片段合成完整视频
- **单独切片下载** - 每个高光片段可单独下载
- **Facebook原创性** - 生成的方案符合Facebook原创性标准
- **详细执行表** - 生成包含时间码、画外音、剪辑手法的详细方案

---

## Docker 部署（推荐 ⭐）

### 前置要求

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 一键启动

```bash
# 1. 克隆项目
git clone https://github.com/a77ming/jianying-highlight-web.git
cd jianying-highlight-web

# 2. 启动服务（首次会自动构建镜像）
docker-compose up -d

# 3. 访问应用
# 浏览器打开 http://localhost:3000
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `docker-compose up -d` | 后台启动服务 |
| `docker-compose down` | 停止服务 |
| `docker-compose restart` | 重启服务 |
| `docker-compose logs -f` | 查看日志 |
| `docker-compose build --no-cache` | 重新构建镜像 |

### 修改端口

编辑 `docker-compose.yml` 第 10 行：

```yaml
ports:
  - "8080:3000"  # 改为 8080 端口
```

### 目录说明

```
jianying-highlight-web/
├── uploads/    # 上传的视频文件（临时）
└── outputs/    # 处理完成的视频（可下载）
```

---

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build
npm start
```

---

## 使用流程

```
1. 上传 SRT 字幕文件
         ↓
2. AI 自动分析生成高光片段方案
         ↓
3. 选择需要的片段（可多选）
         ↓
4. 上传源视频文件
         ↓
5. 点击「开始切合并成」
         ↓
6. 下载成品：
   - 合成视频（所有片段合并）
   - 单独切片（每个片段单独下载）
   - 剪辑执行表
```

---

## API 配置

API 密钥已内置在代码中（`lib/config.ts`），开箱即用，无需配置。

如需修改默认配置，请编辑 `lib/config.ts`：

```typescript
export const DEFAULT_API_KEY = 'sk-your-api-key';      // API 密钥
export const DEFAULT_BASE_URL = 'https://yunwu.ai/v1';  // API 地址
export const DEFAULT_MODEL = 'gpt-4o';                  // 使用模型
```

---

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: OpenAI API (GPT-4o)
- **视频处理**: FFmpeg
- **部署**: Docker

---

## 项目结构

```
jianying-highlight-web/
├── app/
│   ├── api/
│   │   ├── upload/route.ts         # 视频上传
│   │   ├── process-video/route.ts  # 视频切合并成
│   │   └── download/[filename]/    # 文件下载
│   ├── preview/page.tsx            # 结果预览页（含下载功能）
│   └── page.tsx                    # 首页（上传字幕）
├── lib/
│   ├── video-processor.ts          # FFmpeg 视频处理
│   ├── client-ai-analyzer.ts       # 客户端 AI 分析
│   └── config.ts                   # API 配置
├── Dockerfile                      # Docker 构建文件
├── docker-compose.yml              # Docker Compose 配置
└── DOCKER_DEPLOY.md                # Docker 部署详细指南
```

---

## 文档

- [Docker 部署指南](./DOCKER_DEPLOY.md)
- [用户使用指南](./用户使用指南.md)

---

## 许可证

MIT
