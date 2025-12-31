'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('正在测试API连接...\n\n');

    try {
      // 测试1: 检查API地址是否可达
      setResult((prev) => prev + '步骤1: 测试API服务器连接...\n');
      const response = await fetch('https://yunwu.ai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk-JiDUxeYDc9EnJ5Gmni1tYOvucP8o8WNmY78dvnV8lQq0wKW7',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult((prev) => prev + `✓ API服务器连接成功\n\n可用模型:\n${JSON.stringify(data, null, 2)}\n\n`);
      } else {
        setResult((prev) => prev + `✗ API服务器连接失败\n\n状态码: ${response.status}\n状态: ${response.statusText}\n\n`);
        const text = await response.text();
        setResult((prev) => prev + `响应内容:\n${text}\n\n`);
      }

      // 测试2: 简单的聊天请求
      setResult((prev) => prev + '步骤2: 测试AI聊天功能...\n');
      const chatResponse = await fetch('https://yunwu.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-JiDUxeYDc9EnJ5Gmni1tYOvucP8o8WNmY78dvnV8lQq0wKW7',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'user', content: '你好，请简单介绍一下自己' },
          ],
          max_tokens: 100,
        }),
      });

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        const message = chatData.choices[0]?.message?.content || '无响应内容';
        setResult((prev) => prev + `✓ AI聊天功能正常\n\nAI回复:\n${message}\n\n`);
      } else {
        setResult((prev) => prev + `✗ AI聊天功能失败\n\n状态码: ${chatResponse.status}\n状态: ${chatResponse.statusText}\n\n`);
        const errorText = await chatResponse.text();
        setResult((prev) => prev + `错误响应:\n${errorText}\n\n`);
      }

      setResult((prev) => prev + '测试完成！');
    } catch (error: any) {
      setResult((prev) => prev + `\n✗ 测试失败\n\n错误信息:\n${error.message}\n\n错误详情:\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          🔧 API 诊断工具
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <button
            onClick={testAPI}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium text-white
              ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              }
              transition-all duration-200`}
          >
            {loading ? '⏳ 测试中...' : '🚀 开始测试'}
          </button>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            此工具将测试以下内容：
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
            <li>API服务器连接状态 (yunwu.ai)</li>
            <li>API密钥有效性</li>
            <li>AI模型可用性</li>
            <li>基础聊天功能</li>
          </ul>
        </div>

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              📊 测试结果
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 常见问题解决方案
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <li>
              <strong>401 错误:</strong> API密钥无效或已过期，需要更新密钥
            </li>
            <li>
              <strong>429 错误:</strong> API余额不足或请求频率超限
            </li>
            <li>
              <strong>ENOTFOUND:</strong> 网络连接问题，检查网络或DNS设置
            </li>
            <li>
              <strong>超时:</strong> API服务器响应慢，可以稍后重试
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
