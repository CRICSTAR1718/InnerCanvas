// Task Manager JavaScript

let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

let taskInput;
let addBtn;
let taskList;
let emptyState;
let totalTasks;
let completedTasks;
let pendingTasks;
let filterButtons;
let clearCompletedBtn;
let clearAllBtn;

function setupElements() {
    taskInput = document.getElementById('taskInput');
    addBtn = document.getElementById('addBtn');
    taskList = document.getElementById('taskList');
    emptyState = document.getElementById('emptyState');
    totalTasks = document.getElementById('totalTasks');
    completedTasks = document.getElementById('completedTasks');
    pendingTasks = document.getElementById('pendingTasks');
    filterButtons = document.querySelectorAll('.filter-btn');
    clearCompletedBtn = document.getElementById('clearCompleted');
    clearAllBtn = document.getElementById('clearAll');
}

function setupEvents() {
    addBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    taskInput.addEventListener('input', validateInput);

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            changeFilter(button.dataset.filter);
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    clearAllBtn.addEventListener('click', clearAllTasks);

    document.addEventListener('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            addTask();
        }

        if (event.key === 'Escape' && editingTaskId) {
            cancelEditing();
        }
    });
}

function createId() {
    return Date.now().toString();
}

function addTask() {
    const text = taskInput.value.trim();

    if (text === '') {
        showMessage('Please enter a task!', 'error');
        return;
    }

    if (editingTaskId) {
        updateTask(editingTaskId, text);
    } else {
        const newTask = {
            id: createId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        showMessage('Task added successfully!', 'success');
    }

    taskInput.value = '';
    saveTasks();
    renderTasks();
    updateStats();
    resetAddButton();
    validateInput();
}

function updateTask(taskId, newText) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            tasks[i].text = newText;
            break;
        }
    }

    editingTaskId = null;
    showMessage('Task updated successfully!', 'success');
}

function toggleTask(taskId) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            tasks[i].completed = !tasks[i].completed;
            break;
        }
    }

    saveTasks();
    renderTasks();
    updateStats();
    showMessage('Task updated!', 'success');
}

function deleteTask(taskId) {
    const userConfirmed = confirm('Are you sure you want to delete this task?');

    if (!userConfirmed) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return task.id !== taskId;
    });

    saveTasks();
    renderTasks();
    updateStats();
    showMessage('Task deleted successfully!', 'success');
}

function editTask(taskId) {
    const task = tasks.find(function (item) {
        return item.id === taskId;
    });

    if (!task) {
        return;
    }

    editingTaskId = taskId;
    taskInput.value = task.text;
    taskInput.focus();
    addBtn.textContent = 'Update Task';
    validateInput();
}

function cancelEditing() {
    editingTaskId = null;
    taskInput.value = '';
    resetAddButton();
    taskInput.blur();
    validateInput();
}

function resetAddButton() {
    addBtn.textContent = 'Add Task';
}

function changeFilter(filter) {
    currentFilter = filter;

    filterButtons.forEach(function (button) {
        button.classList.remove('active');

        if (button.dataset.filter === filter) {
            button.classList.add('active');
        }
    });

    renderTasks();
}

function getTasksToShow() {
    if (currentFilter === 'completed') {
        return tasks.filter(function (task) {
            return task.completed;
        });
    }

    if (currentFilter === 'pending') {
        return tasks.filter(function (task) {
            return !task.completed;
        });
    }

    return tasks;
}

function renderTasks() {
    const visibleTasks = getTasksToShow();

    if (visibleTasks.length === 0) {
        showEmptyState();
        return;
    }

    taskList.style.display = 'block';
    emptyState.style.display = 'none';

    let html = '';

    visibleTasks.forEach(function (task) {
        html += `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="taskManager.toggleTask('${task.id}')"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="taskManager.editTask('${task.id}')">
                        Edit
                    </button>
                    <button class="task-btn delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                        Delete
                    </button>
                </div>
            </li>
        `;
    });

    taskList.innerHTML = html;
}

function showEmptyState() {
    const emptyIcon = emptyState.querySelector('.empty-icon');
    const emptyTitle = emptyState.querySelector('h3');
    const emptyText = emptyState.querySelector('p');

    taskList.style.display = 'none';
    emptyState.style.display = 'block';

    if (currentFilter === 'completed') {
        emptyIcon.textContent = '✅';
        emptyTitle.textContent = 'No completed tasks';
        emptyText.textContent = 'Complete some tasks to see them here!';
        return;
    }

    if (currentFilter === 'pending') {
        emptyIcon.textContent = '⏳';
        emptyTitle.textContent = 'No pending tasks';
        emptyText.textContent = 'Great job! All tasks are completed!';
        return;
    }

    emptyIcon.textContent = '📋';
    emptyTitle.textContent = 'No tasks yet';
    emptyText.textContent = 'Add your first task to get started!';
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;
    const pending = total - completed;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
}

function clearCompletedTasks() {
    const completedCount = tasks.filter(function (task) {
        return task.completed;
    }).length;

    if (completedCount === 0) {
        showMessage('No completed tasks to clear!', 'info');
        return;
    }

    const userConfirmed = confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`);

    if (!userConfirmed) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return !task.completed;
    });

    saveTasks();
    renderTasks();
    updateStats();
    showMessage('Completed tasks cleared!', 'success');
}

function clearAllTasks() {
    if (tasks.length === 0) {
        showMessage('No tasks to clear!', 'info');
        return;
    }

    const userConfirmed = confirm(`Are you sure you want to delete all ${tasks.length} task(s)?`);

    if (!userConfirmed) {
        return;
    }

    tasks = [];
    saveTasks();
    renderTasks();
    updateStats();
    showMessage('All tasks cleared!', 'success');
}

function validateInput() {
    const text = taskInput.value.trim();
    const isValid = text.length > 0 && text.length <= 100;
    const characterCount = taskInput.value.length;

    addBtn.disabled = !isValid;
    addBtn.style.opacity = isValid ? '1' : '0.6';

    if (characterCount > 90) {
        taskInput.style.borderColor = '#dc3545';
    } else if (characterCount > 80) {
        taskInput.style.borderColor = '#ffc107';
    } else {
        taskInput.style.borderColor = '#e1e5e9';
    }
}

function showMessage(message, type) {
    const toast = document.createElement('div');
    toast.textContent = message;

    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '15px 20px';
    toast.style.borderRadius = '10px';
    toast.style.color = 'white';
    toast.style.fontWeight = '500';
    toast.style.zIndex = '1000';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'transform 0.3s ease';
    toast.style.maxWidth = '300px';
    toast.style.wordWrap = 'break-word';

    if (type === 'success') {
        toast.style.background = '#28a745';
    } else if (type === 'error') {
        toast.style.background = '#dc3545';
    } else if (type === 'warning') {
        toast.style.background = '#ffc107';
    } else {
        toast.style.background = '#17a2b8';
    }

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(function () {
        toast.style.transform = 'translateX(100%)';

        setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveTasks() {
    try {
        localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
        showMessage('Error saving tasks to local storage', 'error');
    }
}

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('taskManagerTasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        showMessage('Error loading tasks from local storage', 'error');
        return [];
    }
}

function addSampleTasksIfNeeded() {
    if (tasks.length > 0) {
        return;
    }

    tasks = [
        {
            id: createId() + '-1',
            text: 'Welcome to your Task Manager!',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: createId() + '-2',
            text: 'Click the checkbox to mark tasks as complete',
            completed: true,
            createdAt: new Date().toISOString()
        },
        {
            id: createId() + '-3',
            text: 'Use the edit button to modify tasks',
            completed: false,
            createdAt: new Date().toISOString()
        }
    ];

    saveTasks();
}

function startTaskManager() {
    tasks = loadTasks();
    setupElements();
    setupEvents();
    addSampleTasksIfNeeded();
    renderTasks();
    updateStats();
    validateInput();
}

const taskManager = {
    toggleTask: toggleTask,
    editTask: editTask,
    deleteTask: deleteTask
};

window.taskManager = taskManager;
document.addEventListener('DOMContentLoaded', startTaskManager);
