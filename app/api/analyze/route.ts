import { NextRequest, NextResponse } from 'next/server';
import { SRTParser } from '@/lib/srt-parser';
import { AIAnalyzer } from '@/lib/ai-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { srtContent, synopsis, fileName } = body;

    if (!srtContent) {
      return NextResponse.json(
        { error: '缺少SRT内容' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 内置的API密钥（用户不需要输入）
    const apiKey = 'sk-JiDUxeYDc9EnJ5Gmni1tYOvucP8o8WNmY78dvnV8lQq0wKW7';

    // 解析SRT
    const srtParser = new SRTParser(srtContent);
    const subtitles = srtParser.getSubtitles();
    const stats = srtParser.getStatistics();

    if (subtitles.length === 0) {
      return NextResponse.json(
        { error: 'SRT文件解析失败或为空' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // AI分析
    const aiAnalyzer = new AIAnalyzer(apiKey);
    const reelScripts = await aiAnalyzer.analyzeHighlights(
      subtitles,
      synopsis || '',
      5, // maxHighlights
      8, // minDuration
      15 // maxDuration
    );

    if (reelScripts.length === 0) {
      return NextResponse.json(
        { error: 'AI未能识别高光片段' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      fileName,
      stats,
      reelScripts,
      srtContent,
      synopsis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('分析API错误:', error);

    // 确保返回 JSON 格式的错误
    const errorMessage = error.message || '服务器错误';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
