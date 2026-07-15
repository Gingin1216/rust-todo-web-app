use axum::{Json, Router, extract::State, http::StatusCode, routing::get};
use sqlx::MySqlPool;

use crate::models::Reminder;
use crate::reminders;

pub fn router() -> Router<MySqlPool> {
    Router::new().route("/api/reminders", get(get_reminders))
}

async fn get_reminders(
    State(pool): State<MySqlPool>,
) -> Result<Json<Vec<Reminder>>, StatusCode> {
    reminders::generate_reminders(&pool)
        .await
        .map(Json)
        .map_err(|err| {
            eprintln!("Reminder error: {:?}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })
}
