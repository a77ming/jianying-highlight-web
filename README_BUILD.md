# AI高光剪辑工具 - 打包说明

## 📦 打包成桌面应用

本项目已经配置好Electron，可以打包成独立的exe/app/dmg文件。

## 打包步骤

### Windows系统
```bash
npm run electron:build:win
```

### macOS系统
```bash
npm run electron:build:mac
```

### Linux系统
```bash
npm run electron:build:linux
```

### 打包所有平台
```bash
npm run electron:build
```

## 打包后文件位置

打包完成后，安装包会保存在 `dist/` 目录中：

- **Windows**: `dist/AI高光剪辑工具 Setup 1.0.0.exe` (NSIS安装程序)
- **macOS**: `dist/AI高光剪辑工具-1.0.0.dmg` (DMG安装包)
- **Linux**: `dist/AI高光剪辑工具-1.0.0.AppImage` (可执行文件)

## 分发给其他用户

### Windows用户
1. 将 `dist/AI高光剪辑工具 Setup 1.0.0.exe` 发送给用户
2. 用户双击exe文件进行安装
3. 安装后桌面会生成快捷方式
4. 双击快捷方式启动应用

### macOS用户
1. 将 `dist/AI高光剪辑工具-1.0.0.dmg` 发送给用户
2. 用户双击dmg文件打开
3. 将应用拖到应用程序文件夹
4. 从启动台或应用程序文件夹启动

### Linux用户
1. 将 `dist/AI高光剪辑工具-1.0.0.AppImage` 发送给用户
2. 给文件添加执行权限：`chmod +x AI高光剪辑工具-1.0.0.AppImage`
3. 双击运行

## 用户首次使用配置

用户首次运行应用时，需要：

1. 点击右上角"⚙️ API设置"按钮
2. 输入自己的OpenAI API密钥
3. 点击"保存"按钮
4. 开始使用！

API密钥会安全地保存在本地，不会上传。

## API密钥获取指引

用户需要自己获取OpenAI API密钥：

### 官方渠道
1. 访问 https://platform.openai.com/
2. 注册账号
3. 在API keys页面创建密钥
4. 充值使用

### 国内代理商
如果用户无法访问OpenAI官方，可以使用国内代理商：
- yunwu.ai
- 其他OpenAI API代理服务

## 应用特点

✅ 无需安装Node.js或任何开发环境
✅ 双击即用，像普通软件一样
✅ 所有数据保存在本地
✅ 支持Windows、macOS、Linux
✅ 体积小，启动快
✅ 离线工作（只需要联网调用AI API）

## 注意事项

1. **API费用**: 用户需要自己承担OpenAI API费用
2. **网络要求**: 应用需要联网才能使用AI功能
3. **数据隐私**: 所有数据都在本地处理，不会上传到我们的服务器
4. **API密钥安全**: 提醒用户妥善保管API密钥，不要泄露

## 常见问题

### Q: 打包失败怎么办？
A: 确保：
- 已成功运行 `npm run build`
- electron目录下有main.js文件
- 网络连接正常（首次打包需要下载Electron二进制文件）

### Q: 应用打不开？
A: 检查：
- 杀毒软件是否拦截
- 是否有足够的权限
- 查看错误日志

### Q: 如何自定义应用图标？
A: 参考 `ICON_README.md` 文件

## 更新应用

当你修改了代码后：

1. 重新构建：`npm run build`
2. 重新打包：`npm run electron:build:win`
3. 分发新的安装包

## 技术支持

如有问题，请检查：
1. Node.js版本 >= 18
2. npm依赖是否完整安装
3. 网络连接是否正常
