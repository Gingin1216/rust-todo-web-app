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
async function addTodo(title) {
  await request("/todos", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

// PUT /todos/:id
async function updateTodo(id, title) {
  await request(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

// DELETE /todos/:id
async function removeTodo(id) {
  await request(`/todos/${id}`, { method: "DELETE" });
}

function renderTodos(todos) {
  todoList.innerHTML = "";
  todoCount.textContent = String(todos.length);
  emptyState.classList.toggle("hidden", todos.length > 0);

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

    const titleSpan = document.createElement("span");
    titleSpan.className = "todo-title";
    titleSpan.textContent = todo.title;

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "编辑";
    editBtn.addEventListener("click", () => startEdit(li, todo));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "删除";
    deleteBtn.addEventListener("click", async () => {
      try {
        await removeTodo(todo.id);
        await loadTodos();
      } catch (err) {
        setStatus(err.message, true);
      }
    });

    actions.append(editBtn, deleteBtn);
    li.append(titleSpan, actions);
    todoList.appendChild(li);
  });
}

function startEdit(li, todo) {
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

  li.replaceChildren(input, actions);

  const finish = () => loadTodos();

  saveBtn.addEventListener("click", async () => {
    const title = input.value.trim();
    if (!title) {
      setStatus("标题不能为空", true);
      return;
    }
    try {
      await updateTodo(todo.id, title);
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
    await addTodo(title);
    titleInput.value = "";
    await loadTodos();
  } catch (err) {
    setStatus(err.message, true);
  }
});

loadTodos();
