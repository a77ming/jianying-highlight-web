'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ReelScript } from '@/lib/ai-analyzer';
import { SRTParser } from '@/lib/srt-parser';
import { ClientAIAnalyzer } from '@/lib/client-ai-analyzer';

interface PreviewData {
  fileName: string;
  stats: { 总字幕数: number; 总时长秒数: number };
  reelScripts: ReelScript[];
  srtContent: string;
  synopsis: string;
  videoFileName?: string;
}

export default function PreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<PreviewData | null>(null);
  const [selectedReels, setSelectedReels] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 视频上传和处理状态
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState('');
  const [processedResult, setProcessedResult] = useState<{
    clipFiles: string[];
    clipUrls: string[];
    downloadUrl: string;
    tableUrl: string;
    fileSize: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('previewData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        setSelectedReels(new Set(parsedData.reelScripts.map((_: any, i: number) => i)));
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('解析数据失败:', error);
      router.push('/');
    }
  }, [router]);

  const toggleReel = (index: number) => {
    const newSelected = new Set(selectedReels);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedReels(newSelected);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.toLowerCase().split('.').pop();
      const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
      if (!videoExts.includes(ext || '')) {
        setError('请选择视频文件 (MP4, MOV, AVI, MKV)');
        return;
      }
      setVideoFile(file);
      setError('');
      setProcessedResult(null);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!videoFile || !data) {
      setError('请先选择视频文件');
      return;
    }

    setUploading(true);
    setError('');
    setProcessedResult(null);

    try {
      // 1. 上传视频
      const uploadFormData = new FormData();
      uploadFormData.append('file', videoFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('视频上传失败');
      }

      const uploadResult = await uploadResponse.json();

      // 2. 处理视频
      setUploading(false);
      setProcessing(true);
      setProcessProgress('正在处理视频...');

      const selectedScripts = data.reelScripts.filter((_, i) => selectedReels.has(i));

      const processResponse = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoFileName: uploadResult.savedName,
          reelScripts: selectedScripts,
          videoName: data.fileName.replace('.srt', ''),
        }),
      });

      if (!processResponse.ok) {
        const err = await processResponse.json();
        throw new Error(err.error || '视频处理失败');
      }

      const processResult = await processResponse.json();

      // 格式化文件大小
      const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      setProcessedResult({
        clipFiles: processResult.clipFiles,
        clipUrls: processResult.clipUrls,
        downloadUrl: processResult.downloadUrl,
        tableUrl: processResult.tableUrl,
        fileSize: formatSize(processResult.finalVideoSize),
      });
    } catch (err: any) {
      setError(err.message || '处理失败，请重试');
    } finally {
      setUploading(false);
      setProcessing(false);
      setProcessProgress('');
    }
  };

  const handleExport = () => {
    if (!data) return;

    const selectedScripts = data.reelScripts.filter((_, i) => selectedReels.has(i));

    const csvContent = [
      ['序号', '标题', '开始时间', '结束时间', '画外音', '剪辑手法', '原创元素'].join(','),
      ...selectedScripts.map((script, i) => [
        i + 1,
        `"${script.title}"`,
        script.start_time,
        script.end_time,
        `"${(script.voiceover_script || '').replace(/"/g, '""')}"`,
        `"${script.editing_direction}"`,
        `"${(script.originality_elements || []).join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `剪辑方案_${data.fileName.replace('.srt', '')}.csv`;
    link.click();
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">加载中...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            分析结果
          </h1>
          <p className="text-slate-600">
            共识别 {data.reelScripts.length} 个高光片段，已选择 {selectedReels.size} 个
          </p>
        </div>

        {/* 视频上传区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">视频切合并成</h2>

          {!processedResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {videoFile ? '更换视频' : '选择视频文件'}
                </button>
                {videoFile && (
                  <span className="text-slate-600">
                    已选择: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500">
                支持 MP4, MOV, AVI, MKV, WebM 格式
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleUploadAndProcess}
                disabled={!videoFile || uploading || processing || selectedReels.size === 0}
                className={`py-3 px-6 rounded-lg font-medium text-white transition-all
                  ${!videoFile || selectedReels.size === 0
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800'
                  }
                  flex items-center gap-2`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    上传中...
                  </>
                ) : processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {processProgress || '处理中...'}
                  </>
                ) : (
                  '开始切合并成'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">处理完成！</span>
              </div>

              {/* 合成视频下载 */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-medium text-green-800 mb-2">合成视频</h3>
                <a
                  href={processedResult.downloadUrl}
                  download
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载合成视频 ({processedResult.fileSize})
                </a>
              </div>

              {/* 切片下载 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-medium text-slate-800 mb-2">
                  切片片段 ({processedResult.clipFiles.length}个)
                </h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {processedResult.clipFiles.map((fileName, index) => (
                    <a
                      key={index}
                      href={processedResult.clipUrls[index]}
                      download
                      className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="truncate">{fileName}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* 执行表下载 */}
              <div className="flex gap-4">
                <a
                  href={processedResult.tableUrl}
                  download
                  className="flex-1 py-3 px-6 rounded-lg font-medium text-center border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  下载执行表
                </a>
              </div>

              <button
                onClick={() => {
                  setVideoFile(null);
                  setProcessedResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-slate-600 hover:text-slate-900 text-sm"
              >
                重新处理
              </button>
            </div>
          )}
        </div>

        {/* 结果列表 */}
        <div className="space-y-4 mb-8">
          {data.reelScripts.map((script, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer
                ${selectedReels.has(index) ? 'border-slate-900' : 'border-slate-200 hover:border-slate-300'}`}
              onClick={() => toggleReel(index)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${selectedReels.has(index) ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
                        {selectedReels.has(index) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {script.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {script.start_time} - {script.end_time}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {script.voiceover_script && (
                    <div>
                      <span className="font-medium text-slate-700">画外音：</span>
                      <p className="text-slate-600 mt-1">{script.voiceover_script}</p>
                    </div>
                  )}

                  {script.subtitle_strategy?.info_captions && script.subtitle_strategy.info_captions.length > 0 && (
                    <div>
                      <span className="font-medium text-slate-700">字幕策略：</span>
                      <p className="text-slate-600 mt-1">{script.subtitle_strategy.info_captions.join('; ')}</p>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-slate-700">剪辑手法：</span>
                    <p className="text-slate-600 mt-1">{script.editing_direction}</p>
                  </div>

                  {script.originality_elements && script.originality_elements.length > 0 && (
                    <div>
                      <span className="font-medium text-slate-700">原创元素：</span>
                      <p className="text-slate-600 mt-1">{script.originality_elements.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-lg font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            返回
          </button>
          <button
            onClick={handleExport}
            disabled={selectedReels.size === 0}
            className={`flex-1 py-3 px-6 rounded-lg font-medium text-white
              ${selectedReels.size === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800'
              }
              transition-colors`}
          >
            导出剪辑方案 ({selectedReels.size} 个片段)
          </button>
        </div>
      </div>
    </main>
  );
}
