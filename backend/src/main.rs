mod routes;

use std::sync::{Arc, Mutex};

use axum::http::{HeaderValue, Method, header::CONTENT_TYPE};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    let state = Arc::new(Mutex::new(Vec::new()));

    // 仅允许 Live Server 等本地前端来源跨域访问
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
        ])
        // 前端 fetch 发送 JSON 时需要 Content-Type
        .allow_headers([CONTENT_TYPE]);

    let app = routes::create_router(state).layer(cors);

    let listener = TcpListener::bind("127.0.0.1:3000")
        .await
        .expect("failed to bind 127.0.0.1:3000");

    println!("Todo API running at http://127.0.0.1:3000");
    axum::serve(listener, app)
        .await
        .expect("server failed");
}
