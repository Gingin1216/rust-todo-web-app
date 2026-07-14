# Rust Todo Web App

## 项目简介

本项目是一个基于 Rust 开发的 Todo Web 应用，采用前后端分离架构，实现任务的添加、查询、修改与删除等功能。

项目主要用于学习：

* Rust Web 后端开发
* REST API 设计
* MySQL 数据持久化
* 前后端分离开发流程
* Git 版本管理

---

## 技术栈

### 后端

* Rust
* axum
* tokio
* serde
* sqlx

### 前端

* HTML
* CSS
* JavaScript

### 数据库

* MySQL 8.x

---

## 当前功能

已实现：

* Todo CRUD
* MySQL 持久化
* completed 状态管理
* 状态切换功能
* 前端状态展示优化
* 前后端通信
* CORS 配置
* priority 优先级管理
 * 搜索任务
 * 状态筛选（全部/未完成/已完成）
 * 任务统计面板
 * 到期日期管理
 * 日期自动格式化和验证
* Git 版本管理

---

## 项目结构

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

## MySQL 初始化

### 1. 创建数据库

打开 MySQL Workbench 执行：

```sql
CREATE DATABASE todo_db;
```

---

### 2. 配置环境变量

复制：

```text
backend/.env.example
```

为：

```text
backend/.env
```

填写：

```env
DATABASE_URL=mysql://root:你的密码@127.0.0.1:3306/todo_db
```

---

### 3. 初始化数据表

执行：

```sql
USE todo_db;
```

然后运行 `backend/sql/init.sql`。

---

## 项目运行

### 启动后端

```bash
cd backend
cargo run
```

运行成功后：

```text
Todo API V4.2 running at http://127.0.0.1:3000
```

---

### 启动前端

使用 VS Code Live Server 打开：

```text
frontend/index.html
```

默认地址：

```text
http://127.0.0.1:5500
```

---

## API 测试

### 获取 Todo

```bash
curl http://127.0.0.1:3000/todos
```

### 添加 Todo

```bash
curl -X POST http://127.0.0.1:3000/todos ^
-H "Content-Type: application/json" ^
-d "{\"title\":\"学习 Rust\"}"
```

priority 可选，默认 2（中优先级）：

```bash
curl -X POST http://127.0.0.1:3000/todos ^
-H "Content-Type: application/json" ^
-d "{\"title\":\"学习 Rust\", \"priority\":1}"
```

-d "{\"title\":\"学习 Rust\", \"priority\":1}"

due_date 可选，格式 YYYY-MM-DD：

```bash
curl -X POST http://127.0.0.1:3000/todos ^
-H "Content-Type: application/json" ^
-d "{\"title\":\"学习 Rust\", \"due_date\":\"2026-08-01\"}"
```

### 修改 Todo

```bash
curl -X PUT http://127.0.0.1:3000/todos/1 ^
-H "Content-Type: application/json" ^
-d "{\"title\":\"学习 MySQL\"}"
```

priority 可选，传值则一并更新：

```bash
curl -X PUT http://127.0.0.1:3000/todos/1 ^
-H "Content-Type: application/json" ^
-d "{\"title\":\"学习 MySQL\", \"priority\":3}"

due_date 可选，格式 YYYY-MM-DD，传值则一并更新：

```bash
curl -X PUT http://127.0.0.1:3000/todos/1 ^
-H "Content-Type: application/json" ^
-d "{\"title\":\"学习 MySQL\", \"priority\":3, \"due_date\":\"2026-08-01\"}"
```

### 搜索与筛选

搜索和筛选由前端实现，无需调用后端 API。

* 搜索框根据标题实时过滤任务
* 筛选按钮切换：全部 / 未完成 / 已完成
```

-d "{\"title\":\"学习 MySQL\", \"priority\":3}"

due_date 可选，格式 YYYY-MM-DD，传值则一并更新：

```bash
curl -X PUT http://127.0.0.1:3000/todos/1 ^
-H "Content-Type: application/json" ^
-d "{\"title\":\"学习 MySQL\", \"priority\":3, \"due_date\":\"2026-08-01\"}"
```

### 搜索与筛选

搜索和筛选由前端实现，无需调用后端 API。

* 搜索框根据标题实时过滤任务
* 筛选按钮切换：全部 / 未完成 / 已完成

### 删除 Todo

```bash
curl -X DELETE http://127.0.0.1:3000/todos/1
```

### 切换完成状态

```bash
curl -X PATCH http://127.0.0.1:3000/todos/1/toggle
```

---

## 当前版本

### V3

已完成：

* Todo CRUD
* MySQL 持久化
* completed 状态管理
* 状态切换功能
* 前端状态展示优化
* 前后端联调
* Git 版本管理

---

## 后续计划

后续版本计划实现：

* 用户登录系统
* JWT 身份认证
* 用户 Todo 数据隔离
* Docker 部署
* 项目工程化整理

---

### V4.1 — Todo 优先级管理

发布日期：2026-07-14

新增功能：

* 数据库新增 priority 字段（INT, NOT NULL, DEFAULT 2）
* 优先级取值范围：1=高, 2=中, 3=低
* GET /todos 返回数据包含 priority
* POST /todos 创建时支持 priority 参数
* PUT /todos/:id 更新时支持 priority 参数
* 前端新增优先级选择器（高/中/低 标签式按钮）
* 任务列表显示优先级标签（红/橙/绿）
* 编辑模式支持修改优先级

技术决策：

* 使用 i32 类型存储优先级，便于后续扩展
* 默认优先级为 2（中）
* 前端使用标签式按钮组替代下拉框，提升暗色主题交互体验

---

### V4.2 — 搜索/筛选/统计/到期日期

发布日期：2026-07-14

新增功能：

* 搜索框根据标题实时过滤任务
* 状态筛选（全部 / 未完成 / 已完成）
* 任务统计面板（总任务 / 未完成 / 已完成）
* 数据库新增 due_date 字段（DATE, DEFAULT NULL）
* GET /todos 返回数据包含 due_date
* POST /todos 创建时支持 due_date 参数
* PUT /todos/:id 更新时支持 due_date 参数
* 前端到期日期输入（自动格式化 YYYY-MM-DD）
* 列表显示两行：截止日期 + 动态剩余时间（逾期/今天/明天/剩余）
* 编辑模式支持修改到期日期
* 日期输入自动格式化和有效性验证

技术决策：

* 使用 chrono::NaiveDate 类型存储，与 MySQL DATE 直接映射
* 前端使用 type="text" + 自动格式化替代原生 date picker，保持暗色主题一致
* 列表日期显示使用 "截止 YYYY-MM-DD + 状态行" 两行布局
* 编辑模式纵向 flex 布局，优先级选择器 → 日期输入 → 标题+按钮
* PUT 更新使用 COALESCE 保证未传入的字段保持原值不变
