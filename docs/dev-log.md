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

---

## 2026-07-14 — V4.1 Todo 优先级管理

### 完成内容

* 实现 Todo 优先级功能
* 后端 priority 字段（INT, DEFAULT 2）
* 优先级取值 1=高 / 2=中 / 3=低
* GET /todos 返回 priority
* POST /todos 创建时支持 priority 参数
* PUT /todos/:id 更新时支持 priority 参数
* 前端新增标签式优先级选择器（高/中/低 按钮组）
* 任务列表显示优先级彩色标签（红/橙/绿）
* 编辑模式支持修改优先级

### 技术决策

* 优先级使用 i32 类型，便于扩展
* 默认优先级为 2（中）
* 前端使用标签式按钮组（.priority-group）替代原生下拉框，适配暗色主题
* 编辑模式使用纵向布局（flex-direction: column），优先级选择器位于输入框上方

### 修改文件

后端：
* backend/sql/init.sql — 建表 DDL 增加 priority INT NOT NULL DEFAULT 2
* backend/src/db/mod.rs — 自动建表增加 priority 字段
* backend/src/models/todo.rs — Todo 增加 priority: i32；CreateTodo 增加 priority: Option<i32>
* backend/src/routes/todos.rs — 所有 SQL 查询包含 priority；新增 DEFAULT_PRIORITY / is_valid_priority()

前端：
* frontend/index.html — 增加优先级按钮组（高/中/低）
* frontend/app.js — 创建/更新/编辑模式支持 priority；事件委托切换选中状态
* frontend/styles.css — 暗色主题优先级按钮组样式；红/橙/绿三色优先级标签

### 遇到的问题

1. 前端下拉框 `<select>` 在暗色主题下文字不清（白底白字）
2. 编辑模式需要额外处理优先级，flex 纵向布局适配

### 解决方案

* 将下拉框改为标签式按钮组，直接控制背景色和文字颜色
* 编辑模式下 li 切换为 flex-direction: column，行内包一层 div 保持输入框+按钮并排
