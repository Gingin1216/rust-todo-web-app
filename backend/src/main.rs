mod db;
mod models;
mod routes;

use axum::http::{HeaderValue, Method, header::CONTENT_TYPE};
use sqlx::MySqlPool;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    // 从 backend/.env 加载 DATABASE_URL
    dotenvy::dotenv().ok();

    let pool = db::create_pool()
        .await
        .expect("failed to create MySQL pool");

    db::init_schema(&pool)
        .await
        .expect("failed to initialize database schema");

    let app = create_app(pool);

    let listener = TcpListener::bind("127.0.0.1:3000")
        .await
        .expect("failed to bind 127.0.0.1:3000");

    println!("Todo API V2 (MySQL) running at http://127.0.0.1:3000");
    axum::serve(listener, app)
        .await
        .expect("server failed");
}

/// 组装路由：注入 MySqlPool，并附加 CORS
fn create_app(pool: MySqlPool) -> axum::Router {
    let frontend_origin = "http://127.0.0.1:5500"
        .parse::<HeaderValue>()
        .expect("invalid CORS origin");

    let cors = CorsLayer::new()
        .allow_origin(frontend_origin)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::PATCH,
        ])
        .allow_headers([CONTENT_TYPE]);

    routes::create_router(pool).layer(cors)
}
