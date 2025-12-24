'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FileUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [synopsis, setSynopsis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && !selectedFile.name.endsWith('.srt')) {
      setError('请选择.srt格式的字幕文件');
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
      // 读取文件内容
      const content = await file.text();

      // 发送到分析API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          srtContent: content,
          synopsis,
          fileName: file.name,
        }),
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = '分析失败';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 如果无法解析为 JSON，使用原始文本
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // 检查响应内容是否为空
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回了无效的响应格式');
      }

      const data = await response.json();

      // 将数据存储到localStorage，避免URL过长
      localStorage.setItem('previewData', JSON.stringify(data));

      // 跳转到预览页面
      router.push('/preview');
    } catch (err: any) {
      setError(err.message || '处理失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          📁 上传文件
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 字幕文件上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SRT字幕文件 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".srt"
                onChange={handleFileChange}
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
            {file && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                ✓ 已选择: {file.name}
              </p>
            )}
          </div>

          {/* 短剧简介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              短剧简介 <span className="text-gray-400">(可选，但强烈推荐填写)</span>
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="请输入短剧的简介，帮助AI更好地理解内容并生成更准确的二创方案..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              💡 提示：详细的简介可以让AI生成更深入的画外音分析和创意剪辑方案
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-medium text-white
              ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              }
              transition-all duration-200 shadow-lg hover:shadow-xl
              flex items-center justify-center gap-2
            `}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                AI分析中...
              </>
            ) : (
              <>
                🚀 开始分析
              </>
            )}
          </button>
        </form>

        {/* 参数说明 */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🎯 AI识别参数
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-lg">
              <div className="font-medium">最大片段数</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">5</div>
              <div className="text-xs mt-1 opacity-75">个高光片段</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-lg">
              <div className="font-medium">最小时长</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">8</div>
              <div className="text-xs mt-1 opacity-75">秒/片段</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-lg">
              <div className="font-medium">最大时长</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">15</div>
              <div className="text-xs mt-1 opacity-75">秒/片段</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div className="font-semibold mb-1">AI已配置Facebook原创性合规</div>
                <div className="opacity-90">
                  所有生成的剪辑方案都包含独特画外音、创意剪辑手法、信息字幕等元素，
                  符合Facebook&ldquo;有意义润色&rdquo;标准，不会被判定为缺乏原创性。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
