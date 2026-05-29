mod todos;

use axum::Router;
use sqlx::MySqlPool;

pub fn create_router(pool: MySqlPool) -> Router {
    todos::router().with_state(pool)
}
