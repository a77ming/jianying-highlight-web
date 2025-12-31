/** @type {import('next').NextConfig} */
const nextConfig = {
  // 根据环境变量选择输出模式
  // STANDALONE=true 时使用standalone模式（本地服务器）
  // 否则使用export模式（静态导出，用于Electron）
  output: process.env.STANDALONE === 'true' ? 'standalone' : 'export',
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // 图片优化配置（静态导出需要）
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
