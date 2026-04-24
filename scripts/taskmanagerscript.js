// Task Manager JavaScript
const taskState = {
    tasks: [],
    currentFilter: 'all',
    editingTaskId: null,
    draggedTaskId: null,
    elements: {}
};

function initializeTaskElements() {
    taskState.elements = {
        taskInput: document.getElementById('taskInput'),
        addBtn: document.getElementById('addBtn'),
        taskList: document.getElementById('taskList'),
        emptyState: document.getElementById('emptyState'),
        totalTasks: document.getElementById('totalTasks'),
        completedTasks: document.getElementById('completedTasks'),
        pendingTasks: document.getElementById('pendingTasks'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        clearCompletedBtn: document.getElementById('clearCompleted'),
        clearAllBtn: document.getElementById('clearAll')
    };
}

function bindTaskEvents() {
    taskState.elements.addBtn.addEventListener('click', addTask);
    taskState.elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    taskState.elements.filterBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => setFilter(e.target.dataset.filter));
    });

    taskState.elements.clearCompletedBtn.addEventListener('click', clearCompleted);
    taskState.elements.clearAllBtn.addEventListener('click', clearAllTasks);
    taskState.elements.taskInput.addEventListener('input', validateTaskInput);

    document.addEventListener('keydown', handleTaskKeyboardShortcuts);
    bindTaskDragAndDrop();
}

function generateTaskId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addTask() {
    const text = taskState.elements.taskInput.value.trim();

    if (!text) {
        showTaskMessage('Please enter a task!', 'error');
        return;
    }

    if (taskState.editingTaskId) {
        updateTask(taskState.editingTaskId, text);
        taskState.editingTaskId = null;
        taskState.elements.addBtn.textContent = 'Add Task';
    } else {
        taskState.tasks.unshift({
            id: generateTaskId(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        });
        showTaskMessage('Task added successfully!', 'success');
    }

    taskState.elements.taskInput.value = '';
    saveTasks();
    renderTasks();
    updateTaskStats();
    validateTaskInput();
}

function updateTask(taskId, newText) {
    const task = taskState.tasks.find((item) => item.id === taskId);
    if (task) {
        task.text = newText;
        showTaskMessage('Task updated successfully!', 'success');
    }
}

function toggleTask(taskId) {
    const task = taskState.tasks.find((item) => item.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateTaskStats();
    showTaskMessage(task.completed ? 'Task completed!' : 'Task marked as pending', 'success');
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    const taskIndex = taskState.tasks.findIndex((item) => item.id === taskId);
    if (taskIndex === -1) return;

    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskElement) return;

    taskElement.classList.add('removing');
    setTimeout(() => {
        taskState.tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
        updateTaskStats();
        showTaskMessage('Task deleted successfully!', 'success');
    }, 300);
}

function editTask(taskId) {
    const task = taskState.tasks.find((item) => item.id === taskId);
    if (!task) return;

    taskState.editingTaskId = taskId;
    taskState.elements.taskInput.value = task.text;
    taskState.elements.taskInput.focus();
    taskState.elements.addBtn.textContent = 'Update Task';
    validateTaskInput();
}

function setFilter(filter) {
    taskState.currentFilter = filter;

    taskState.elements.filterBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    renderTasks();
}

function getFilteredTasks() {
    if (taskState.currentFilter === 'completed') {
        return taskState.tasks.filter((task) => task.completed);
    }
    if (taskState.currentFilter === 'pending') {
        return taskState.tasks.filter((task) => !task.completed);
    }
    return taskState.tasks;
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        taskState.elements.taskList.style.display = 'none';
        taskState.elements.emptyState.style.display = 'block';

        const emptyIcon = taskState.elements.emptyState.querySelector('.empty-icon');
        const emptyTitle = taskState.elements.emptyState.querySelector('h3');
        const emptyText = taskState.elements.emptyState.querySelector('p');

        if (taskState.currentFilter === 'completed') {
            emptyIcon.textContent = 'âœ…';
            emptyTitle.textContent = 'No completed tasks';
            emptyText.textContent = 'Complete some tasks to see them here!';
        } else if (taskState.currentFilter === 'pending') {
            emptyIcon.textContent = 'â³';
            emptyTitle.textContent = 'No pending tasks';
            emptyText.textContent = 'Great job! All tasks are completed!';
        } else {
            emptyIcon.textContent = 'ðŸ“‹';
            emptyTitle.textContent = 'No tasks yet';
            emptyText.textContent = 'Add your first task to get started!';
        }

        return;
    }

    taskState.elements.taskList.style.display = 'block';
    taskState.elements.emptyState.style.display = 'none';

    taskState.elements.taskList.innerHTML = filteredTasks.map((task) => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}" draggable="true">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}
                   onchange="taskManager.toggleTask('${task.id}')">
            <span class="task-text">${escapeTaskHtml(task.text)}</span>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="taskManager.editTask('${task.id}')">
                    âœï¸ Edit
                </button>
                <button class="task-btn delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                    ðŸ—‘ï¸ Delete
                </button>
            </div>
        </li>
    `).join('');
}

function updateTaskStats() {
    const total = taskState.tasks.length;
    const completed = taskState.tasks.filter((task) => task.completed).length;
    const pending = total - completed;

    taskState.elements.totalTasks.textContent = total;
    taskState.elements.completedTasks.textContent = completed;
    taskState.elements.pendingTasks.textContent = pending;

    updateProgressBar(completed, total);
}

function updateProgressBar(completed, total) {
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const completedStat = taskState.elements.completedTasks.parentElement;

    if (progress === 100 && total > 0) {
        completedStat.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    } else if (progress > 50) {
        completedStat.style.background = 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
    } else {
        completedStat.style.background = 'white';
    }
}

function clearCompleted() {
    const completedTasks = taskState.tasks.filter((task) => task.completed);

    if (completedTasks.length === 0) {
        showTaskMessage('No completed tasks to clear!', 'info');
        return;
    }

    if (confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
        taskState.tasks = taskState.tasks.filter((task) => !task.completed);
        saveTasks();
        renderTasks();
        updateTaskStats();
        showTaskMessage('Completed tasks cleared!', 'success');
    }
}

function clearAllTasks() {
    if (taskState.tasks.length === 0) {
        showTaskMessage('No tasks to clear!', 'info');
        return;
    }

    if (confirm(`Are you sure you want to delete all ${taskState.tasks.length} task(s)?`)) {
        taskState.tasks = [];
        saveTasks();
        renderTasks();
        updateTaskStats();
        showTaskMessage('All tasks cleared!', 'success');
    }
}

function validateTaskInput() {
    const text = taskState.elements.taskInput.value.trim();
    const isValid = text.length > 0 && text.length <= 100;

    taskState.elements.addBtn.disabled = !isValid;
    taskState.elements.addBtn.style.opacity = isValid ? '1' : '0.6';

    const charCount = taskState.elements.taskInput.value.length;
    if (charCount > 90) {
        taskState.elements.taskInput.style.borderColor = '#dc3545';
    } else if (charCount > 80) {
        taskState.elements.taskInput.style.borderColor = '#ffc107';
    } else {
        taskState.elements.taskInput.style.borderColor = '#e1e5e9';
    }
}

function showTaskMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    toast.style.background = colors[type] || colors.info;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function escapeTaskHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveTasks() {
    try {
        localStorage.setItem('taskManagerTasks', JSON.stringify(taskState.tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
        showTaskMessage('Error saving tasks to local storage', 'error');
    }
}

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('taskManagerTasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        showTaskMessage('Error loading tasks from local storage', 'error');
        return [];
    }
}

function handleTaskKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addTask();
    }

    if (e.key === 'Escape' && taskState.editingTaskId) {
        taskState.editingTaskId = null;
        taskState.elements.taskInput.value = '';
        taskState.elements.addBtn.textContent = 'Add Task';
        taskState.elements.taskInput.blur();
        validateTaskInput();
    }
}

function bindTaskDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-item')) {
            taskState.draggedTaskId = e.target.dataset.taskId;
            e.target.style.opacity = '0.5';
        }
    });

    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.style.opacity = '1';
            taskState.draggedTaskId = null;
        }
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!taskState.draggedTaskId || !e.target.classList.contains('task-item')) {
            return;
        }

        const targetTaskId = e.target.dataset.taskId;
        if (taskState.draggedTaskId === targetTaskId) {
            return;
        }

        const draggedIndex = taskState.tasks.findIndex((task) => task.id === taskState.draggedTaskId);
        const targetIndex = taskState.tasks.findIndex((task) => task.id === targetTaskId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            const draggedTaskObj = taskState.tasks.splice(draggedIndex, 1)[0];
            taskState.tasks.splice(targetIndex, 0, draggedTaskObj);
            saveTasks();
            renderTasks();
        }
    });
}

function createSampleTasks() {
    return [
        { id: generateTaskId(), text: 'Welcome to your Task Manager!', completed: false, createdAt: new Date().toISOString() },
        { id: generateTaskId(), text: 'Click the checkbox to mark tasks as complete', completed: true, createdAt: new Date().toISOString() },
        { id: generateTaskId(), text: 'Use the edit button to modify tasks', completed: false, createdAt: new Date().toISOString() }
    ];
}

function initTaskManager() {
    taskState.tasks = loadTasks();
    initializeTaskElements();
    bindTaskEvents();
    renderTasks();
    updateTaskStats();
    validateTaskInput();

    if (taskState.tasks.length === 0) {
        taskState.tasks = createSampleTasks();
        saveTasks();
        renderTasks();
        updateTaskStats();
    }
}

const taskManager = {
    addTask,
    toggleTask,
    deleteTask,
    editTask
};

window.taskManager = taskManager;
document.addEventListener('DOMContentLoaded', initTaskManager);
