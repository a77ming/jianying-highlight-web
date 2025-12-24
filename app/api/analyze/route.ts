import { NextRequest, NextResponse } from 'next/server';
import { SRTParser } from '@/lib/srt-parser';
import { AIAnalyzer } from '@/lib/ai-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { srtContent, synopsis, fileName, maxHighlights, minDuration, maxDuration } = body;

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

    // 使用自定义参数或默认值
    const maxHighlightsValue = maxHighlights || 5;
    const minDurationValue = minDuration || 8;
    const maxDurationValue = maxDuration || 15;

    // 参数验证
    if (maxDurationValue < minDurationValue) {
      return NextResponse.json(
        { error: '最大时长不能小于最小时长' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (maxHighlightsValue < 1 || maxHighlightsValue > 20) {
      return NextResponse.json(
        { error: '最大片段数必须在1-20之间' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // AI分析
    const aiAnalyzer = new AIAnalyzer(apiKey);
    const reelScripts = await aiAnalyzer.analyzeHighlights(
      subtitles,
      synopsis || '',
      maxHighlightsValue,
      minDurationValue,
      maxDurationValue
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
      parameters: {
        maxHighlights: maxHighlightsValue,
        minDuration: minDurationValue,
        maxDuration: maxDurationValue,
      },
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
