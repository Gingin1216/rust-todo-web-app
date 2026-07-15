use serde::Serialize;

/// 提醒严重级别
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ReminderLevel {
    Info,
    Warning,
    Danger,
}

/// 智能提醒条目
#[derive(Debug, Clone, Serialize)]
pub struct Reminder {
    pub todo_id: u64,
    pub title: String,
    pub level: ReminderLevel,
    /// 提醒类型：overdue / due_today / high_priority / stale
    #[serde(rename = "type")]
    pub reminder_type: String,
    /// 中文提醒消息
    pub message: String,
    /// 相关天数（延期天数/等待天数），非时间类提醒为 None
    pub days: Option<i64>,
}
