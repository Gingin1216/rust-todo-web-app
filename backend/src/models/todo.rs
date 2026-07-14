use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// 与数据库 todos 表对应的实体，同时用于 JSON 响应
#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Todo {
    pub id: u64,
    pub title: String,
    pub completed: bool,
}

/// 创建 / 更新请求体（与 V1 API 保持一致）
#[derive(Debug, Deserialize)]
pub struct CreateTodo {
    pub title: String,
}
