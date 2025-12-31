# 应用图标说明

## 当前状态
目前应用使用默认的Electron图标。

## 如何添加自定义图标

### 选项1: 使用在线图标生成器
1. 访问 https://favicon.io 或其他图标生成网站
2. 创建一个简单的图标（建议使用电影剪辑相关的图标，如：🎬）
3. 生成不同尺寸的PNG图标
4. 将图标保存为 `public/icon.png` (推荐尺寸: 512x512px)

### 选项2: 使用现有图标
从以下资源获取免费图标：
- https://www.iconfinder.com/
- https://www.flaticon.com/
- https://iconscout.com/

搜索关键词：video editor, film, movie,剪辑,视频

### 选项3: 手动创建
1. 使用 Photoshop/GIMP/Figma 等工具
2. 创建 512x512 像素的 PNG 图标
3. 保存为 `public/icon.png`

## Windows 图标要求
- 格式: .ico
- 尺寸: 256x256 像素
- 如果你有PNG图标，electron-builder会自动转换

## macOS 图标要求
- 格式: .icns
- electron-builder会从PNG自动生成

## 快速解决方案
现在可以暂时使用默认图标，打包功能仍然正常工作。
