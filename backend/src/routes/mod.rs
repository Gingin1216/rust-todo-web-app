mod todos;
mod reminders;

use axum::Router;
use sqlx::MySqlPool;

pub fn create_router(pool: MySqlPool) -> Router {
    Router::new()
        .merge(todos::router())
        .merge(reminders::router())
        .with_state(pool)
}
