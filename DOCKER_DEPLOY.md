# Docker 部署指南

## 功能说明

本项目包含完整的 AI 高光剪辑功能：
1. 上传 SRT 字幕文件，AI 自动识别高光片段
2. 选择需要的片段，上传视频
3. 一键切合并成高光视频集锦
4. 下载成品视频和剪辑执行表

## 一键启动

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

打开浏览器访问：http://localhost:3000

## 目录说明

```
jianying-highlight-web/
├── uploads/    # 上传的视频文件（临时）
├── outputs/    # 处理完成的视频（可下载）
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `docker-compose up -d` | 后台启动 |
| `docker-compose down` | 停止服务 |
| `docker-compose restart` | 重启服务 |
| `docker-compose logs -f` | 查看日志 |

## 修改端口

编辑 `docker-compose.yml` 第 10 行：
```yaml
ports:
  - "8080:3000"  # 改为 8080 端口
```
