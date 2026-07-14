use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// 与数据库 todos 表对应的实体，同时用于 JSON 响应
#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Todo {
    pub id: u64,
    pub title: String,
    pub completed: bool,
    pub priority: i32,
    pub due_date: Option<NaiveDate>,
}

/// 创建 / 更新请求体；priority 可选，未传时创建默认 2，更新时保持不变
#[derive(Debug, Deserialize)]
pub struct CreateTodo {
    pub title: String,
    pub priority: Option<i32>,
    pub due_date: Option<NaiveDate>,
}
