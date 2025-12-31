'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ReelScript } from '@/lib/ai-analyzer';

interface ProcessData {
  fileName: string;
  stats: { 总字幕数: number; 总时长秒数: number };
  reelScripts: ReelScript[];
  srtContent: string;
  synopsis: string;
}

export default function ProcessPage() {
  const router = useRouter();
  const [data, setData] = useState<ProcessData | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ step: '', progress: 0, message: '' });
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  // 转换为下载API路径
  const convertToDownloadPath = (path: string) => {
    // 移除开头的斜杠并编码
    const cleanPath = path.replace(/^\//, '');
    return `/api/download/${cleanPath}`;
  };

  useEffect(() => {
    try {
      // 从localStorage读取数据
      const storedData = localStorage.getItem('processData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } else {
        // 如果localStorage没有数据，返回首页
        router.push('/');
      }
    } catch (error) {
      console.error('解析数据失败:', error);
      router.push('/');
    }
  }, [router]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('请选择视频文件');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const handleProcess = async () => {
    if (!videoFile || !data) {
      setError('请上传视频文件');
      return;
    }

    setProcessing(true);
    setError('');
    setProgress({ step: 'uploading', progress: 0, message: '正在上传视频...' });

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('data', JSON.stringify(data));

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = '处理失败';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 如果无法解析为 JSON，使用原始文本
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回了无效的响应格式');
      }

      const resultData = await response.json();
      setResult(resultData);
      setProgress({ step: 'complete', progress: 100, message: '处理完成！' });
    } catch (err: any) {
      setError(err.message || '处理失败');
      setProgress({ step: 'error', progress: 0, message: '' });
    } finally {
      setProcessing(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎬 视频处理
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            上传视频文件，AI将自动裁剪并合并高光片段
          </p>
        </div>

        {/* 片段预览 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            待处理片段 ({data.reelScripts.length} 个)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.reelScripts.map((reel, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  片段 {index + 1}: {reel.title}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                  ⏱️ {reel.start_time} - {reel.end_time}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-xs italic">
                  &ldquo;{reel.hook_subtitle.substring(0, 50)}...&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 结果显示 */}
        {result ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                处理完成！
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                您的视频已成功裁剪并合并
              </p>
            </div>

            {/* 下载区域 */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  📥 下载文件
                </h3>
                <div className="space-y-3">
                  <a
                    href={convertToDownloadPath(result.finalVideo)}
                    download
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        🎬 高光合集视频
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        所有片段合并后的完整视频
                      </div>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400">↓ 下载</span>
                  </a>

                  <a
                    href={convertToDownloadPath(result.executionTable)}
                    download
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        📋 Reel剪辑执行表
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        详细的剪辑指导文档
                      </div>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400">↓ 下载</span>
                  </a>
                </div>
              </div>

              <details className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-900 dark:text-white">
                  📁 素材片段 ({result.clipFiles.length} 个)
                </summary>
                <div className="mt-4 space-y-2">
                  {result.clipFiles.map((clip: string, index: number) => (
                    <a
                      key={index}
                      href={convertToDownloadPath(clip)}
                      download
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded hover:shadow-md transition-shadow text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        片段 {index + 1}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400">↓ 下载</span>
                    </a>
                  ))}
                </div>
              </details>
            </div>

            {/* 重新开始按钮 */}
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/')}
                className="px-8 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-200
                  bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  transition-all duration-200"
              >
                ← 处理更多视频
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 视频上传 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📹 上传视频文件
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  视频文件 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    disabled={processing}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-3 file:px-6
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-purple-50 file:text-purple-700
                      hover:file:bg-purple-100
                      dark:file:bg-gray-700 dark:file:text-gray-200
                      cursor-pointer
                      border-2 border-dashed border-gray-300 dark:border-gray-600
                      rounded-lg p-4
                      focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {videoFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ 已选择: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              {/* 进度显示 */}
              {processing && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {progress.message}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {progress.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* 处理按钮 */}
              <button
                onClick={handleProcess}
                disabled={!videoFile || processing}
                className={`w-full py-4 px-6 rounded-lg font-medium text-white
                  ${!videoFile || processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                  }
                  transition-all duration-200 shadow-lg hover:shadow-xl
                  flex items-center justify-center gap-2
                `}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    处理中...
                  </>
                ) : (
                  <>🚀 开始处理视频</>
                )}
              </button>
            </div>

            {/* 说明 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                💡 处理说明
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• 系统将使用FFmpeg在本地裁剪视频片段</li>
                <li>• 处理时间取决于视频大小和片段数量</li>
                <li>• 处理完成后会提供所有文件的下载链接</li>
                <li>• 请确保服务器已安装FFmpeg</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
