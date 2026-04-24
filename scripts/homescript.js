// Home Page JavaScript
const homeState = {
    elements: {},
    settings: null
};

function initializeHomeElements() {
    homeState.elements = {
        totalTasks: document.getElementById('totalTasks'),
        totalMoods: document.getElementById('totalMoods'),
        totalEntries: document.getElementById('totalEntries'),
        streakDays: document.getElementById('streakDays'),
        tipsModal: document.getElementById('tipsModal'),
        aboutModal: document.getElementById('aboutModal'),
        settingsModal: document.getElementById('settingsModal'),
        themeSelect: document.getElementById('themeSelect'),
        autoSave: document.getElementById('autoSave'),
        notifications: document.getElementById('notifications')
    };
}

function bindHomeEvents() {
    document.querySelectorAll('.close').forEach((closeBtn) => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    [
        homeState.elements.tipsModal,
        homeState.elements.aboutModal,
        homeState.elements.settingsModal
    ].forEach((modal) => {
        if (!modal) return;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    document.querySelectorAll('.app-card').forEach((card) => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function loadHomeStats() {
    try {
        const taskManagerTasks = loadFromStorage('taskManagerTasks') || [];
        const completedTasks = taskManagerTasks.filter((task) => task.completed).length;
        homeState.elements.totalTasks.textContent = completedTasks;

        const moodTrackerMoods = loadFromStorage('moodTrackerMoods') || [];
        homeState.elements.totalMoods.textContent = moodTrackerMoods.length;

        const journalEntries = loadFromStorage('journalEntries') || [];
        homeState.elements.totalEntries.textContent = journalEntries.length;

        homeState.elements.streakDays.textContent = calculateStreak();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function calculateStreak() {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasActivity = hasActivityOnDate(dateStr);

        if (hasActivity) {
            streak++;
        } else if (i !== 0) {
            break;
        }
    }

    return streak;
}

function hasActivityOnDate(dateStr) {
    const tasks = loadFromStorage('taskManagerTasks') || [];
    const moods = loadFromStorage('moodTrackerMoods') || [];
    const entries = loadFromStorage('journalEntries') || [];

    return (
        tasks.some((task) => task.date === dateStr) ||
        moods.some((mood) => mood.date === dateStr) ||
        entries.some((entry) => entry.date === dateStr)
    );
}

function loadSettings() {
    homeState.settings = loadFromStorage('homeSettings') || {
        theme: 'default',
        autoSave: true,
        notifications: true
    };

    homeState.elements.themeSelect.value = homeState.settings.theme;
    homeState.elements.autoSave.checked = homeState.settings.autoSave;
    homeState.elements.notifications.checked = homeState.settings.notifications;

    applyTheme(homeState.settings.theme);
}

function saveHomeSettings() {
    homeState.settings = {
        theme: homeState.elements.themeSelect.value,
        autoSave: homeState.elements.autoSave.checked,
        notifications: homeState.elements.notifications.checked
    };

    saveToStorage('homeSettings', homeState.settings);
    applyTheme(homeState.settings.theme);
    showToast('Settings saved successfully!', 'success');
    homeState.elements.settingsModal.style.display = 'none';
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;

    if (theme === 'dark') {
        document.body.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
        document.body.style.color = '#ecf0f1';
    } else if (theme === 'light') {
        document.body.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
        document.body.style.color = '#333';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        document.body.style.color = '#333';
    }
}

function showTips() {
    homeState.elements.tipsModal.style.display = 'block';
}

function showAbout() {
    homeState.elements.aboutModal.style.display = 'block';
}

function showSettings() {
    homeState.elements.settingsModal.style.display = 'block';
}

function closeAllModals() {
    [
        homeState.elements.tipsModal,
        homeState.elements.aboutModal,
        homeState.elements.settingsModal
    ].forEach((modal) => {
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

function exportData() {
    const data = {
        tasks: loadFromStorage('taskManagerTasks') || [],
        moods: loadFromStorage('moodTrackerMoods') || [],
        entries: loadFromStorage('journalEntries') || [],
        settings: loadFromStorage('homeSettings') || {},
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `innercanvas-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showToast('Data exported successfully!', 'success');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
        return null;
    }
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
    }
}

function navigateToApp(appUrl) {
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        window.location.href = appUrl;
    }, 200);
}

function animateHomeCards() {
    const elements = document.querySelectorAll('.app-card, .stat-card, .quick-action-btn');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function handleHomeKeyboardShortcuts(e) {
    if (!document.querySelector('.modal[style*="block"]')) {
        if (e.key === '1') {
            navigateToApp('pages/taskmanager.html');
        } else if (e.key === '2') {
            navigateToApp('pages/moodtracker.html');
        } else if (e.key === '3') {
            navigateToApp('pages/journal.html');
        } else if (e.key === 't') {
            showTips();
        } else if (e.key === 's') {
            showSettings();
        }
    }
}

function bindHomeTouchSupport() {
    if (!('ontouchstart' in window)) {
        return;
    }

    document.addEventListener('touchstart', (e) => {
        if (
            e.target.classList.contains('app-btn') ||
            e.target.classList.contains('quick-action-btn') ||
            e.target.classList.contains('footer-link')
        ) {
            e.target.style.transform = 'scale(0.95)';
        }
    });

    document.addEventListener('touchend', (e) => {
        if (
            e.target.classList.contains('app-btn') ||
            e.target.classList.contains('quick-action-btn') ||
            e.target.classList.contains('footer-link')
        ) {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);
        }
    });
}

function initHomePage() {
    initializeHomeElements();
    bindHomeEvents();
    loadHomeStats();
    loadSettings();
    animateHomeCards();
    bindHomeTouchSupport();

    setTimeout(() => {
        loadHomeStats();
    }, 100);
}

document.addEventListener('DOMContentLoaded', initHomePage);
document.addEventListener('keydown', handleHomeKeyboardShortcuts);
