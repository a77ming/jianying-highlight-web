'use client';

import { useState, useEffect } from 'react';

interface ApiKeySettingsProps {
  onApiKeyChange?: (apiKey: string) => void;
}

export default function ApiKeySettings({ onApiKeyChange }: ApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 从localStorage加载API密钥
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    setApiKey(savedApiKey);
    if (savedApiKey && onApiKeyChange) {
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSave = () => {
    localStorage.setItem('openai_api_key', apiKey);
    if (onApiKeyChange) {
      onApiKeyChange(apiKey);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('openai_api_key');
    if (onApiKeyChange) {
      onApiKeyChange('');
    }
  };

  return (
    <>
      {/* 设置按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 shadow-lg"
        title="API设置"
      >
        <span>⚙️</span>
        <span className="text-sm">API设置</span>
      </button>

      {/* 设置弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🔑 API密钥配置
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OpenAI API密钥
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-purple-500
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500
                      transition-colors pr-12"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  您的API密钥将安全地保存在本地浏览器中，不会上传到任何服务器
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  💡 如何获取API密钥？
                </h3>
                <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                  <li>访问 OpenAI 官网或代理商网站</li>
                  <li>注册账号并获取API密钥</li>
                  <li>将API密钥粘贴到上方输入框</li>
                  <li>点击"保存"按钮</li>
                </ol>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={!apiKey}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium text-white
                    ${!apiKey
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    }
                    transition-all duration-200`}
                >
                  💾 保存
                </button>
                <button
                  onClick={handleClear}
                  className="px-6 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300
                    bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                    transition-colors"
                >
                  清除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
