const STORAGE_KEY = 'miva_academic_tasks_data';

const initialDefaultTasks = [
  {
    id: 'task-1',
    title: 'Complete COS 106 Practical Term Project Portfolio',
    course: 'COS 106',
    dueDate: '2026-11-05',
    priority: 'high',
    completed: false,
    createdAt: Date.now() - 100000000
  },
  {
    id: 'task-2',
    title: 'Study Discrete Mathematics Set Theory & Logic proofs',
    course: 'MTH 102',
    dueDate: '2026-11-08',
    priority: 'medium',
    completed: false,
    createdAt: Date.now() - 80000000
  },
  {
    id: 'task-3',
    title: 'Configure GitHub repository and Git branching workflow',
    course: 'COS 106',
    dueDate: '2026-10-24',
    priority: 'high',
    completed: true,
    createdAt: Date.now() - 60000000
  },
  {
    id: 'task-4',
    title: 'Prepare presentation notes for Introduction to Computing',
    course: 'COS 101',
    dueDate: '2026-11-12',
    priority: 'low',
    completed: false,
    createdAt: Date.now() - 40000000
  }
];

class AcademicPlanner {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentFilter = 'all';

    this.form = document.getElementById('task-form');
    this.titleInput = document.getElementById('task-title');
    this.courseInput = document.getElementById('task-course');
    this.dateInput = document.getElementById('task-date');
    this.priorityInput = document.getElementById('task-priority');
    this.tasksContainer = document.getElementById('tasks-container');
    this.filterButtons = document.querySelectorAll('.task-pill-btn');

    this.totalEl = document.getElementById('metric-total');
    this.completedEl = document.getElementById('metric-completed');
    this.pendingEl = document.getElementById('metric-pending');
    this.rateEl = document.getElementById('metric-rate');

    this.init();
  }

  loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      return [...initialDefaultTasks];
    }
    return [...initialDefaultTasks];
  }

  saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (e) {
      showToast('Could not persist tasks to storage.', 'danger');
    }
  }

  init() {
    if (!this.form || !this.tasksContainer) return;

    const todayString = new Date().toISOString().split('T')[0];
    if (this.dateInput && !this.dateInput.value) {
      this.dateInput.value = todayString;
      this.dateInput.min = todayString;
    }

    this.form.addEventListener('submit', (e) => this.handleAddTask(e));

    this.filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-task-filter') || 'all';
        this.render();
      });
    });

    this.tasksContainer.addEventListener('click', (e) => {
      const checkboxBtn = e.target.closest('.task-checkbox-btn');
      const deleteBtn = e.target.closest('.task-delete-btn');

      if (checkboxBtn) {
        const taskId = checkboxBtn.getAttribute('data-id');
        this.toggleTaskCompletion(taskId);
      } else if (deleteBtn) {
        const taskId = deleteBtn.getAttribute('data-id');
        this.deleteTask(taskId);
      }
    });

    this.render();
  }

  handleAddTask(e) {
    e.preventDefault();

    const title = this.titleInput.value.trim();
    const course = this.courseInput.value.trim().toUpperCase();
    const dueDate = this.dateInput.value;
    const priority = this.priorityInput.value;

    const errorFeedback = document.getElementById('task-form-error');
    if (errorFeedback) errorFeedback.textContent = '';

    if (!title) {
      if (errorFeedback) errorFeedback.textContent = 'Please enter a task title.';
      this.titleInput.focus();
      return;
    }

    if (!course) {
      if (errorFeedback) errorFeedback.textContent = 'Please enter a course code (e.g. COS 106).';
      this.courseInput.focus();
      return;
    }

    if (!dueDate) {
      if (errorFeedback) errorFeedback.textContent = 'Please select a due date.';
      this.dateInput.focus();
      return;
    }

    const newTask = {
      id: 'task-' + Date.now(),
      title,
      course,
      dueDate,
      priority,
      completed: false,
      createdAt: Date.now()
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    this.render();

    this.form.reset();
    const todayString = new Date().toISOString().split('T')[0];
    this.dateInput.value = todayString;

    showToast('Task added successfully!', 'success');
  }

  toggleTaskCompletion(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    this.saveTasks();
    this.render();

    const message = task.completed ? 'Task marked as completed!' : 'Task marked as in progress.';
    showToast(message, 'success');
  }

  deleteTask(taskId) {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return;

    const removedTask = this.tasks.splice(index, 1)[0];
    this.saveTasks();
    this.render();

    showToast(`Deleted task: "${removedTask.title}"`, 'danger');
  }

  getFilteredTasks() {
    if (this.currentFilter === 'pending') {
      return this.tasks.filter((t) => !t.completed);
    }
    if (this.currentFilter === 'completed') {
      return this.tasks.filter((t) => t.completed);
    }
    return this.tasks;
  }

  updateMetrics() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (this.totalEl) this.totalEl.textContent = total;
    if (this.completedEl) this.completedEl.textContent = completed;
    if (this.pendingEl) this.pendingEl.textContent = pending;
    if (this.rateEl) this.rateEl.textContent = `${rate}%`;
  }

  getPriorityBadge(priority) {
    const map = {
      high: { label: 'High Priority', class: 'badge-danger' },
      medium: { label: 'Medium Priority', class: 'badge-warning' },
      low: { label: 'Low Priority', class: 'badge-info' }
    };
    const item = map[priority] || map.medium;
    return `<span class="badge ${item.class}">${item.label}</span>`;
  }

  render() {
    this.updateMetrics();

    const filtered = this.getFilteredTasks();

    if (filtered.length === 0) {
      this.tasksContainer.innerHTML = `
        <div class="empty-task-state">
          <div class="empty-icon">&#128221;</div>
          <h3 style="color: #fff; margin-bottom: 0.5rem;">No tasks found</h3>
          <p>There are no tasks under the "${this.currentFilter}" filter.</p>
        </div>
      `;
      return;
    }

    this.tasksContainer.innerHTML = filtered
      .map((task) => {
        const priorityBadge = this.getPriorityBadge(task.priority);
        const completedClass = task.completed ? 'completed' : '';
        const checkIcon = task.completed ? '&#10003;' : '';

        return `
          <article class="task-item ${completedClass}" id="${task.id}">
            <div class="task-left">
              <button 
                type="button" 
                class="task-checkbox-btn" 
                data-id="${task.id}" 
                aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
              >
                ${checkIcon}
              </button>
              <div class="task-info">
                <span class="task-name">${this.escapeHtml(task.title)}</span>
                <div class="task-meta-row">
                  <span class="badge badge-tech">${this.escapeHtml(task.course)}</span>
                  ${priorityBadge}
                  <span class="task-due-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Due ${task.dueDate}
                  </span>
                </div>
              </div>
            </div>
            <button 
              type="button" 
              class="task-delete-btn" 
              data-id="${task.id}" 
              title="Delete task" 
              aria-label="Delete task"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </article>
        `;
      })
      .join('');
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AcademicPlanner();
});
