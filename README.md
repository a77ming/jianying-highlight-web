# 🎬 AI高光剪辑工具 - Next.js版本

基于Next.js的智能视频高光片段自动剪辑工具，支持上传SRT字幕文件和视频，AI自动识别精彩片段并裁剪合并。

## ✨ 功能特点

- 📝 **SRT字幕解析**：自动解析SRT字幕文件
- 🤖 **AI智能分析**：使用GPT-4o识别高光片段
- 👀 **预览确认**：生成剪辑执行表后可预览并选择片段
- 🎬 **视频裁剪**：使用FFmpeg自动裁剪视频片段
- 🔄 **自动合并**：将多个片段合并成高光合集
- 📥 **文件下载**：提供所有输出文件的下载链接

## 🚀 快速开始

### 前置要求

- Node.js 18+
- FFmpeg（必须安装并在PATH中）

### 安装FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
下载FFmpeg并添加到系统PATH：https://ffmpeg.org/download.html

### 安装依赖

```bash
cd jianying-highlight-web
npm install
```

### 运行开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用流程

### 1. 上传字幕文件
- 选择SRT格式的字幕文件
- 输入短剧简介（可选，帮助AI更好地理解）
- 输入OpenAI API密钥

### 2. AI分析
- AI自动分析字幕并识别高光片段
- 生成详细的剪辑执行表

### 3. 预览确认
- 查看AI识别的所有片段
- 预览每个片段的详细信息
- 选择需要的片段
- 可下载剪辑执行表

### 4. 视频处理
- 上传对应的视频文件
- 系统自动裁剪并合并
- 下载生成的视频和素材

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: OpenAI API (GPT-4o)
- **视频处理**: FFmpeg + fluent-ffmpeg
- **文件上传**: Next.js API Routes

## 📁 项目结构

```
jianying-highlight-web/
├── app/
│   ├── api/
│   │   ├── analyze/        # SRT分析和AI识别API
│   │   └── process/        # 视频处理API
│   ├── preview/            # 预览页面
│   ├── process/            # 处理页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── components/
│   └── FileUpload.tsx      # 文件上传组件
├── lib/
│   ├── srt-parser.ts       # SRT解析器
│   ├── ai-analyzer.ts      # AI分析器
│   └── video-processor.ts  # 视频处理器
└── public/
    └── output/             # 输出文件目录
```

## ⚙️ 配置说明

### 默认参数

- **最大片段数**: 5
- **最小时长**: 8秒
- **最大时长**: 15秒

可以在 `app/api/analyze/route.ts` 中修改这些参数：

```typescript
const reelScripts = await aiAnalyzer.analyzeHighlights(
  subtitles,
  synopsis || '',
  5, // maxHighlights
  8, // minDuration
  15 // maxDuration
);
```

### API配置

支持自定义OpenAI API基础URL和模型：

```typescript
const aiAnalyzer = new AIAnalyzer(
  apiKey,
  'https://yunwu.ai/v1', // baseURL
  'gpt-4o'              // model
);
```

## 🔒 安全说明

- API密钥仅在处理时使用，不会保存
- 所有处理在服务器端进行
- 输出文件存储在 `public/output/` 目录

## 🐛 常见问题

**Q: FFmpeg未找到错误？**
A: 请确保已安装FFmpeg并添加到系统PATH

**Q: API调用失败？**
A: 检查API密钥是否正确，网络是否正常

**Q: 视频处理很慢？**
A: 处理时间取决于视频大小和片段数量，请耐心等待

**Q: 文件下载失败？**
A: 确保 `public/output/` 目录有写入权限

## 📝 许可证

MIT

## 🤝 贡献

欢迎提交Issue和Pull Request！
