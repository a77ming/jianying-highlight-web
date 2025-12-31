import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { VideoProcessor } from '@/lib/video-processor';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/app/outputs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoFileName, reelScripts, videoName } = body;

    if (!videoFileName || !reelScripts || reelScripts.length === 0) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    const videoPath = path.join(UPLOAD_DIR, videoFileName);

    // 检查视频文件是否存在
    try {
      await fs.access(videoPath);
    } catch {
      return NextResponse.json({ error: '视频文件不存在' }, { status: 404 });
    }

    // 创建进度回调
    const sendProgress = async (progress: any) => {
      // 在实际场景中可以使用 WebSocket 或 SSE
      // 这里简化处理，直接返回
      console.log('进度:', progress);
    };

    const processor = new VideoProcessor(OUTPUT_DIR, sendProgress);

    const result = await processor.processVideo(
      videoPath,
      reelScripts,
      videoName || videoFileName.replace(/\.[^/.]+$/, '')
    );

    // 获取文件大小
    const getFileSize = async (filePath: string) => {
      const stats = await fs.stat(filePath);
      return stats.size;
    };

    const finalVideoSize = await getFileSize(result.finalVideo);

    // 准备下载链接
    const getDownloadUrl = (filename: string) => `/api/download/${encodeURIComponent(filename)}`;

    return NextResponse.json({
      success: true,
      clipFiles: result.clipFiles.map(f => path.basename(f)),
      clipUrls: result.clipFiles.map(f => getDownloadUrl(path.basename(f))),
      finalVideo: path.basename(result.finalVideo),
      finalVideoSize,
      executionTable: path.basename(result.executionTable),
      downloadUrl: getDownloadUrl(path.basename(result.finalVideo)),
      tableUrl: getDownloadUrl(path.basename(result.executionTable)),
    });
  } catch (error: any) {
    console.error('视频处理失败:', error);
    return NextResponse.json({ error: `处理失败: ${error.message}` }, { status: 500 });
  }
}
