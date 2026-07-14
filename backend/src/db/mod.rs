use std::env;

use sqlx::mysql::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;

/// 从环境变量读取 DATABASE_URL，创建 MySQL 连接池
pub async fn create_pool() -> Result<MySqlPool, sqlx::Error> {
    let database_url =
        env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env or environment");

    MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
}

/// 启动时确保 todos 表存在（也可用手动执行 sql/init.sql）
pub async fn init_schema(pool: &MySqlPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS todos (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT FALSE,
            priority INT NOT NULL DEFAULT 2,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}
