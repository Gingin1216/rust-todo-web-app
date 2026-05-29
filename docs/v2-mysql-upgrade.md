# Todo API V2 — MySQL 持久化

## 项目结构

```
to do list/
├── frontend/                 # 无需修改（API 契约不变）
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── .env                  # 本地配置（勿提交）
│   ├── .env.example
│   ├── Cargo.toml
│   ├── sql/
│   │   └── init.sql          # 手动初始化 SQL
│   └── src/
│       ├── main.rs           # 启动、连接池、CORS
│       ├── db/
│       │   └── mod.rs        # MySqlPool + 建表
│       ├── models/
│       │   ├── mod.rs
│       │   └── todo.rs       # Todo / CreateTodo
│       └── routes/
│           ├── mod.rs
│           └── todos.rs      # REST 处理器
└── docs/
    └── v2-mysql-upgrade.md
```

## MySQL 初始化

1. 安装并启动 MySQL 8.x
2. 执行 `backend/sql/init.sql`（或让程序启动时自动 `CREATE TABLE`）
3. 复制 `backend/.env.example` 为 `backend/.env`，填写 `DATABASE_URL`

## 运行

```bash
cd backend
cargo run
```

前端：Live Server 打开 `frontend/index.html`（`http://127.0.0.1:5500`）

## 测试 API

```bash
curl http://127.0.0.1:3000/todos
curl -X POST http://127.0.0.1:3000/todos -H "Content-Type: application/json" -d "{\"title\":\"学习 Rust\"}"
curl -X PUT http://127.0.0.1:3000/todos/1 -H "Content-Type: application/json" -d "{\"title\":\"学习 MySQL\"}"
curl -X DELETE http://127.0.0.1:3000/todos/1
```

重启 `cargo run` 后再次 `GET /todos`，数据应仍在。
