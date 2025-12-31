import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/app/outputs';

export async function POST(request: NextRequest) {
  try {
    // 确保目录存在
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一文件名
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const safeName = file.name.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeName}_${timestamp}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      savedName: fileName,
      filePath: `/api/download/${fileName}`,
    });
  } catch (error: any) {
    console.error('上传失败:', error);
    return NextResponse.json({ error: `上传失败: ${error.message}` }, { status: 500 });
  }
}
