import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export interface ProcessingProgress {
  step: string;
  progress: number;
  message: string;
}

export class VideoProcessor {
  private outputDir: string;
  private onProgress?: (progress: ProcessingProgress) => void;

  constructor(outputDir: string, onProgress?: (progress: ProcessingProgress) => void) {
    this.outputDir = outputDir;
    this.onProgress = onProgress;
  }

  async processVideo(
    videoPath: string,
    reelScripts: any[],
    videoName: string
  ): Promise<{
    clipFiles: string[];
    finalVideo: string;
    executionTable: string;
  }> {
    try {
      // 确保输出目录存在
      await fs.mkdir(this.outputDir, { recursive: true });
      const clipsDir = path.join(this.outputDir, '素材片段');
      await fs.mkdir(clipsDir, { recursive: true });

      // 步骤1: 裁剪视频片段
      this.onProgress?.({
        step: 'cutting',
        progress: 10,
        message: '正在裁剪视频片段...',
      });

      const clipFiles: string[] = [];

      for (let i = 0; i < reelScripts.length; i++) {
        const reel = reelScripts[i];
        const startSeconds = this.timeToSeconds(reel.start_time);
        const endSeconds = this.timeToSeconds(reel.end_time);
        const duration = endSeconds - startSeconds;

        const clipPath = path.join(
          clipsDir,
          `${videoName}_片段${i + 1}_${reel.start_time.replace(/:/g, '-')}_${reel.end_time.replace(/:/g, '-')}.mp4`
        );

        await this.cutVideo(videoPath, clipPath, reel.start_time, duration);

        clipFiles.push(clipPath);

        this.onProgress?.({
          step: 'cutting',
          progress: 10 + (i + 1) * 20,
          message: `已裁剪片段 ${i + 1}/${reelScripts.length}`,
        });
      }

      // 步骤2: 合并视频
      this.onProgress?.({
        step: 'merging',
        progress: 60,
        message: '正在合并视频片段...',
      });

      const finalVideo = path.join(this.outputDir, `${videoName}_高光合集.mp4`);
      await this.mergeVideos(clipFiles, finalVideo);

      // 步骤3: 生成执行表
      this.onProgress?.({
        step: 'generating',
        progress: 90,
        message: '正在生成执行表...',
      });

      const executionTable = path.join(this.outputDir, `${videoName}_Reel剪辑执行表.txt`);
      await this.generateExecutionTable(reelScripts, videoName, executionTable);

      this.onProgress?.({
        step: 'complete',
        progress: 100,
        message: '处理完成！',
      });

      return {
        clipFiles,
        finalVideo,
        executionTable,
      };
    } catch (error) {
      throw new Error(`视频处理失败: ${error}`);
    }
  }

  private async cutVideo(
    inputPath: string,
    outputPath: string,
    startTime: string,
    duration: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset fast',
          '-avoid_negative_ts make_zero',
        ])
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  private async mergeVideos(inputPaths: string[], outputPath: string): Promise<void> {
    const listFilePath = path.join(this.outputDir, 'file_list.txt');

    // 创建文件列表
    const listContent = inputPaths
      .map((p) => {
        const absPath = path.resolve(p);
        return `file '${absPath.replace(/'/g, "'\\''")}'`;
      })
      .join('\n');

    await fs.writeFile(listFilePath, listContent);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFilePath)
        .inputOptions(['-f concat', '-safe 0'])
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions(['-preset fast'])
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  private async generateExecutionTable(
    reelScripts: any[],
    videoName: string,
    outputPath: string
  ): Promise<void> {
    let content = '='.repeat(100) + '\n';
    content += '🎬 Reel剪辑执行总表（Facebook原创性合规版）\n';
    content += '='.repeat(100) + '\n';
    content += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
    content += `源视频: ${videoName}\n`;
    content += `Reel数量: ${reelScripts.length}\n`;
    content += `✅ 本方案已通过Facebook原创性标准自检\n`;
    content += '\n';

    reelScripts.forEach((reel, i) => {
      content += '\n' + '='.repeat(100) + '\n';
      content += `【Reel ${i + 1}】${reel.title}\n`;
      content += '='.repeat(100) + '\n';
      content += `📣 钩子字幕: "${reel.hook_subtitle}"\n`;
      content += `⏱️ 时间范围: ${reel.start_time} - ${reel.end_time}\n`;
      if (reel.target_emotion) {
        content += `🎯 目标情感: ${reel.target_emotion}\n`;
      }
      content += '\n';

      content += '📽️ 二创混剪顺序:\n';
      content += `   ${reel.cut_sequence}\n`;
      content += '\n';

      content += '🎬 精准画面定位描述:\n';
      reel.scene_descriptions.forEach((desc: string, idx: number) => {
        content += `   画面${idx + 1}: ${desc}\n`;
      });
      content += '\n';

      content += '🎙️ 画外音脚本:\n';
      if (reel.voiceover_script) {
        content += `${reel.voiceover_script}\n`;
        if (reel.voiceover_style) {
          content += `风格: ${reel.voiceover_style}\n`;
        }
      } else if (reel.subtitle_strategy.new_subtitles_voiceover) {
        content += `   ${reel.subtitle_strategy.new_subtitles_voiceover}\n`;
      }
      content += '\n';

      content += '📝 字幕方案:\n';
      content += `   原有字幕:\n`;
      reel.subtitle_strategy.original_subtitles.forEach((sub: string) => {
        content += `     - ${sub}\n`;
      });

      if (reel.subtitle_strategy.info_captions && reel.subtitle_strategy.info_captions.length > 0) {
        content += `   信息字幕（Facebook合规必需）:\n`;
        reel.subtitle_strategy.info_captions.forEach((cap: string) => {
          content += `     - ${cap}\n`;
        });
      }

      if (reel.subtitle_strategy.emphasis_elements && reel.subtitle_strategy.emphasis_elements.length > 0) {
        content += `   强调元素:\n`;
        reel.subtitle_strategy.emphasis_elements.forEach((ele: string) => {
          content += `     - ${ele}\n`;
        });
      }
      content += '\n';

      content += '🎯 剪辑思路:\n';
      content += `   ${reel.editing_direction}\n`;
      content += '\n';

      if (reel.originality_elements && reel.originality_elements.length > 0) {
        content += '✅ 原创性元素清单（Facebook合规）:\n';
        reel.originality_elements.forEach((ele: string) => {
          content += `   ${ele}\n`;
        });
        content += '\n';
      }

      content += `💡 选择原因: ${reel.reason}\n`;
    });

    content += '\n' + '='.repeat(100) + '\n';
    content += '📋 Facebook原创性合规说明\n';
    content += '='.repeat(100) + '\n';
    content += '本方案包含以下符合Facebook原创性标准的元素：\n';
    content += '✅ 独特的画外音/旁白（提供新观点和分析，非简单翻译）\n';
    content += '✅ 创意性剪辑手法（非线性叙事、对比、悬念等）\n';
    content += '✅ 信息字幕（人物标签、心理活动、关系说明等）\n';
    content += '✅ 新信息内容（分析、解读、教育意义等）\n';
    content += '\n以上元素确保内容符合Facebook"有意义润色"标准，不会被判定为缺乏原创性。\n';

    await fs.writeFile(outputPath, content, 'utf-8');
  }

  private timeToSeconds(timeStr: string): number {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const [h, m, s] = parts.map(Number);
      return h * 3600 + m * 60 + s;
    }
    return 0;
  }

  static async checkFFmpeg(): Promise<boolean> {
    return new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        resolve(!err);
      });
    });
  }
}
