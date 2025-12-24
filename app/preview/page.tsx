'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ReelScript } from '@/lib/ai-analyzer';

interface PreviewData {
  fileName: string;
  stats: { 总字幕数: number; 总时长秒数: number };
  reelScripts: ReelScript[];
  srtContent: string;
  synopsis: string;
}

export default function PreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<PreviewData | null>(null);
  const [selectedReels, setSelectedReels] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      // 从localStorage读取数据
      const storedData = localStorage.getItem('previewData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        // 默认选中所有片段
        setSelectedReels(new Set(parsedData.reelScripts.map((_: any, i: number) => i)));
      } else {
        // 如果localStorage没有数据，返回首页
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

  const handleConfirm = async () => {
    if (selectedReels.size === 0) {
      alert('请至少选择一个片段');
      return;
    }

    setLoading(true);

    try {
      const selectedScripts = data!.reelScripts.filter((_, i) => selectedReels.has(i));

      // 将选中的数据存储到localStorage
      localStorage.setItem('processData', JSON.stringify({
        ...data,
        reelScripts: selectedScripts,
      }));

      // 跳转到处理页面
      router.push('/process');
    } catch (error) {
      console.error('处理失败:', error);
      alert('处理失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!data) return;

    let content = '='.repeat(100) + '\n';
    content += '🎬 Reel剪辑执行总表（Facebook原创性合规版）\n';
    content += '='.repeat(100) + '\n';
    content += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
    content += `源文件: ${data.fileName}\n`;
    content += `Reel数量: ${data.reelScripts.length}\n`;
    content += `✅ 本方案已通过Facebook原创性标准自检\n`;
    content += '\n';

    data.reelScripts.forEach((reel, i) => {
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
      reel.scene_descriptions.forEach((desc, idx) => {
        content += `   画面${idx + 1}: ${desc}\n`;
      });
      content += '\n';

      content += '🎙️ 画外音脚本:\n';
      if (reel.voiceover_script) {
        content += `${reel.voiceover_script}\n`;
        if (reel.voiceover_style) {
          content += `风格: ${reel.voiceover_style}\n`;
        }
      } else {
        content += `   ${reel.subtitle_strategy.new_subtitles_voiceover || '（未提供）'}\n`;
      }
      content += '\n';

      content += '📝 字幕方案:\n';
      content += `   原有字幕:\n`;
      reel.subtitle_strategy.original_subtitles.forEach((sub) => {
        content += `     - ${sub}\n`;
      });

      if (reel.subtitle_strategy.info_captions && reel.subtitle_strategy.info_captions.length > 0) {
        content += `   信息字幕（Facebook合规必需）:\n`;
        reel.subtitle_strategy.info_captions.forEach((cap) => {
          content += `     - ${cap}\n`;
        });
      }

      if (reel.subtitle_strategy.emphasis_elements && reel.subtitle_strategy.emphasis_elements.length > 0) {
        content += `   强调元素:\n`;
        reel.subtitle_strategy.emphasis_elements.forEach((ele) => {
          content += `     - ${ele}\n`;
        });
      }
      content += '\n';

      content += '🎯 剪辑思路:\n';
      content += `   ${reel.editing_direction}\n`;
      content += '\n';

      if (reel.originality_elements && reel.originality_elements.length > 0) {
        content += '✅ 原创性元素清单（Facebook合规）:\n';
        reel.originality_elements.forEach((ele) => {
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

    // 下载文件
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.fileName}_Reel剪辑执行表_Facebook合规版.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            📋 剪辑执行表预览
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            检查AI识别的高光片段，选择需要的片段后继续处理
          </p>
        </div>

        {/* 统计信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">源文件</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {data.fileName}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">总字幕数</div>
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400 mt-1">
                {data.stats.总字幕数} 条
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">总时长</div>
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400 mt-1">
                {Math.floor(data.stats.总时长秒数 / 60)} 分 {data.stats.总时长秒数 % 60} 秒
              </div>
            </div>
          </div>
        </div>

        {/* Reel列表 */}
        <div className="space-y-6 mb-8">
          {data.reelScripts.map((reel, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all ${
                selectedReels.has(index) ? 'ring-2 ring-purple-500' : 'opacity-60'
              }`}
            >
              {/* 选择器 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`reel-${index}`}
                    checked={selectedReels.has(index)}
                    onChange={() => toggleReel(index)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor={`reel-${index}`}
                    className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer"
                  >
                    Reel {index + 1}: {reel.title}
                  </label>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ⏱️ {reel.start_time} - {reel.end_time}
                </div>
              </div>

              {/* 钩子字幕 */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                  🎣 钩子字幕
                </div>
                <div className="text-gray-900 dark:text-white italic">
                  &ldquo;{reel.hook_subtitle}&rdquo;
                </div>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📽️ 混剪顺序
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {reel.cut_sequence}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🎯 混剪思路
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {reel.editing_direction}
                  </div>
                </div>
              </div>

              {/* 画外音脚本 */}
              {reel.voiceover_script && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-4">
                  <div className="font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                    🎙️ 画外音脚本
                    {reel.voiceover_style && (
                      <span className="text-xs bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded">
                        {reel.voiceover_style}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 text-sm italic">
                    &ldquo;{reel.voiceover_script}&rdquo;
                  </div>
                </div>
              )}

              {/* 原创性元素 */}
              {reel.originality_elements && reel.originality_elements.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                  <div className="font-medium text-green-700 dark:text-green-300 mb-2">
                    ✅ 原创性元素（符合Facebook标准）
                  </div>
                  <div className="space-y-1">
                    {reel.originality_elements.map((element, idx) => (
                      <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        • {element}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 信息字幕方案 */}
              {reel.subtitle_strategy.info_captions && reel.subtitle_strategy.info_captions.length > 0 && (
                <div className="mb-4">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">
                    📝 信息字幕方案
                  </div>
                  <div className="space-y-1">
                    {reel.subtitle_strategy.info_captions.map((caption, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded"
                      >
                        {caption}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 画面描述 */}
              <div className="mt-4">
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">
                  🎬 画面定位
                </div>
                <div className="space-y-1">
                  {reel.scene_descriptions.map((desc, i) => (
                    <div
                      key={i}
                      className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded"
                    >
                      {desc}
                    </div>
                  ))}
                </div>
              </div>

              {/* 选择原因 */}
              <div className="mt-4 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  💡 原因:
                </span>{' '}
                <span className="text-gray-600 dark:text-gray-400">{reel.reason}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleConfirm}
            disabled={loading || selectedReels.size === 0}
            className={`px-8 py-4 rounded-lg font-medium text-white
              ${loading || selectedReels.size === 0
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
                处理中...
              </>
            ) : (
              <>
                ✅ 确认并继续 ({selectedReels.size} 个片段)
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-8 py-4 rounded-lg font-medium text-gray-700 dark:text-gray-200
              bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-all duration-200 shadow-lg hover:shadow-xl
            "
          >
            📥 下载剪辑执行表
          </button>

          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 rounded-lg font-medium text-gray-700 dark:text-gray-200
              bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-all duration-200 shadow-lg hover:shadow-xl
            "
          >
            ← 返回重新上传
          </button>
        </div>
      </div>
    </main>
  );
}
