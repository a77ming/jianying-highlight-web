import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const OUTPUT_DIR = process.env.OUTPUT_DIR || '/app/outputs';
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // URL 解码文件名（处理中文和特殊字符）
    const decodedFilename = decodeURIComponent(filename);
    const safeFilename = path.basename(decodedFilename);

    // 防止路径遍历
    if (decodedFilename !== safeFilename) {
      return NextResponse.json({ error: '无效的文件名' }, { status: 400 });
    }

    // 查找文件的函数
    const findFile = async (dir: string): Promise<string | null> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isFile() && entry.name === safeFilename) {
            return fullPath;
          }
          if (entry.isDirectory()) {
            const found = await findFile(fullPath);
            if (found) return found;
          }
        }
      } catch {
        // 目录不存在或无法访问
      }
      return null;
    };

    // 先检查输出目录根目录
    let filePath = path.join(OUTPUT_DIR, safeFilename);
    try {
      await fs.access(filePath);
    } catch {
      // 在 outputs 目录及其子目录中查找
      const foundPath = await findFile(OUTPUT_DIR);
      if (foundPath) {
        filePath = foundPath;
      } else {
        // 检查上传目录
        filePath = path.join(UPLOAD_DIR, safeFilename);
        try {
          await fs.access(filePath);
        } catch {
          return NextResponse.json({ error: '文件不存在' }, { status: 404 });
        }
      }
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();

    // 根据文件类型设置 Content-Type
    const contentTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.txt': 'text/plain;charset=utf-8',
      '.srt': 'text/plain;charset=utf-8',
      '.csv': 'text/plain;charset=utf-8',
    };

    // 使用 encodeURI 对文件名进行编码，确保下载时正确处理
    const encodedFilename = encodeURIComponent(safeFilename);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('下载失败:', error);
    return NextResponse.json({ error: '下载失败' }, { status: 500 });
  }
}
