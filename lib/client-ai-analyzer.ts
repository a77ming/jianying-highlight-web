import { Subtitle } from './srt-parser';
import { ReelScript } from './ai-analyzer';
import { DEFAULT_API_KEY, DEFAULT_BASE_URL, DEFAULT_MODEL } from './config';

/**
 * 客户端AI分析器 - 直接在浏览器/Electron中调用OpenAI API
 */
export class ClientAIAnalyzer {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(
    apiKey?: string,
    baseURL: string = DEFAULT_BASE_URL,
    model: string = DEFAULT_MODEL
  ) {
    // 如果没有提供API密钥，使用默认配置
    this.apiKey = apiKey || DEFAULT_API_KEY;
    this.baseURL = baseURL;
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

    // 动态导入prompt生成函数
    const { generatePrompt } = await import('./prompts');
    const prompt = generatePrompt(synopsis, subtitleText, maxHighlights, minDuration, maxDuration);

    try {
      console.log('开始调用AI API...');
      console.log('使用的API地址:', this.baseURL);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
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
        }),
      });

      console.log('API响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API错误响应:', errorData);

        if (response.status === 401) {
          throw new Error('API密钥无效或已过期');
        } else if (response.status === 429) {
          throw new Error('API请求频率超限或余额不足');
        } else if (response.status === 500) {
          throw new Error('API服务器错误');
        }

        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API响应成功，正在解析结果...');

      const resultText = data.choices[0]?.message?.content || '';
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
        stack: error.stack,
      });

      if (error.message) {
        throw error;
      }

      throw new Error(`AI分析失败: ${error.message || '未知错误'}`);
    }
  }
}
