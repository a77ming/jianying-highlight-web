# AI高光剪辑工具

智能视频高光片段自动识别工具，支持AI自动分析并生成专业的剪辑执行方案，支持一键切合并成视频。

## 功能特点

- **上传SRT字幕** - 自动解析SRT字幕文件
- **AI智能分析** - 使用GPT-4o识别高光片段
- **视频切合并成** - 一键将选中片段合成完整视频
- **Facebook原创性** - 生成的方案符合Facebook原创性标准
- **详细执行表** - 生成包含时间码、画外音、剪辑手法的详细方案

## Docker 部署（推荐）

```bash
# 克隆项目
git clone <项目地址>
cd jianying-highlight-web

# 启动服务
docker-compose up -d
```

访问 http://localhost:3000

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
npm start
```

## 技术栈

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4o)
- FFmpeg (视频处理)

## 项目结构

```
jianying-highlight-web/
├── app/
│   ├── api/
│   │   ├── upload/           # 视频上传
│   │   ├── process-video/    # 视频处理
│   │   └── download/         # 文件下载
│   ├── preview/              # 结果预览页
│   └── page.tsx              # 首页
├── lib/
│   ├── video-processor.ts    # FFmpeg视频处理
│   └── client-ai-analyzer.ts # AI分析
├── Dockerfile
├── docker-compose.yml
└── DOCKER_DEPLOY.md          # Docker部署说明
```

## 目录说明

```
uploads/    # 上传的视频文件（临时）
outputs/    # 处理完成的视频（可下载）
```

## 使用流程

1. 上传 SRT 字幕文件
2. AI 自动分析生成高光片段方案
3. 选择需要的片段
4. 上传源视频
5. 一键切合并成
6. 下载成品视频和执行表

## API 配置

API 密钥已内置在代码中（`lib/config.ts`），开箱即用。

如需修改，请编辑 `lib/config.ts`：

```typescript
export const DEFAULT_API_KEY = 'sk-your-api-key';
export const DEFAULT_BASE_URL = 'https://yunwu.ai/v1';
export const DEFAULT_MODEL = 'gpt-4o';
```

## 文档

- [Docker部署指南](./DOCKER_DEPLOY.md)
- [用户使用指南](./用户使用指南.md)

## 许可证

MIT
