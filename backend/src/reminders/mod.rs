use chrono::Utc;
use sqlx::MySqlPool;

use crate::models::{Reminder, ReminderLevel, Todo};

/// 生成所有未完成任务的相关智能提醒，按严重程度降序排列
pub async fn generate_reminders(pool: &MySqlPool) -> Result<Vec<Reminder>, sqlx::Error> {
    let todos = sqlx::query_as::<_, Todo>(
        "SELECT id, title, completed, priority, due_date, created_at FROM todos WHERE completed = FALSE"
    )
    .fetch_all(pool)
    .await?;

    let mut reminders: Vec<Reminder> = Vec::new();

    for todo in &todos {
        // 同一个 todo 可产生多条提醒
        if let Some(r) = check_due_date(todo) {
            reminders.push(r);
        }
        if let Some(r) = check_high_priority(todo) {
            reminders.push(r);
        }
        if let Some(r) = check_stale(todo) {
            reminders.push(r);
        }
    }

    // 按严重程度排序：danger > warning > info
    reminders.sort_by_key(|r| match r.level {
        ReminderLevel::Danger => 0,
        ReminderLevel::Warning => 1,
        ReminderLevel::Info => 2,
    });

    Ok(merge_reminders(reminders))
}

/// 检查截止日期提醒：已过期 / 今天到期
fn check_due_date(todo: &Todo) -> Option<Reminder> {
    let today = Utc::now().date_naive();

    match todo.due_date {
        None => None,
        Some(due) if due < today => {
            let days = (today - due).num_days();
            Some(Reminder {
                todo_id: todo.id,
                title: todo.title.clone(),
                level: ReminderLevel::Danger,
                reminder_type: "overdue".to_string(),
                message: format!("任务《{}》已经延期{}天", todo.title, days),
                days: Some(days),
            })
        }
        Some(due) if due == today => {
            Some(Reminder {
                todo_id: todo.id,
                title: todo.title.clone(),
                level: ReminderLevel::Warning,
                reminder_type: "due_today".to_string(),
                message: format!("任务《{}》今天截止，请及时完成", todo.title),
                days: Some(0),
            })
        }
        Some(_) => None,
    }
}

/// 检查高优先级待办
fn check_high_priority(todo: &Todo) -> Option<Reminder> {
    if todo.priority == 1 && !todo.completed {
        Some(Reminder {
            todo_id: todo.id,
            title: todo.title.clone(),
            level: ReminderLevel::Danger,
            reminder_type: "high_priority".to_string(),
            message: format!("高优先级任务《{}》仍未完成，请优先处理", todo.title),
            days: None,
        })
    } else {
        None
    }
}

/// 检查长时间未完成（创建超过 7 天）
fn check_stale(todo: &Todo) -> Option<Reminder> {
    const STALE_DAYS: i64 = 7;

    let created_date = todo.created_at.date_naive();
    let today = Utc::now().date_naive();
    let days = (today - created_date).num_days();

    if days >= STALE_DAYS {
        Some(Reminder {
            todo_id: todo.id,
            title: todo.title.clone(),
            level: ReminderLevel::Info,
            reminder_type: "stale".to_string(),
            message: format!("任务《{}》已经等待{}天", todo.title, days),
            days: Some(days),
        })
    } else {
        None
    }
}

/// 按 todo_id 合并提醒：保留最高 severity 的提醒，合并次要提醒的消息
fn merge_reminders(reminders: Vec<Reminder>) -> Vec<Reminder> {
    let mut merged: Vec<Reminder> = Vec::new();
    for r in reminders {
        match merged.iter_mut().find(|m| m.todo_id == r.todo_id) {
            Some(existing) => {
                existing.message = merge_message(&existing.message, &r.reminder_type, &r.message);
                // 仅当主提醒无 days 时才使用次要提醒的 days（避免 overdue 的 days 被覆盖）
                if r.days.is_some() && existing.days.is_none() {
                    existing.days = r.days;
                }
            }
            None => merged.push(r),
        }
    }
    merged
}

/// 将次要提醒消息的关键原因合并到主提醒消息中
/// 根据 reminder_type 判断提醒类型，不依赖中文文本解析
fn merge_message(main: &str, secondary_type: &str, _secondary_msg: &str) -> String {
    match secondary_type {
        "high_priority" => format!("{}，且为高优先级任务", main.trim_end_matches('。')),
        "stale" => format!("{}，已等待超过7天", main.trim_end_matches('。')),
        "due_today" => format!("{}，且今天截止", main.trim_end_matches('。')),
        // overdue 具有最高优先级，正常情况下不会作为 secondary 出现
        _ => format!("{}；{}", main, _secondary_msg),
    }
}
