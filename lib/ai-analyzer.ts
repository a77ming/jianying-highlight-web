import OpenAI from 'openai';
import { Subtitle } from './srt-parser';
import { generatePrompt } from './prompts';

export interface ReelScript {
  title: string;
  hook_subtitle: string;
  start_time: string;
  end_time: string;
  cut_sequence: string;
  scene_descriptions: string[];
  subtitle_strategy: {
    original_subtitles: string[];
    info_captions?: string[];
    emphasis_elements?: string[];
    new_subtitles_voiceover?: string;
  };
  voiceover_script?: string;
  voiceover_style?: string;
  editing_direction: string;
  originality_elements?: string[];
  target_emotion?: string;
  reason: string;
}

export class AIAnalyzer {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, baseURL: string = 'https://yunwu.ai/v1', model: string = 'gpt-4o') {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });
    this.model = model;
  }

  async analyzeHighlights(
    subtitles: Subtitle[],
    synopsis: string,
    maxHighlights: number = 5,
    minDuration: number = 8,
    maxDuration: number = 15
  ): Promise<ReelScript[]> {
    const subtitleText = subtitles
      .map((sub) => `[${sub.start_time} - ${sub.end_time}] ${sub.text}`)
      .join('\n');

    const prompt = generatePrompt(
      synopsis,
      subtitleText,
      maxHighlights,
      minDuration,
      maxDuration
    );

    try {
      console.log('开始调用AI API...');
      console.log('使用的API地址:', this.client.baseURL);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的短视频二创内容制作人，精通Facebook原创性政策。你必须确保每个Reel方案都包含独特的画外音分析、创意性剪辑手法、信息字幕和新信息内容。输出格式严格按照要求的JSON格式，且必须通过原创性自检。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 6000,
      });

      console.log('API响应成功，正在解析结果...');

      const resultText = response.choices[0].message.content || '';
      console.log('AI返回的内容长度:', resultText.length);

      // 解析JSON
      const jsonStart = resultText.indexOf('[');
      const jsonEnd = resultText.lastIndexOf(']') + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = resultText.substring(jsonStart, jsonEnd);
        console.log('提取的JSON长度:', jsonString.length);

        const reelScripts = JSON.parse(jsonString);
        console.log('成功解析，找到', reelScripts.length, '个高光片段');
        return reelScripts;
      }

      console.error('未找到有效的JSON数组');
      return [];
    } catch (error: any) {
      console.error('AI分析失败 - 详细错误:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        stack: error.stack,
      });

      // 处理常见的 OpenAI API 错误
      if (error.status === 401) {
        throw new Error('API密钥无效或已过期，请检查API配置\n\n可能的原因：\n1. API密钥已过期\n2. API密钥额度已用完\n3. API密钥被封禁\n\n请联系API提供商获取新的密钥');
      } else if (error.status === 429) {
        throw new Error('API请求频率超限或余额不足，请稍后重试\n\n建议：\n1. 检查API账户余额\n2. 等待几分钟后重试\n3. 减少并发请求');
      } else if (error.status === 500) {
        throw new Error('API服务器错误，请稍后重试\n\n建议：\n1. 等待几分钟后重试\n2. 检查API服务状态');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('无法找到API服务器 (yunwu.ai)\n\n可能的原因：\n1. 网络连接问题\n2. API服务地址已变更\n3. DNS解析失败\n\n建议：\n1. 检查网络连接\n2. 尝试访问 https://yunwu.ai 确认服务可用\n3. 联系技术支持');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('API服务器拒绝连接\n\n可能的原因：\n1. API服务器正在维护\n2. 防火墙阻止了连接\n3. API端口被封禁\n\n建议：稍后重试或联系技术支持');
      } else if (error instanceof SyntaxError) {
        throw new Error('AI返回的数据格式错误\n\n可能的原因：\n1. AI模型返回了非标准JSON格式\n2. 返回内容被截断\n\n建议：\n1. 尝试减少 maxHighlights 参数\n2. 尝试增加 maxDuration 参数以减少内容量');
      }

      // 打印完整的错误信息用于调试
      console.error('完整错误对象:', JSON.stringify(error, null, 2));

      throw new Error(`AI分析失败: ${error.message || '未知错误'}\n\n错误代码: ${error.code || 'N/A'}\n状态码: ${error.status || 'N/A'}`);
    }
  }
}
