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

---

## 2026-07-14 — V4.2 搜索/筛选/统计/到期日期

### 完成内容

* 后端新增 due_date 字段（DATE, DEFAULT NULL）
* Rust Todo 模型增加 due_date: Option<NaiveDate>
* GET /todos 返回 due_date
* POST /todos 创建时支持 due_date 参数
* PUT /todos/:id 更新时支持 due_date 参数（COALESCE 保持原值）
* 前端搜索框实时过滤（标题匹配，大小写不敏感）
* 前端状态筛选（全部 / 未完成 / 已完成）
* 前端统计面板（总任务 / 未完成 / 已完成）
* 列表到期日期显示两行：截止 YYYY-MM-DD + 动态剩余时间
* 编辑模式支持修改优先级和到期日期
* 日期输入自动格式化和有效性验证
* 创建任务日期输入框默认设为今天

### 技术决策

* 前端日期输入使用 type="text" + 自动格式化，替代原生 date picker，统一暗色主题风格
* chrono::NaiveDate 与 MySQL DATE 直接映射，序列化为 "YYYY-MM-DD"
* 搜索和筛选纯前端实现，不增加后端 API 负担
* 统计面板在每次 applyFilters() 时根据 allTodos 实时计算
* PUT 更新使用 COALESCE 保证未传入的字段保持原值不变

### 修改文件

后端：
* backend/Cargo.toml — 新增 chrono 依赖，sqlx 启用 chrono feature
* backend/sql/init.sql — 建表 DDL 增加 due_date DATE DEFAULT NULL，INDEX idx_due_date
* backend/src/db/mod.rs — 自动建表增加 due_date 字段
* backend/src/models/todo.rs — Todo 增加 due_date: Option<NaiveDate>；CreateTodo 增加 due_date: Option<NaiveDate>
* backend/src/routes/todos.rs — 所有 SQL 查询包含 due_date；PUT 改用 COALESCE 统一处理

前端：
* frontend/index.html — 增加截止日期输入、搜索框、筛选按钮、统计面板
* frontend/app.js — 搜索/筛选/统计/日期创建/编辑/显示/格式化/验证
* frontend/styles.css — 暗色主题搜索框/筛选按钮/日期输入/到期标签/统计面板样式

### 遇到的问题

1. HTML 被意外覆盖，丢失了搜索/筛选/日期输入部分
2. 编辑模式日期输入需要与 create 模式样式一致
3. 日期输入从 type="date" 改为 type="text" 后需要手动格式化

### 解决方案

* 根据 app.js 和 styles.css 的完整代码重建 index.html
* 编辑模式使用相同的 .due-date-input 类 + edit-date-input 调整边距
* 实现 formatDateInput() 自动插入连字符，isValidDate() 验证日期有效性
