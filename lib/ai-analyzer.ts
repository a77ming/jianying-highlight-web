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

      const resultText = response.choices[0].message.content || '';

      // 解析JSON
      const jsonStart = resultText.indexOf('[');
      const jsonEnd = resultText.lastIndexOf(']') + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const reelScripts = JSON.parse(resultText.substring(jsonStart, jsonEnd));
        return reelScripts;
      }

      return [];
    } catch (error) {
      console.error('AI分析失败:', error);
      throw new Error('AI分析失败，请检查API配置');
    }
  }
}
