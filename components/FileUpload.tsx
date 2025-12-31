'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientAIAnalyzer } from '@/lib/client-ai-analyzer';
import { SRTParser } from '@/lib/srt-parser';

export default function FileUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [synopsis, setSynopsis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 自定义参数
  const [maxHighlights, setMaxHighlights] = useState(5);
  const [minDuration, setMinDuration] = useState(8);
  const [maxDuration, setMaxDuration] = useState(15);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && !selectedFile.name.endsWith('.srt')) {
      setError('请选择 .srt 格式的字幕文件');
      return;
    }
    setFile(selectedFile || null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('请选择字幕文件');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const content = await file.text();

      const srtParser = new SRTParser(content);
      const subtitles = srtParser.getSubtitles();
      const stats = srtParser.getStatistics();

      if (subtitles.length === 0) {
        setError('字幕文件解析失败或为空');
        return;
      }

      if (maxDuration < minDuration) {
        setError('最大时长不能小于最小时长');
        return;
      }

      if (maxHighlights < 1 || maxHighlights > 20) {
        setError('最大片段数必须在 1-20 之间');
        return;
      }

      const aiAnalyzer = new ClientAIAnalyzer();
      const reelScripts = await aiAnalyzer.analyzeHighlights(
        subtitles,
        synopsis || '',
        maxHighlights,
        minDuration,
        maxDuration
      );

      if (reelScripts.length === 0) {
        setError('AI 未能识别高光片段，请尝试调整参数');
        return;
      }

      const data = {
        success: true,
        fileName: file.name,
        stats,
        reelScripts,
        srtContent: content,
        synopsis,
        parameters: {
          maxHighlights,
          minDuration,
          maxDuration,
        },
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem('previewData', JSON.stringify(data));
      router.push('/preview');
    } catch (err: any) {
      console.error('处理失败:', err);
      setError(err.message || '处理失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 字幕文件上传 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              字幕文件 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".srt"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-slate-100 file:text-slate-700
                  hover:file:bg-slate-200
                  cursor-pointer
                  border border-slate-300 rounded-lg p-3
                  focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600">
                ✓ 已选择: {file.name}
              </p>
            )}
          </div>

          {/* 短剧简介 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              短剧简介
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="请输入短剧的简介，帮助 AI 更好地理解内容..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
                bg-white text-slate-900
                placeholder:text-slate-400
                transition-colors resize-none"
            />
          </div>

          {/* 自定义参数 */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              AI 参数设置
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {/* 最大片段数 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  片段数量
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxHighlights}
                  onChange={(e) => setMaxHighlights(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
                    bg-white text-slate-900
                    text-sm"
                />
              </div>

              {/* 最小时长 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  最小时长（秒）
                </label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={minDuration}
                  onChange={(e) => setMinDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
                    bg-white text-slate-900
                    text-sm"
                />
              </div>

              {/* 最大时长 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  最大时长（秒）
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
                    bg-white text-slate-900
                    text-sm"
                />
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white
              ${loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-900'
              }
              transition-all duration-200
              flex items-center justify-center gap-2
            `}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                分析中...
              </>
            ) : (
              '开始分析'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
