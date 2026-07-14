# Rust 全栈 Todo 项目报告（V1 → V4）

## 一、项目简介

### 项目名称

Rust 全栈 Todo 应用（前后端分离）

### 项目目标

本项目旨在学习 Rust Web 开发与现代前后端分离架构，实现一个具有基础 CRUD 功能的 Todo 管理系统。

项目重点包括：

* Rust Web 后端开发
* RESTful API 设计
* 前后端分离架构
* JavaScript 动态页面开发
* HTTP + JSON 通信
* 异步请求处理

---

## 二、技术栈

### 前端技术栈

| 技术         | 作用      |
| ---------- | ------- |
| HTML       | 页面结构    |
| CSS        | 页面样式与布局 |
| JavaScript | 页面逻辑与交互 |
| DOM API    | 动态更新网页  |
| fetch API  | 与后端通信   |

---

### 后端技术栈

| 技术    | 作用            |
| ----- | ------------- |
| Rust  | 后端开发语言        |
| Axum  | Rust Web 框架   |
| Tokio | 异步运行时         |
| Serde | JSON 序列化与反序列化 |

---

### 通信协议

| 技术       | 作用     |
| -------- | ------ |
| HTTP     | 前后端通信  |
| REST API | 接口设计规范 |
| JSON     | 数据交换格式 |

---

## 三、系统架构

```text
浏览器前端
HTML + CSS + JavaScript
        ↓ fetch 请求
Rust Axum 后端 API
        ↓ JSON 数据
Todo 数据（Vec / 数据库）
```

项目采用前后端分离架构：

* 前端负责页面展示与用户交互
* 后端负责 API 与数据处理
* 前后端通过 HTTP + JSON 通信

---

## 四、项目结构

```text
to do list/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── Cargo.toml
│   ├── sql/
│   │   └── init.sql
│   └── src/
│       ├── main.rs
│       ├── db/
│       │   └── mod.rs
│       ├── models/
│       │   ├── mod.rs
│       │   └── todo.rs
│       └── routes/
│           ├── mod.rs
│           └── todos.rs
└── docs/
```

---

## 五、各文件功能说明

### frontend/index.html

页面结构文件。

主要负责：

* Todo 输入框
* 添加按钮
* Todo 列表区域
* 页面基础结构

---

### frontend/styles.css

页面样式文件。

主要负责：

* 页面布局
* 背景与颜色
* 按钮样式
* 响应式显示
* Todo 列表美化

---

### frontend/app.js

前端核心逻辑文件。

主要负责：

* fetch 请求
* Todo CRUD 操作
* DOM 动态更新
* 事件监听
* 编辑模式切换
* 页面状态提示

核心函数包括：

| 函数            | 功能         |
| ------------- | ---------- |
| loadTodos()   | 加载 Todo 列表 |
| addTodo()     | 添加 Todo    |
| updateTodo()  | 修改 Todo    |
| removeTodo()  | 删除 Todo    |
| renderTodos() | 渲染页面       |
| startEdit()   | 编辑模式       |

---

### backend/src/main.rs

后端入口文件。

主要负责：

* 启动 Axum Web 服务
* 监听 127.0.0.1:3000
* 加载 Router

---

### backend/src/routes/mod.rs

路由管理文件。

主要负责：

* 注册 API 路由
* URL 与 Handler 映射

例如：

```rust
GET    /todos
POST   /todos
PUT    /todos/:id
DELETE /todos/:id
```

---

### backend/src/routes/todos.rs

Todo 业务逻辑文件。

主要负责：

* 获取 Todo
* 创建 Todo
* 更新 Todo
* 删除 Todo
* JSON 数据处理

---

### backend/src/db/mod.rs

数据库连接与初始化模块。

主要负责：

* 从 DATABASE_URL 创建 MySQL 连接池
* 启动时自动创建 todos 表（CREATE TABLE IF NOT EXISTS）

---

### backend/src/models/todo.rs

数据模型定义文件。

主要负责：

* 定义 Todo 结构体（与数据库表字段一一对应）
* 定义 CreateTodo 请求体结构体
* 使用 serde 实现 JSON 序列化/反序列化
* 使用 sqlx::FromRow 实现数据库行映射

---

## 六、核心功能实现

### 1. Todo 加载流程

页面打开后：

1. JavaScript 调用 `loadTodos()`
2. fetch 发送 `GET /todos`
3. Rust Axum 返回 JSON 数据
4. 前端调用 `renderTodos()`
5. 动态生成 Todo DOM 列表

---

### 2. Todo 添加流程

用户输入 Todo 后：

1. form 提交事件触发
2. JavaScript 获取输入内容
3. fetch 发送 `POST /todos`
4. 后端创建 Todo
5. 前端重新加载列表

---

### 3. Todo 编辑流程

点击“编辑”按钮后：

1. JavaScript 动态替换 DOM
2. 显示 input 与保存按钮
3. fetch 发送 `PUT /todos/:id`
4. 后端更新 Todo
5. 前端刷新页面

---

### 4. Todo 删除流程

点击“删除”按钮后：

1. fetch 发送 `DELETE /todos/:id`
2. 后端删除 Todo
3. 前端重新获取列表
4. 页面更新

---

## 七、REST API 设计

| 方法     | 路径         | 功能         |
| ------ | ---------- | ---------- |
| GET    | /todos     | 获取 Todo 列表 |
| POST   | /todos     | 创建 Todo    |
| PUT    | /todos/:id | 更新 Todo    |
| DELETE | /todos/:id | 删除 Todo    |
| PATCH  | /todos/:id/toggle | 切换完成状态 |

---

## 八、当前版本特点（V1）

### 已实现功能

* 前后端分离架构
* RESTful API
* Todo CRUD
* DOM 动态渲染
* fetch 异步请求
* JSON 数据通信
* 错误状态提示
* 编辑模式切换

---

### 当前版本限制

* 数据暂存在内存中
* 服务重启后数据丢失
* 暂无用户系统
* Todo 仅包含 title 属性
* 未接入数据库

---

## 九、后续版本更新方向

---

## V2：数据库持久化

### 目标

解决服务重启后数据丢失问题。

### 升级方向

接入数据库：

* SQLite
* PostgreSQL

### Rust 技术方向

* sqlx
* sea-orm

---

## V3：用户系统（可选）

### 功能

* 用户注册
* 用户登录
* JWT Token 认证

### 目标

实现多用户 Todo 管理。

---

## V4：Todo 状态管理（推荐完成版）

### 新增字段

```rust
completed: bool
created_at: DateTime
priority: Option<String>
```

### 新增功能

* Todo 完成状态
* 优先级管理
* 创建时间显示
* 已完成 Todo 样式变化

### 前端更新

* Checkbox 勾选状态
* 状态筛选
* 不同优先级颜色区分

### 后端更新

新增状态更新接口：

```text
PATCH /todos/:id/toggle
```

---

## V4.1 — Todo 优先级管理

### 新增字段

```rust
priority: i32      // 1=高, 2=中, 3=低, DEFAULT 2
```

### 实现内容

* 数据库新增 priority 字段
* 前端标签式优先级选择器（暗色主题按钮组）
* 列表显示优先级颜色标签（红/橙/绿）
* 编辑模式支持修改优先级

---

## V4.2 — 搜索/筛选/统计/到期日期

### 新增字段

```rust
due_date: Option<NaiveDate>   // MySQL DATE, DEFAULT NULL
```

### 实现内容

* 后端 due_date 字段（chrono::NaiveDate）
* 前端截止日期输入（type="text" + 自动格式化 YYYY-MM-DD）
* 搜索框实时过滤（标题匹配，大小写不敏感）
* 状态筛选（全部 / 未完成 / 已完成）
* 统计面板（总任务 / 未完成 / 已完成）
* 列表到期日期两行显示：截止 YYYY-MM-DD + 动态剩余时间
* 日期输入自动格式化和有效性验证
* COALESCE 更新策略：未传字段保持原值不变

---

## 十、项目总结

本项目实现了一个完整的 Rust 全栈 Web 应用。

项目完成了：

```text
前端 UI
→ 用户事件
→ fetch 请求
→ HTTP 通信
→ Rust Axum API
→ JSON 数据处理
→ 返回前端
→ DOM 更新
```

通过本项目，学习并实践了：

* Rust Web 开发
* Axum 路由系统
* RESTful API
* JavaScript DOM 操作
* fetch 网络请求
* 前后端分离架构
* HTTP + JSON 通信
* 异步编程

虽然当前版本规模较小，但已经具备完整的现代 Web 应用核心结构，可作为后续扩展与学习的基础。
