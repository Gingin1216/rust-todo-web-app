use std::sync::{Arc, Mutex};

use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    routing::{delete, get, post, put},
};
use serde::{Deserialize, Serialize};

// 共享状态：用 Mutex 保护内存中的 Vec，供多个请求并发读写
pub type AppState = Arc<Mutex<Vec<Todo>>>;

#[derive(Debug, Clone, Serialize)]
pub struct Todo {
    pub id: usize,
    pub title: String,
}

// 创建 / 更新时共用的请求体
#[derive(Debug, Deserialize)]
pub struct CreateTodo {
    pub title: String,
}

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/todos", get(get_todos).post(create_todo))
        // {id} 为路径参数，对应 DELETE /todos/:id 与 PUT /todos/:id
        .route("/todos/{id}", put(update_todo).delete(delete_todo))
        .with_state(state)
}

// GET /todos — 返回全部待办
async fn get_todos(State(state): State<AppState>) -> Json<Vec<Todo>> {
    let todos = state.lock().expect("state lock poisoned").clone();
    Json(todos)
}

// POST /todos — 新建一条待办
async fn create_todo(
    State(state): State<AppState>,
    Json(payload): Json<CreateTodo>,
) -> (StatusCode, Json<Todo>) {
    let mut todos = state.lock().expect("state lock poisoned");
    let new_todo = Todo {
        id: todos.len() + 1,
        title: payload.title,
    };
    todos.push(new_todo.clone());

    (StatusCode::CREATED, Json(new_todo))
}

// PUT /todos/:id — 按 id 更新标题；找不到则 404
async fn update_todo(
    Path(id): Path<usize>,
    State(state): State<AppState>,
    Json(payload): Json<CreateTodo>,
) -> Result<(StatusCode, Json<Todo>), StatusCode> {
    let mut todos = state.lock().expect("state lock poisoned");

    let todo = todos.iter_mut().find(|t| t.id == id);
    match todo {
        Some(t) => {
            t.title = payload.title;
            Ok((StatusCode::OK, Json(t.clone())))
        }
        None => Err(StatusCode::NOT_FOUND),
    }
}

// DELETE /todos/:id — 按 id 删除；成功 204，找不到 404
async fn delete_todo(Path(id): Path<usize>, State(state): State<AppState>) -> StatusCode {
    let mut todos = state.lock().expect("state lock poisoned");
    let before = todos.len();
    todos.retain(|t| t.id != id);

    if todos.len() < before {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}
