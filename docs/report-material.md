# Rust 全栈 Todo 项目实验报告（V4.2）

## 一、项目名称

Rust 全栈 Todo Web 应用 — 基于 Axum + MySQL 的前后端分离任务管理系统

## 二、团队成员与分工

（无团队成员信息，本报告为独立完成）

## 三、项目背景与目标

### 3.1 项目背景

Todo（待办事项）管理是 Web 开发领域的经典入门项目，涵盖增删改查（CRUD）、数据持久化、前后端交互等核心概念。选择该项目作为课程实践，能够在有限复杂度内完整覆盖现代全栈 Web 开发的各个环节。

### 3.2 解决问题

* 内存存储导致服务重启后数据丢失
* 缺乏任务状态管理（完成/未完成）
* 缺乏任务优先级区分
* 缺乏到期日期追踪与逾期提醒
* 缺乏任务搜索与筛选功能

### 3.3 实现目标

* 基于 Rust 构建高性能 REST API 后端
* 基于 MySQL 实现数据持久化
* 基于纯前端（HTML + CSS + JavaScript）构建交互界面，无需前端框架依赖
* 实现完整的任务生命周期管理：创建、查看、编辑、删除、完成切换
* 实现优先级管理（高/中/低三级）
* 实现到期日期管理（含自动格式化和有效性验证）
* 实现任务搜索与状态筛选
* 实现任务统计面板

## 四、系统设计与实现思路

### 4.1 整体架构

系统采用前后端分离架构：

```
┌─────────────────────┐     HTTP + JSON     ┌────────────────────┐
│   前端（浏览器）      │  ────────────────→   │    Rust Axum 后端   │
│  HTML + CSS + JS    │  ←────────────────   │    127.0.0.1:3000  │
│  Live Server: 5500  │                      │                    │
└─────────────────────┘                      └────────┬───────────┘
                                                       │ sqlx
                                                       ↓
                                               ┌────────────────┐
                                               │   MySQL 8.x     │
                                               │   todo_db       │
                                               └────────────────┘
```

前端通过 `fetch` API 发送 HTTP 请求，后端接收后通过 `sqlx` 与 MySQL 交互，返回 JSON 格式响应。CORS 中间件允许跨域请求。

### 4.2 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端 | HTML5 / CSS3 / JavaScript (ES6+) | 页面结构与交互逻辑 |
| 后端框架 | Axum 0.8 | HTTP 路由与请求处理 |
| 异步运行时 | Tokio | 异步任务调度 |
| 序列化 | Serde + serde_json | JSON 编解码 |
| 数据库驱动 | sqlx 0.8 | 异步 MySQL 连接与查询 |
| 数据库 | MySQL 8.x | 数据持久化存储 |
| 依赖管理 | Cargo | Rust 包管理与构建 |

### 4.3 主要模块

**后端模块（backend/src/）：**

| 模块 | 职责 |
|------|------|
| `main.rs` | 程序入口：加载环境变量、创建连接池、初始化数据库、组装 CORS + Router、启动 HTTP 服务 |
| `db/mod.rs` | MySQL 连接池创建（`create_pool`）；自动建表（`init_schema`） |
| `models/mod.rs` | 模块导出 |
| `models/todo.rs` | 定义 `Todo`（响应体）和 `CreateTodo`（请求体）两个结构体 |
| `routes/mod.rs` | 路由注册，注入 `MySqlPool` |
| `routes/todos.rs` | 5 个 REST handler：获取全部、创建、更新、删除、切换完成状态 |

**前端模块（frontend/）：**

| 文件 | 职责 |
|------|------|
| `index.html` | 页面骨架：标题区、统计面板、添加任务区、优先级选择、日期输入、搜索框、筛选按钮、任务列表 |
| `styles.css` | 暗色主题样式：毛玻璃卡片、按钮组、优先级标签、日期输入、搜索框、筛选按钮、统计面板、响应式适配 |
| `app.js` | 核心逻辑：fetch 封装、CRUD 操作、DOM 渲染、编辑模式、搜索筛选、日期格式化与验证 |

### 4.4 Todo 数据结构

**数据库表（todos）：**

```sql
CREATE TABLE todos (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    completed   BOOLEAN NOT NULL DEFAULT FALSE,
    priority    INT NOT NULL DEFAULT 2,
    due_date    DATE DEFAULT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB;
```

**Rust 结构体：**

```rust
pub struct Todo {
    pub id: u64,
    pub title: String,
    pub completed: bool,
    pub priority: i32,              // 1=高, 2=中, 3=低
    pub due_date: Option<NaiveDate>, // YYYY-MM-DD 或 null
}

pub struct CreateTodo {
    pub title: String,
    pub priority: Option<i32>,
    pub due_date: Option<NaiveDate>,
}
```

### 4.5 REST API 设计

| 方法 | 路径 | 功能 | 请求体示例 |
|------|------|------|-----------|
| GET | `/todos` | 获取全部任务（按 id 升序） | — |
| POST | `/todos` | 创建任务 | `{ "title": "...", "priority": 2, "due_date": "2026-08-01" }` |
| PUT | `/todos/{id}` | 更新任务（COALESCE 保持未传字段不变） | `{ "title": "...", "priority": 1 }` |
| DELETE | `/todos/{id}` | 删除任务 | — |
| PATCH | `/todos/{id}/toggle` | 切换 completed 状态 | — |

### 4.6 核心数据流

```
用户操作 → 前端 JS 事件 → fetch 发送 HTTP 请求
    → Axum Router 匹配 → Handler 反序列化请求体
    → sqlx 执行 SQL → MySQL 读写
    → 返回 JSON 响应 → 前端解析 → DOM 更新
```

以"创建任务"为例的完整流程：

1. 用户输入标题、选择优先级、设置截止日期、点击"添加"按钮
2. JS 获取表单数据 → `handleAddTodo()` → 验证日期有效性
3. `fetch POST /todos` 发送 `{ title, priority, due_date }` 到后端
4. Axum `create_todo` handler 反序列化 → 优先级默认值处理 → 优先级范围验证（1-3）
5. `sqlx::query("INSERT INTO todos (title, priority, due_date) VALUES (?, ?, ?)")` 执行
6. MySQL 写入，返回自增 id
7. 后端构造 Todo 结构体 → 序列化为 JSON → 返回 `201 Created`
8. 前端收到响应 → `loadTodos()` → `applyFilters()` → `renderTodos()` → DOM 更新

## 五、实验结果

### 5.1 当前版本功能清单（V4.2）

| 功能 | 状态 | 说明 |
|------|------|------|
| Todo 基础 CRUD | ✅ 已完成 | 创建、查询全部、更新标题/优先级/日期、删除 |
| MySQL 持久化 | ✅ 已完成 | sqlx 连接池 + CREATE TABLE IF NOT EXISTS 自动建表 |
| 完成状态管理 | ✅ 已完成 | PATCH /todos/:id/toggle 切换 + 前端删除线/透明度 |
| 优先级管理 | ✅ 已完成 | 1=高(红) / 2=中(橙) / 3=低(绿)，标签式按钮组 |
| 到期日期管理 | ✅ 已完成 | type="text" + 自动格式化 YYYY-MM-DD + 有效性验证 |
| 到期日期列表显示 | ✅ 已完成 | 两行：`截止 YYYY-MM-DD` + `已逾期 X 天 / 今天截止 / 明天截止 / 剩余 X 天` |
| 搜索 | ✅ 已完成 | 输入框实时过滤标题，大小写不敏感 |
| 状态筛选 | ✅ 已完成 | 全部 / 未完成 / 已完成，按钮切换 |
| 统计面板 | ✅ 已完成 | 总任务 / 未完成 / 已完成，实时更新 |
| 编辑模式 | ✅ 已完成 | 纵向 flex 布局：优先级选择 → 日期输入 → 标题输入 + 保存取消 |
| 暗色主题 | ✅ 已完成 | CSS variables + 毛玻璃效果 + 深色背景 |

### 5.2 分功能展示

#### 5.2.1 任务创建

```
输入框: [输入待办内容，按 Enter 添加…]
优先级: [高] [中] [低]     ← 默认"中"
截止日期: [YYYY-MM-DD]      ← 默认今天，自动格式化
添加按钮: [添加]
```

创建时支持：
* 标题输入（必填）
* 优先级选择（可选，默认 2）
* 截止日期输入（可选，默认今天，自动格式化 2026-08-01 → 2026-08-01）
* 无效日期提示

#### 5.2.2 任务列表

```
[中] 完成 Rust 项目                                    完成  编辑  删除
 截止 2026-08-01
 已逾期 3 天
```

每项任务显示：
* 优先级标签（红/橙/绿三色）
* 标题文字
* 到期日期（两行：日期 + 动态剩余时间）
* 操作按钮（完成 / 编辑 / 删除）

#### 5.2.3 搜索与筛选

```
搜索框: [搜索任务...]         ← 实时过滤，无专用搜索按钮
筛选: [全部] [未完成] [已完成]  ← 点击切换
统计: 总任务 5 · 未完成 3 · 已完成 2
```

搜索和筛选均为纯前端实现，可组合使用（AND 逻辑）。

#### 5.2.4 编辑模式

```
优先级: [高] [中] [低]       ← 回显当前优先级
截止日期: [YYYY-MM-DD]       ← 回显已有日期
输入框: [完成 Rust 项目]      ← 可修改标题
[保存] [取消]                ← 保存触发 PUT 请求
```

编辑模式采用纵向 flex 布局，支持同时修改优先级、截止日期和标题。

### 5.3 截图位置

（以下为预留截图位置，可将运行截图放入 `docs/screenshot/` 目录后引用）

* 图 1：任务创建界面 — `docs/screenshot/v4.2-create.png`
* 图 2：任务列表展示 — `docs/screenshot/v4.2-list.png`
* 图 3：搜索与筛选 — `docs/screenshot/v4.2-search-filter.png`
* 图 4：编辑模式 — `docs/screenshot/v4.2-edit.png`

## 六、开源项目参考说明

本项目在开发过程中参考了以下开源项目的官方文档和技术资料：

* **Rust 编程语言** — 官方文档与标准库参考（https://doc.rust-lang.org/）
* **Axum Web 框架** — 官方 crate 文档与示例（https://docs.rs/axum/）
* **Tokio 异步运行时** — 官方指南与 API 参考（https://tokio.rs/）
* **sqlx 数据库驱动** — 官方 README 与示例（https://github.com/launchbadge/sqlx）
* **Serde 序列化框架** — 官方文档（https://serde.rs/）
* **MySQL 8.0** — 官方参考手册（https://dev.mysql.com/doc/refman/8.0/en/）
* **MDN Web Docs** — JavaScript fetch API 与 DOM 操作参考（https://developer.mozilla.org/）

以上参考均限于官方公开文档，未引用未授权第三方内容。
