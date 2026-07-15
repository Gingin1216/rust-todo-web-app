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
* 任务排序（默认/优先级/截止日期/完成状态）
* 深色/浅色主题切换
* JSON/CSV 数据导出
* 智能提醒系统（后端规则引擎）
* 前端提醒面板（danger/warning/info 分级）
* 浏览器系统通知（Notification API）
* 下拉菜单 UI（导出选项/排序选项）
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
│       │   ├── todo.rs
│       │   └── reminder.rs
│       ├── reminders/
│       │   └── mod.rs
│       └── routes/
│           ├── mod.rs
│           ├── todos.rs
│           └── reminders.rs
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
Todo API V2 (MySQL) running at http://127.0.0.1:3000
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

### 获取智能提醒

```bash
curl http://127.0.0.1:3000/api/reminders
```

返回所有未完成任务的智能提醒，按严重程度排序（danger → warning → info）。

### 删除 Todo

```bash
curl -X DELETE http://127.0.0.1:3000/todos/1
```

### 切换完成状态

```bash
curl -X PATCH http://127.0.0.1:3000/todos/1/toggle
```

---

## 版本历史

| 版本  | 日期       | 新增功能 |
|-------|-----------|---------|
| v1.0  | 2026-05-28 | 基础 Todo：前后端分离、RESTful API、DOM 动态渲染、内存存储 |
| v2.0  | —         | MySQL 持久化：sqlx 连接池、自动建表、CORS 配置 |
| v3.0  | —         | 完成状态管理：completed 字段、PATCH toggle 端点、前端状态展示 |
| v4.1  | 2026-07-14 | 优先级管理：priority 字段、标签式选择器（红/橙/绿）、暗色主题适配 |
| v4.2  | 2026-07-14 | 到期日期 + 搜索 + 筛选 + 统计面板：due_date 字段、日期自动格式化、实时搜索、状态筛选、任务统计 |
| v4.3  | 2026-07-14 | 深色/浅色主题切换 + JSON/CSV 数据导出 |
| v5.0  | 2026-07-15 | 智能提醒后端（Rust Axum 规则引擎） |
| v5.1  | 2026-07-15 | 前端提醒面板（danger/warning/info 分级展示） |
| v5.2  | 2026-07-15 | 浏览器系统通知（Notification API + sessionStorage 防重复） |

## 后续计划

* 用户登录系统
* JWT 身份认证
* Docker 部署
* 项目工程化整理
