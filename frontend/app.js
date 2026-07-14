// 后端 API 地址（与 axum 服务一致）
const API_BASE = "http://127.0.0.1:3000";

const addForm = document.getElementById("add-form");
const titleInput = document.getElementById("title-input");
const todoList = document.getElementById("todo-list");
const todoCount = document.getElementById("todo-count");
const statusEl = document.getElementById("status");
const emptyState = document.getElementById("empty-state");

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
    const todos = await request("/todos");
    renderTodos(todos);
    setStatus("");
  } catch (err) {
    setStatus(`无法连接后端，请先运行 cargo run：${err.message}`, true);
    renderTodos([]);
  }
}

// POST /todos
async function addTodo(title, priority) {
  await request("/todos", {
    method: "POST",
    body: JSON.stringify({ title, priority }),
  });
}

// PUT /todos/:id
async function updateTodo(id, title, priority) {
  await request(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, priority }),
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

function renderTodos(todos) {
  todoList.innerHTML = "";
  todoCount.textContent = String(todos.length);
  emptyState.classList.toggle("hidden", todos.length > 0);

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const titleSpan = document.createElement("span");
    titleSpan.className = "todo-title";

    // 优先级标签
    const priorityMap = { 1: "高", 2: "中", 3: "低" };
    const priorityBadge = document.createElement("span");
    priorityBadge.className = `priority-badge priority-${todo.priority}`;
    priorityBadge.textContent = priorityMap[todo.priority] || "";

    titleSpan.appendChild(priorityBadge);
    // 标题文字
    const titleText = document.createElement("span");
    titleText.textContent = todo.title;
    titleSpan.appendChild(titleText);

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

  li.replaceChildren(priorityGroup, editRow);

  const finish = () => loadTodos();

  saveBtn.addEventListener("click", async () => {
    const title = input.value.trim();
    if (!title) {
      setStatus("标题不能为空", true);
      return;
    }
    try {
      const newPriority = parseInt(priorityGroup.querySelector(".selected").dataset.priority, 10);
      await updateTodo(todo.id, title, newPriority);
      await finish();
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  cancelBtn.addEventListener("click", finish);
  input.focus();
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  try {
    const priority = parseInt(document.querySelector("#priority-group .selected").dataset.priority, 10);
    await addTodo(title, priority);
    titleInput.value = "";
    await loadTodos();
  } catch (err) {
    setStatus(err.message, true);
  }
});

// 创建表单优先级按钮点击切换
document.getElementById("priority-group").addEventListener("click", (e) => {
  const target = e.target.closest(".priority-option");
  if (!target) return;
  target.parentElement.querySelectorAll(".priority-option").forEach((o) => o.classList.remove("selected"));
  target.classList.add("selected");
});

loadTodos();
