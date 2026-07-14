use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    routing::{get, patch, put},
};
use sqlx::MySqlPool;

use crate::models::{CreateTodo, Todo};

const DEFAULT_PRIORITY: i32 = 2;

fn is_valid_priority(priority: i32) -> bool {
    matches!(priority, 1..=3)
}

/// Todo 相关 REST 路由（路径与 V1 保持一致）
pub fn router() -> Router<MySqlPool> {
    Router::new()
        .route("/todos", get(get_todos).post(create_todo))
        .route("/todos/{id}", put(update_todo).delete(delete_todo))
        .route("/todos/{id}/toggle", patch(toggle_todo))
}

// GET /todos — 查询全部
async fn get_todos(State(pool): State<MySqlPool>) -> Result<Json<Vec<Todo>>, StatusCode> {
    let todos = sqlx::query_as::<_, Todo>(
        "SELECT id, title, completed, priority FROM todos ORDER BY id ASC",
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(todos))
}

// POST /todos — 插入新记录，completed 默认 false，priority 默认 2
async fn create_todo(
    State(pool): State<MySqlPool>,
    Json(payload): Json<CreateTodo>,
) -> Result<(StatusCode, Json<Todo>), StatusCode> {
    let priority = payload.priority.unwrap_or(DEFAULT_PRIORITY);
    if !is_valid_priority(priority) {
        return Err(StatusCode::BAD_REQUEST);
    }

    let result = sqlx::query("INSERT INTO todos (title, priority) VALUES (?, ?)")
        .bind(&payload.title)
        .bind(priority)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let todo = Todo {
        id: result.last_insert_id(),
        title: payload.title,
        completed: false,
        priority,
    };

    Ok((StatusCode::CREATED, Json(todo)))
}

// PUT /todos/:id — 更新标题；若请求体包含 priority 则一并更新
async fn update_todo(
    Path(id): Path<u64>,
    State(pool): State<MySqlPool>,
    Json(payload): Json<CreateTodo>,
) -> Result<(StatusCode, Json<Todo>), StatusCode> {
    if let Some(priority) = payload.priority {
        if !is_valid_priority(priority) {
            return Err(StatusCode::BAD_REQUEST);
        }

        let result = sqlx::query("UPDATE todos SET title = ?, priority = ? WHERE id = ?")
            .bind(&payload.title)
            .bind(priority)
            .bind(id)
            .execute(&pool)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        if result.rows_affected() == 0 {
            return Err(StatusCode::NOT_FOUND);
        }
    } else {
        let result = sqlx::query("UPDATE todos SET title = ? WHERE id = ?")
            .bind(&payload.title)
            .bind(id)
            .execute(&pool)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        if result.rows_affected() == 0 {
            return Err(StatusCode::NOT_FOUND);
        }
    }

    let todo = sqlx::query_as::<_, Todo>(
        "SELECT id, title, completed, priority FROM todos WHERE id = ?",
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::OK, Json(todo)))
}

// PATCH /todos/:id/toggle — 切换 completed 状态
async fn toggle_todo(
    Path(id): Path<u64>,
    State(pool): State<MySqlPool>,
) -> Result<(StatusCode, Json<Todo>), StatusCode> {
    let result = sqlx::query("UPDATE todos SET completed = NOT completed WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    let todo = sqlx::query_as::<_, Todo>(
        "SELECT id, title, completed, priority FROM todos WHERE id = ?",
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::OK, Json(todo)))
}

// DELETE /todos/:id
async fn delete_todo(Path(id): Path<u64>, State(pool): State<MySqlPool>) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("DELETE FROM todos WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        Err(StatusCode::NOT_FOUND)
    } else {
        Ok(StatusCode::NO_CONTENT)
    }
}
