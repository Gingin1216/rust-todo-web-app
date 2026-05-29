# Todo Web App 开发日志

## 2026-05-28

### 完成内容

* 完成 Rust 后端搭建
* 使用 axum 创建 REST API
* 完成前端页面
* 实现前后端 fetch 通信
* 成功运行 Todo Web App
* 配置 CORS
* 使用 Git 初始化项目
* 完成 v1.0 提交

### 遇到的问题

1. cargo 下载 crates 超时
2. Windows PowerShell 路径包含空格
3. VS Code Live Server 未正确启动

### 解决方案

* 配置 cargo 镜像源
* 使用双引号包裹路径
* 安装 Live Server 插件并使用 Go Live

### 当前项目状态

已实现：

* 添加 Todo
* 获取 Todo 列表
* 前后端通信

待实现：

* 删除功能
* 完成状态切换
* SQLite 持久化
