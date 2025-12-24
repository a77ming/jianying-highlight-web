import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { VideoProcessor } from '@/lib/video-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;
    const dataJson = formData.get('data') as string;

    if (!video) {
      return NextResponse.json({ error: '缺少视频文件' }, { status: 400 });
    }

    if (!dataJson) {
      return NextResponse.json({ error: '缺少处理数据' }, { status: 400 });
    }

    const data = JSON.parse(dataJson);
    const reelScripts = data.reelScripts;
    const fileName = data.fileName.replace(/\.[^/.]+$/, ''); // 移除扩展名

    // 检查FFmpeg
    const ffmpegAvailable = await VideoProcessor.checkFFmpeg();
    if (!ffmpegAvailable) {
      return NextResponse.json(
        { error: 'FFmpeg未安装，请先安装FFmpeg' },
        { status: 500 }
      );
    }

    // 创建输出目录
    const outputDir = path.join(process.cwd(), 'public', 'output', Date.now().toString());
    await mkdir(outputDir, { recursive: true });

    // 保存视频文件
    const videoPath = path.join(outputDir, video.name);
    const buffer = Buffer.from(await video.arrayBuffer());
    await writeFile(videoPath, buffer);

    // 处理视频
    const processor = new VideoProcessor(outputDir);
    const result = await processor.processVideo(videoPath, reelScripts, fileName);

    // 返回相对路径用于下载
    const relativeOutput = path.relative(path.join(process.cwd(), 'public'), outputDir);

    return NextResponse.json({
      success: true,
      outputDir: relativeOutput,
      clipFiles: result.clipFiles.map((f) =>
        path.join('/', relativeOutput, path.basename(f))
      ),
      finalVideo: path.join('/', relativeOutput, path.basename(result.finalVideo)),
      executionTable: path.join('/', relativeOutput, path.basename(result.executionTable)),
    });
  } catch (error: any) {
    console.error('处理API错误:', error);
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
