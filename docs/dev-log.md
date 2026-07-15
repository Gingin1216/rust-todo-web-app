# Todo Web App 开发日志

## v1.0 — 基础 Todo

日期：2026-05-28

### 完成内容

* 使用 Axum 搭建 Rust 后端 REST API
* 基于 HTML + CSS + JavaScript 构建前端页面
* 实现前后端分离架构，通过 fetch + JSON 通信
* 数据暂存于后端内存 Vec，支持基本 CRUD
* 配置 CORS 中间件允许跨域请求
* 使用 Git 初始化项目并完成 v1.0 提交

### 技术实现

* 后端：Axum Router + Tokio 异步运行时 + Serde 序列化
* 前端：DOM API 动态渲染 + fetch 网络请求
* 路由：GET/POST/PUT/DELETE /todos

### 遇到的问题

1. cargo 下载 crates 超时（GFW 网络限制）
2. Windows PowerShell 路径包含空格导致命令执行失败
3. VS Code Live Server 扩展未正确识别项目

### 解决方案

* 配置 `$HOME\.cargo\config.toml` 使用 Rust 镜像源（中科大/清华）
* 路径使用双引号包裹或在 PowerShell 中使用反引号转义空格
* 重新安装 Live Server 扩展，通过右键 "Open with Live Server" 启动

---

## v2.0 — MySQL 持久化

日期：基于 git tag v2.0（在 v1.0 之后完成）

### 完成内容

* 引入 sqlx 替代内存 Vec 存储，实现 MySQL 数据持久化
* 后端模块化重构：拆分为 db/（连接池）、models/（结构体）、routes/（路由）三层
* 添加启动时自动建表（CREATE TABLE IF NOT EXISTS）
* 添加 .env 环境变量配置与 dotenvy 加载
* 前端 API 契约保持不变，后端替换对前端透明

### 技术实现

* 依赖：sqlx 0.8（runtime-tokio + mysql + macros），dotenvy 0.15，tower-http 0.6（CORS）
* 数据库连接：MySqlPoolOptions 最大 5 连接
* 表结构：id BIGINT UNSIGNED AUTO_INCREMENT，title VARCHAR(255) NOT NULL
* 模型映射：sqlx::FromRow derive 自动将查询行映射为 Rust 结构体

### 遇到的问题

1. sqlx 的 features 组合需要精确匹配（runtime-tokio + mysql + macros 缺一不可）
2. MySQL DATABASE_URL 格式容易写错（需含用户名、密码、主机、端口、数据库名）

### 解决方案

* 参考 sqlx 官方文档确认 feature flags 组合
* 提供 .env.example 模板，复制后只需修改密码

---

## v3.0 — 完成状态管理

日期：基于 git tag v3.0（在 v2.0 之后完成）

### 完成内容

* 数据库新增 completed BOOLEAN 字段（DEFAULT FALSE）
* 新增 PATCH /todos/:id/toggle 端点，SQL 使用 `SET completed = NOT completed`
* 前端列表添加"完成 / 取消完成"按钮，点击触发 toggle
* 已完成任务显示删除线（text-decoration: line-through）和降低透明度（opacity: 0.55）
* 优化暗色主题配色，统一 card/button/input 样式

### 技术实现

* 后端：toggle handler 执行 UPDATE 后重新 SELECT 返回完整 Todo
* 前端：renderTodos() 中根据 todo.completed 添加/移除 .completed 类
* CSS：.todo-item.completed 统一样式管理，不依赖 JavaScript 内联样式

### 遇到的问题

1. MySQL 中 BOOLEAN 实际存储为 TINYINT(1)，sqlx 的 FromRow 自动映射为 Rust bool
2. 前端 toggle 后需要重新 fetch 列表，存在短暂的状态不一致窗口

### 解决方案

* sqlx 已内置 TINYINT ↔ bool 映射，无需手动转换
* toggle 成功后立即调用 loadTodos() 刷新列表，保证数据一致性

---

## v4.1 — Todo 优先级管理

日期：2026-07-14

### 完成内容

* 数据库新增 priority INT 字段（DEFAULT 2，取值范围 1-3）
* 后端 GET/POST/PUT 均支持 priority 字段
* 优先级验证：is_valid_priority() 拒绝范围外的值（400 BAD_REQUEST）
* 前端实现标签式优先级选择器（高/中/低 按钮组）
* 列表显示优先级彩色标签（红色=高，橙色=中，绿色=低）
* 编辑模式支持修改优先级

### 技术实现

* 后端：CreateTodo.priority 为 Option<i32>，未传入时 unwrap_or(2)；PUT 更新使用 COALESCE 保持原值
* CSS：.priority-option 默认灰色边框，选中态分别着色（data-priority 属性驱动）
* 编辑模式：li 切换 flex-direction: column，优先级组 + 日期输入 + 标题输入纵向排列

### 遇到的问题

1. 原生 `<select>` 下拉框在暗色主题下白底白字，无法统一风格
2. 编辑模式需要同时展示优先级选择器和标题编辑，flex 布局初始是横向

### 解决方案

* 用 div.priority-group 内三个 span 替代 select，完全控制颜色和交互
* 编辑模式下 li 动态设为 flex-direction: column，子元素纵向堆叠

---

## v4.2 — 搜索/筛选/统计/到期日期

日期：2026-07-14

### 完成内容

* 后端新增 due_date DATE 字段（DEFAULT NULL），添加索引
* Rust Todo 模型增加 due_date: Option<NaiveDate>，使用 chrono crate
* 所有 API 端点支持 due_date 的读写
* 前端搜索框实时过滤（标题匹配，大小写不敏感）
* 前端状态筛选按钮（全部 / 未完成 / 已完成）
* 前端统计面板（总任务 / 未完成 / 已完成）
* 列表到期日期两行显示：截止 YYYY-MM-DD + 动态剩余时间
* 日期输入自动格式化（formatDateInput）和有效性验证（isValidDate）
* 创建任务时日期输入框默认设为当天
* 编辑模式支持修改到期日期

### 技术实现

* 后端：chrono::NaiveDate 与 MySQL DATE 直接映射，序列化为 "YYYY-MM-DD"；PUT 使用 COALESCE(?, due_date) 保持未传字段原值
* 前端：allTodos 数组缓存全量数据，applyFilters() 组合筛选+搜索，renderTodos() 渲染过滤结果
* 日期输入：type="text" + 正则替换自动插入连字符（20260801 → 2026-08-01），isValidDate 验证真实日期
* 统计面板：在 applyFilters() 中根据 allTodos 实时计算总数/未完成/已完成
* 搜索和筛选均为纯前端实现，不增加后端 API 调用

### 遇到的问题

1. index.html 在多次迭代中被意外覆盖，丢失搜索/筛选/日期输入部分的 DOM 结构
2. 编辑模式动态创建的日期输入框需要与创建模式的样式完全一致
3. 日期输入从 type="date" 改为 type="text" 后，失去了平台原生的日期选择器和自动校验

### 解决方案

* 根据 app.js 中 JS 引用的所有 id/class，对照 styles.css 的样式定义，重建完整的 index.html
* 编辑模式使用相同的 .due-date-input 类，额外添加 .edit-date-input 仅调整 margin-top
* 实现 formatDateInput() 函数用正则自动插入连字符，isValidDate() 函数校验年/月/日值的合法性

---

## v4.3 — 主题切换与数据导出

日期：2026-07-14

### 完成内容

* 深色/浅色主题切换：CSS Variables 体系 + data-theme 属性 + localStorage 持久化
* JSON 数据导出：完整备份 allTodos，保留 id/completed/priority/due_date 原始结构
* CSV 数据导出：用户友好格式，新增 title/status/priority/due_date 列，completed 映射为已完成/未完成，priority 映射为高/中/低
* 下拉菜单组件：导出选项收纳为「导出 ▼」单个按钮，排序选项收纳为「排序 ▼」单个按钮

### 技术实现

* 主题：document.documentElement.setAttribute("data-theme", theme) + CSS [data-theme="light"]
* 导出：Blob + URL.createObjectURL + `<a>.download`，JSON 保留原始结构，CSV 含 BOM 支持 Excel 直接打开
* 下拉菜单：position: absolute + opacity/transform 动画 + 点击外部自动关闭

---

## v5.0 — 智能提醒后端

日期：2026-07-15

### 完成内容

* 新增后端 reminders 模块：reminders/mod.rs（规则引擎）+ routes/reminders.rs（HTTP handler）+ models/reminder.rs（结构体）
* 新增 GET /api/reminders 端点，返回所有未完成任务的智能提醒列表
* Todo 模型增加 created_at: DateTime<Utc> ，利用已有 TIMESTAMP 列
* 提醒根据 severity 排序：danger → warning → info

### 智能提醒规则

| 规则 | 触发条件 | level | 示例消息 |
|------|---------|-------|---------|
| 已过期 | due_date < today && !completed | danger | 任务《xxx》已经延期3天 |
| 今天截止 | due_date == today && !completed | warning | 任务《xxx》今天截止，请及时完成 |
| 高优先级 | priority == 1 && !completed | danger | 高优先级任务《xxx》仍未完成，请优先处理 |
| 长时间未完成 | created_at < today - 7d && !completed | info | 任务《xxx》已经等待7天 |

### 技术实现

* 模块结构：models/reminder.rs（Reminder/ReminderLevel）→ reminders/mod.rs（规则函数）→ routes/reminders.rs（HTTP 层）
* 类型映射：MySQL TIMESTAMP → chrono::DateTime<Utc>（修复 NaiveDateTime 不兼容问题）
* 路由注册：routes/mod.rs 中先 merge 两个 router，再统一 with_state(pool)
* 错误日志：map_err 时 eprintln! 输出真实错误，不吞没

### 遇到的问题

1. sqlx 的 chrono::NaiveDateTime 不支持 MySQL TIMESTAMP 类型列，解码时报 ColumnDecode 错误

### 解决方案

* 改用 chrono::DateTime<Utc>，sqlx 的 Decode 实现支持 MYSQL_TYPE_TIMESTAMP
* DateTime<Utc> 对应使用 .date_naive()（而非已废弃的 .date()）获取 NaiveDate 用于天数计算

---

## v5.1 — 前端提醒面板

日期：2026-07-15

### 完成内容

* 前端新增智能提醒面板，位于工具栏与待办列表之间
* 页面加载及每次 CRUD 后自动请求 GET /api/reminders
* 按 level 分级展示：danger（红色）、warning（黄色）、info（蓝色）
* 提醒数量为 0 时自动隐藏面板，避免空状态占用空间
* 复用 `.panel` 卡片样式，与待办列表视觉一致

### 技术实现

* 新增 loadReminders() 和 renderReminders() 两个函数
* loadTodos() 末尾追加 loadReminders() 调用，覆盖所有 CRUD 场景
* renderReminders() 根据 level 设置不同 CSS class 和图标（🔴/⚠️/ℹ️）
* 面板 display: none/block 切换，无需额外 empty state 文字

---

## v5.2 — 浏览器系统通知

日期：2026-07-15

### 完成内容

* 使用浏览器原生 Notification API 发送系统通知
* 仅处理 danger/warning 级别提醒，忽略 info
* 权限管理：default → requestPermission()，granted → 发送，denied → 静默
* 使用 sessionStorage 防止同一会话中重复通知

### 技术实现

* 新增 sendBrowserNotifications() 函数，在 loadReminders() 中 renderReminders() 之后调用
* 特性检测：if (!("Notification" in window)) return;
* 防重复 key 格式：`${todo_id}_${type}`（如 8_overdue、8_high_priority）
* sessionStorage 读写全部包裹 try-catch 异常保护
* 异步处理：await Notification.requestPermission() 等待用户授权
* 所有后端/HTML/CSS 零改动，仅修改 frontend/app.js

## 2026-07-15 Reminder 系统优化

### 修复内容
- 修复智能提醒重复显示问题。
- 同一任务同时满足多个提醒条件时（例如：已延期 + 高优先级），不再生成多条重复提醒。

### 实现方式
- 在 reminders 模块生成提醒后增加合并处理逻辑。
- 根据 todo_id 对提醒进行去重。
- 保留最高优先级提醒等级，并合并多个提醒原因。

### 优化效果
修复前：
- 一个任务可能显示：
  - "任务 xxx 已延期"
  - "高优先级任务 xxx 未完成"

修复后：
- 合并为：
  - "任务 xxx 已延期，且为高优先级任务"

### 涉及文件
- backend/src/reminders/mod.rs