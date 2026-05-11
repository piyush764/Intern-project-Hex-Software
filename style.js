let tasks = JSON.parse(localStorage.getItem('tasks_v1') || '[]');
let filter = 'all';

function save() {
  localStorage.setItem('tasks_v1', JSON.stringify(tasks));
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) {
    input.focus();
    input.style.borderColor = 'var(--accent2)';
    setTimeout(() => input.style.borderColor = '', 600);
    return;
  }
  tasks.unshift({ id: Date.now(), text, done: false, ts: Date.now() });
  save();
  input.value = '';
  input.focus();
  render();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; save(); render(); }
}

function deleteTask(id) {
  const li = document.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.add('removing');
    li.addEventListener('animationend', () => {
      tasks = tasks.filter(t => t.id !== id);
      save();
      render();
    }, { once: true });
  }
}

function clearCompleted() {
  const completed = document.querySelectorAll('.task-item.done');
  if (completed.length === 0) return;
  let done = 0;
  completed.forEach(li => {
    li.classList.add('removing');
    li.addEventListener('animationend', () => {
      done++;
      if (done === completed.length) {
        tasks = tasks.filter(t => !t.done);
        save();
        render();
      }
    }, { once: true });
  });
}

function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pending = total - done;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statDone').textContent = done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';
}

function render() {
  updateStats();
  const list = document.getElementById('taskList');
  let filtered = tasks;
  if (filter === 'active') filtered = tasks.filter(t => !t.done);
  if (filter === 'done')   filtered = tasks.filter(t => t.done);

  if (filtered.length === 0) {
    const msgs = {
      all:    ['🌿', 'All clear!', 'Add a task to get started.'],
      active: ['✅', 'All done!', 'No pending tasks — nice work.'],
      done:   ['📋', 'Nothing here yet', 'Complete a task to see it here.'],
    };
    const [icon, title, sub] = msgs[filter];
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">${icon}</span>
        <div class="empty-title">${title}</div>
        <div class="empty-sub">${sub}</div>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(t => `
    <li class="task-item ${t.done ? 'done' : ''}" data-id="${t.id}">
      <button class="check-btn" onclick="toggleTask(${t.id})" title="${t.done ? 'Mark pending' : 'Mark done'}">
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M1 5L4.5 8.5L11 1" stroke="#0e0e0f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="task-text">${escapeHtml(t.text)}</span>
      <span class="task-meta">${formatTime(t.ts)}</span>
      <button class="delete-btn" onclick="deleteTask(${t.id})" title="Delete task">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </li>
  `).join('');
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Enter key support
document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

render();