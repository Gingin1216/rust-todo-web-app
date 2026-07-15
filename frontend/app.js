// 后端 API 地址（与 axum 服务一致）
const API_BASE = "http://127.0.0.1:3000";

const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-todo");
const todoList = document.getElementById("todo-list");
const todoCount = document.getElementById("todo-count");
const statusEl = document.getElementById("status");
const emptyState = document.getElementById("empty-state");

// 搜索与筛选状态
let allTodos = [];
let currentFilter = "all";
let searchQuery = "";
let currentSort = "default";

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`请求失败 (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// GET /todos
async function loadTodos() {
  setStatus("加载中…");
  try {
    allTodos = await request("/todos");
    applyFilters();
    setStatus("");
  } catch (err) {
    setStatus(`无法连接后端，请先运行 cargo run：${err.message}`, true);
    allTodos = [];
    applyFilters();
  }
}

// POST /todos
async function addTodo(title, priority, dueDate) {
  await request("/todos", {
    method: "POST",
    body: JSON.stringify({ title, priority, due_date: dueDate || null }),
  });
}

// PUT /todos/:id
async function updateTodo(id, title, priority, dueDate) {
  await request(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, priority, due_date: dueDate || null }),
  });
}

// DELETE /todos/:id
async function removeTodo(id) {
  await request(`/todos/${id}`, { method: "DELETE" });
}

// PATCH /todos/:id/toggle
async function toggleTodo(id) {
  await request(`/todos/${id}/toggle`, { method: "PATCH" });
}

// 计算距离到期日的天数（正=剩余，负=已逾期）
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

// 日期输入自动格式化：键入数字时自动插入连字符
function formatDateInput(input) {
  let digits = input.value.replace(/\D/g, "");
  if (digits.length > 4) {
    digits = digits.slice(0, 4) + "-" + digits.slice(4);
  }
  if (digits.length > 7) {
    digits = digits.slice(0, 7) + "-" + digits.slice(7);
  }
  input.value = digits.slice(0, 10);
}

// 验证日期字符串是否为有效 YYYY-MM-DD
function isValidDate(dateStr) {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const y = parseInt(m[1], 10), mo = parseInt(m[2], 10) - 1, d = parseInt(m[3], 10);
  const dt = new Date(y, mo, d);
  return dt.getFullYear() === y && dt.getMonth() === mo && dt.getDate() === d;
}

// 筛选与搜索过滤
function applyFilters() {
  let filtered = allTodos;

  // 更新统计面板
  document.getElementById("stat-total").textContent = allTodos.length;
  document.getElementById("stat-active").textContent = allTodos.filter(t => !t.completed).length;
  document.getElementById("stat-completed").textContent = allTodos.filter(t => t.completed).length;

  if (currentFilter === "active") {
    filtered = filtered.filter(t => !t.completed);
  } else if (currentFilter === "completed") {
    filtered = filtered.filter(t => t.completed);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
  }

  // 排序
  if (currentSort === "priority") {
    filtered.sort((a, b) => a.priority - b.priority);
  } else if (currentSort === "due_date") {
    filtered.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  } else if (currentSort === "completed") {
    filtered.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
  }

  renderTodos(filtered);
}

function renderTodos(todos) {
  todoList.innerHTML = "";
  todoCount.textContent = String(todos.length);
  emptyState.classList.toggle("hidden", todos.length > 0);
  // 更新空状态提示文字
  if (todos.length === 0 && allTodos.length > 0) {
    emptyState.textContent = "没有匹配的任务";
  } else {
    emptyState.textContent = "暂无任务";
  }

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const titleSpan = document.createElement("span");
    titleSpan.className = "todo-title";

    // 标题行：优先级标签 + 标题文字
    const titleRow = document.createElement("div");
    titleRow.className = "title-row";

    // 优先级标签
    const priorityMap = { 1: "高", 2: "中", 3: "低" };
    const priorityBadge = document.createElement("span");
    priorityBadge.className = `priority-badge priority-${todo.priority}`;
    priorityBadge.textContent = priorityMap[todo.priority] || "";

    titleRow.appendChild(priorityBadge);
    // 标题文字
    const titleText = document.createElement("span");
    titleText.textContent = todo.title;
    titleRow.appendChild(titleText);

    titleSpan.appendChild(titleRow);

    // 到期日期显示
    if (todo.due_date) {
      const dueWrapper = document.createElement("div");
      dueWrapper.className = "todo-due-wrapper";

      // 日期行：截止 YYYY-MM-DD
      const dueLabel = document.createElement("span");
      dueLabel.className = "todo-due-label";
      dueLabel.textContent = `截止 ${todo.due_date}`;
      dueWrapper.appendChild(dueLabel);

      // 状态行：动态剩余时间
      const days = daysUntil(todo.due_date);
      const dueStatus = document.createElement("span");
      dueStatus.className = "todo-due-status";
      if (days < 0) {
        dueStatus.classList.add("overdue");
        dueStatus.textContent = `已逾期 ${Math.abs(days)} 天`;
      } else if (days === 0) {
        dueStatus.classList.add("soon");
        dueStatus.textContent = "今天截止";
      } else if (days === 1) {
        dueStatus.classList.add("soon");
        dueStatus.textContent = "明天截止";
      } else {
        dueStatus.classList.add("safe");
        dueStatus.textContent = `剩余 ${days} 天`;
      }
      dueWrapper.appendChild(dueStatus);
      titleSpan.appendChild(dueWrapper);
    }

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.className = "btn-complete";
    completeBtn.textContent = todo.completed ? "取消完成" : "完成";
    completeBtn.addEventListener("click", async () => {
      try {
        await toggleTodo(todo.id);
        await loadTodos();
      } catch (err) {
        setStatus(err.message, true);
      }
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "编辑";
    editBtn.addEventListener("click", () => startEdit(li, todo));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "删除";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("确定删除这条任务吗？")) return;
      try {
        await removeTodo(todo.id);
        await loadTodos();
      } catch (err) {
        setStatus(err.message, true);
      }
    });

    actions.append(completeBtn, editBtn, deleteBtn);
    li.append(titleSpan, actions);
    todoList.appendChild(li);
  });
}

function startEdit(li, todo) {
  // 编辑模式改用纵向布局
  li.style.flexDirection = "column";
  li.style.alignItems = "stretch";
  li.style.gap = "8px";

  // 优先级选择
  const priorityGroup = document.createElement("div");
  priorityGroup.className = "priority-group edit-priority-group";
  const levels = [
    { p: 1, label: "高" },
    { p: 2, label: "中" },
    { p: 3, label: "低" },
  ];
  levels.forEach(({ p, label }) => {
    const opt = document.createElement("span");
    opt.className = "priority-option" + (p === todo.priority ? " selected" : "");
    opt.dataset.priority = p;
    opt.textContent = label;
    opt.addEventListener("click", () => {
      priorityGroup.querySelectorAll(".priority-option").forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
    });
    priorityGroup.appendChild(opt);
  });

  const input = document.createElement("input");
  input.className = "todo-edit-input";
  input.value = todo.title;

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "保存";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "取消";

  const actions = document.createElement("div");
  actions.className = "todo-actions";
  actions.append(saveBtn, cancelBtn);

  // 编辑操作行：输入框 + 按钮并排
  const editRow = document.createElement("div");
  editRow.style.display = "flex";
  editRow.style.gap = "8px";
  editRow.style.alignItems = "center";
  editRow.append(input, actions);

  // 截止日期输入
  const dateInput = document.createElement("input");
  dateInput.type = "text";
  dateInput.className = "due-date-input edit-date-input";
  dateInput.placeholder = "YYYY-MM-DD";
  dateInput.maxLength = 10;
  // 后端已返回 YYYY-MM-DD 格式，直接赋值；无日期则为空
  dateInput.value = todo.due_date || "";
  // 自动格式化
  dateInput.addEventListener("input", function () { formatDateInput(this); });

  li.replaceChildren(priorityGroup, dateInput, editRow);

  const finish = () => loadTodos();

  saveBtn.addEventListener("click", async () => {
    const title = input.value.trim();
    if (!title) {
      setStatus("标题不能为空", true);
      return;
    }
    try {
      const newPriority = parseInt(priorityGroup.querySelector(".selected").dataset.priority, 10);
      const newDueDate = dateInput.value || null;
      await updateTodo(todo.id, title, newPriority, newDueDate);
      await finish();
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  cancelBtn.addEventListener("click", finish);
  input.focus();
}

// 添加任务：按钮点击
addBtn.addEventListener("click", () => handleAddTodo());
// 添加任务：回车键
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAddTodo();
});

function handleAddTodo() {
  const title = todoInput.value.trim();
  if (!title) return;

  const priority = parseInt(document.querySelector("#priority-group .selected").dataset.priority, 10);
  const dueDateValue = document.getElementById("todo-due-date").value;
  const dueDate = dueDateValue || null;
  // 有输入时验证格式
  if (dueDate && !isValidDate(dueDate)) {
    setStatus("日期格式无效，请使用 YYYY-MM-DD", true);
    return;
  }
  todoInput.value = "";
  addTodo(title, priority, dueDate)
    .then(() => loadTodos())
    .catch((err) => setStatus(err.message, true));
}

// 创建表单优先级按钮点击切换
document.getElementById("priority-group").addEventListener("click", (e) => {
  const target = e.target.closest(".priority-option");
  if (!target) return;
  target.parentElement.querySelectorAll(".priority-option").forEach((o) => o.classList.remove("selected"));
  target.classList.add("selected");
});

// 搜索输入实时过滤
document.getElementById("search-input").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  applyFilters();
});

// 筛选按钮切换
document.getElementById("filter-group").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  applyFilters();
});

// === 主题切换逻辑 ===
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle");
  btn.textContent = theme === "dark" ? "🌙" : "☀️";
}

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

document.getElementById("theme-toggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});

loadTodos();

// 截止日期输入框默认设为今天
const dueDateInput = document.getElementById("todo-due-date");
if (dueDateInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dueDateInput.value = `${yyyy}-${mm}-${dd}`;
}

// 创建表单日期输入自动格式化
document.getElementById("todo-due-date").addEventListener("input", function () {
  formatDateInput(this);
});

// === 导出功能 ===
function exportJSON() {
  const data = JSON.stringify(allTodos, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `todos-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV() {
  const escape = (v) => {
    const s = String(v ?? "");
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const statusMap = { true: "已完成", false: "未完成" };
  const priorityMap = { 1: "高", 2: "中", 3: "低" };
  const headers = ["title", "status", "priority", "due_date"];
  const rows = allTodos.map((t) => [
    escape(t.title),
    statusMap[t.completed],
    priorityMap[t.priority] || "",
    escape(t.due_date ?? ""),
  ].join(","));
  const csv = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `todos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// === 下拉菜单通用逻辑 ===
function setupDropdown(containerId, onSelect) {
  const container = document.getElementById(containerId);
  const btn = container.querySelector(".dropdown-btn");
  const menu = container.querySelector(".dropdown-menu");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".dropdown-menu.open").forEach(m => {
      if (m !== menu) m.classList.remove("open");
    });
    menu.classList.toggle("open");
  });

  menu.addEventListener("click", (e) => {
    const item = e.target.closest(".dropdown-item");
    if (!item) return;
    menu.querySelectorAll(".dropdown-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    menu.classList.remove("open");
    onSelect(item);
  });
}

// 点击其他区域关闭所有下拉菜单
document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-menu.open").forEach(m => m.classList.remove("open"));
});

// 导出下拉菜单
setupDropdown("export-dropdown", (item) => {
  if (item.dataset.type === "json") exportJSON();
  else if (item.dataset.type === "csv") exportCSV();
});

// 排序下拉菜单
setupDropdown("sort-dropdown", (item) => {
  currentSort = item.dataset.sort;
  applyFilters();
});
