export interface Subtitle {
  index: number;
  start_time: string;
  end_time: string;
  text: string;
}

export class SRTParser {
  private content: string;
  public subtitles: Subtitle[] = [];

  constructor(content: string) {
    this.content = content;
    this.parse();
  }

  parse(): void {
    const pattern = /(\d+)\s*\n\s*(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\n(.+?)(?=\n\n|\n*$)/gs;
    const matches = [...this.content.matchAll(pattern)];

    this.subtitles = matches.map((match) => {
      const [, index, start_time, end_time, text] = match;
      const cleanText = text
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        index: parseInt(index),
        start_time,
        end_time,
        text: cleanText,
      };
    });
  }

  getSubtitles(): Subtitle[] {
    return this.subtitles;
  }

  getStatistics() {
    if (this.subtitles.length === 0) {
      return { 总字幕数: 0, 总时长秒数: 0 };
    }

    const lastSubtitle = this.subtitles[this.subtitles.length - 1];
    const totalSeconds = this.timeToSeconds(lastSubtitle.end_time);

    return {
      总字幕数: this.subtitles.length,
      总时长秒数: totalSeconds,
    };
  }

  timeToSeconds(timeStr: string): number {
    const [timePart, msPart] = timeStr.split(',');
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const milliseconds = parseInt(msPart);
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
  }

  timeToMicroseconds(timeStr: string): number {
    return Math.floor(this.timeToSeconds(timeStr) * 1_000_000);
  }
}
