// Home Page JavaScript
class HomePage {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadStats();
        this.loadRecentActivity();
        this.loadSettings();
    }

    initializeElements() {
        // Stats elements
        this.totalTasks = document.getElementById('totalTasks');
        this.totalMoods = document.getElementById('totalMoods');
        this.totalEntries = document.getElementById('totalEntries');
        this.streakDays = document.getElementById('streakDays');

        // Activity elements
        this.recentActivity = document.getElementById('recentActivity');

        // Modal elements
        this.tipsModal = document.getElementById('tipsModal');
        this.aboutModal = document.getElementById('aboutModal');
        this.settingsModal = document.getElementById('settingsModal');

        // Settings elements
        this.themeSelect = document.getElementById('themeSelect');
        this.autoSave = document.getElementById('autoSave');
        this.notifications = document.getElementById('notifications');
    }

    bindEvents() {
        // Modal events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });

        // Close modals on outside click
        [this.tipsModal, this.aboutModal, this.settingsModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // App card hover effects
        document.querySelectorAll('.app-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    loadStats() {
        try {
            // Load task manager stats
            const taskManagerTasks = this.loadFromStorage('taskManagerTasks') || [];
            const completedTasks = taskManagerTasks.filter(task => task.completed).length;
            this.totalTasks.textContent = completedTasks;

            // Load mood tracker stats
            const moodTrackerMoods = this.loadFromStorage('moodTrackerMoods') || [];
            this.totalMoods.textContent = moodTrackerMoods.length;

            // Load journal stats
            const journalEntries = this.loadFromStorage('journalEntries') || [];
            this.totalEntries.textContent = journalEntries.length;

            // Calculate streak (days with any activity)
            const streak = this.calculateStreak();
            this.streakDays.textContent = streak;

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    calculateStreak() {
        const today = new Date();
        let streak = 0;

        // Check last 30 days for activity
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = checkDate.toISOString().split('T')[0];

            // Check if there's any activity on this date
            const hasActivity = this.hasActivityOnDate(dateStr);

            if (hasActivity) {
                streak++;
            } else if (i === 0) {
                // If today has no activity, continue checking
                continue;
            } else {
                // If a previous day has no activity, break the streak
                break;
            }
        }

        return streak;
    }

    hasActivityOnDate(dateStr) {
        // Check task manager
        const tasks = this.loadFromStorage('taskManagerTasks') || [];
        const hasTasks = tasks.some(task => task.date === dateStr);

        // Check mood tracker
        const moods = this.loadFromStorage('moodTrackerMoods') || [];
        const hasMoods = moods.some(mood => mood.date === dateStr);

        // Check journal
        const entries = this.loadFromStorage('journalEntries') || [];
        const hasEntries = entries.some(entry => entry.date === dateStr);

        return hasTasks || hasMoods || hasEntries;
    }

    loadRecentActivity() {
        const activities = this.getRecentActivities();

        if (activities.length === 0) {
            this.recentActivity.innerHTML = `
                <div class="activity-item">
                    <span class="activity-icon">🎉</span>
                    <span class="activity-text">Welcome to InnerCanvas! Start by exploring your productivity tools.</span>
                    <span class="activity-time">Just now</span>
                </div>
            `;
            return;
        }

        this.recentActivity.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <span class="activity-icon">${activity.icon}</span>
                <span class="activity-text">${activity.text}</span>
                <span class="activity-time">${activity.time}</span>
            </div>
        `).join('');
    }

    getRecentActivities() {
        const activities = [];
        const now = new Date();

        // Get recent tasks
        const tasks = this.loadFromStorage('taskManagerTasks') || [];
        const recentTasks = tasks
            .filter(task => task.completed)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        recentTasks.forEach(task => {
            activities.push({
                icon: '✅',
                text: `Completed task: "${task.text}"`,
                time: this.getTimeAgo(new Date(task.createdAt)),
                timestamp: new Date(task.createdAt)
            });
        });

        // Get recent moods
        const moods = this.loadFromStorage('moodTrackerMoods') || [];
        const recentMoods = moods
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        recentMoods.forEach(mood => {
            activities.push({
                icon: mood.emoji,
                text: `Recorded mood: ${mood.mood}`,
                time: this.getTimeAgo(new Date(mood.createdAt)),
                timestamp: new Date(mood.createdAt)
            });
        });

        // Get recent journal entries
        const entries = this.loadFromStorage('journalEntries') || [];
        const recentEntries = entries
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        recentEntries.forEach(entry => {
            activities.push({
                icon: '📝',
                text: `Created journal entry: "${entry.title}"`,
                time: this.getTimeAgo(new Date(entry.createdAt)),
                timestamp: new Date(entry.createdAt)
            });
        });

        // Sort all activities by timestamp and take the most recent 5
        return activities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    loadSettings() {
        const settings = this.loadFromStorage('homeSettings') || {
            theme: 'default',
            autoSave: true,
            notifications: true
        };

        this.themeSelect.value = settings.theme;
        this.autoSave.checked = settings.autoSave;
        this.notifications.checked = settings.notifications;

        this.applyTheme(settings.theme);
    }

    saveSettings() {
        const settings = {
            theme: this.themeSelect.value,
            autoSave: this.autoSave.checked,
            notifications: this.notifications.checked
        };

        this.saveToStorage('homeSettings', settings);
        this.applyTheme(settings.theme);
        this.showToast('Settings saved successfully!', 'success');
        this.settingsModal.style.display = 'none';
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme}`;

        // Add theme-specific styles
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

    showTips() {
        this.tipsModal.style.display = 'block';
    }

    showAbout() {
        this.aboutModal.style.display = 'block';
    }

    showSettings() {
        this.settingsModal.style.display = 'block';
    }

    closeAllModals() {
        [this.tipsModal, this.aboutModal, this.settingsModal].forEach(modal => {
            modal.style.display = 'none';
        });
    }

    exportData() {
        const data = {
            tasks: this.loadFromStorage('taskManagerTasks') || [],
            moods: this.loadFromStorage('moodTrackerMoods') || [],
            entries: this.loadFromStorage('journalEntries') || [],
            settings: this.loadFromStorage('homeSettings') || {},
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `innercanvas-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showToast('Data exported successfully!', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Local Storage Methods
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key} from storage:`, error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
        }
    }
}

// Navigation function
function navigateToApp(appUrl) {
    // Add a small delay for smooth transition
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        window.location.href = appUrl;
    }, 200);
}

// Initialize the home page when the page loads
let homePage;

document.addEventListener('DOMContentLoaded', () => {
    homePage = new HomePage();

    // Add some sample activity if no data exists
    setTimeout(() => {
        homePage.loadStats();
        homePage.loadRecentActivity();
    }, 100);
});

// Global functions for HTML onclick handlers
function showTips() {
    if (homePage) {
        homePage.showTips();
    }
}

function showAbout() {
    if (homePage) {
        homePage.showAbout();
    }
}

function showSettings() {
    if (homePage) {
        homePage.showSettings();
    }
}

function exportData() {
    if (homePage) {
        homePage.exportData();
    }
}

function saveSettings() {
    if (homePage) {
        homePage.saveSettings();
    }
}

// Add smooth page transitions
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to all elements
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
});

// Add keyboard shortcuts for quick navigation
document.addEventListener('keydown', (e) => {
    // Only trigger if no modal is open
    if (!document.querySelector('.modal[style*="block"]')) {
        if (e.key === '1') {
            navigateToApp('taskmanager.html');
        } else if (e.key === '2') {
            navigateToApp('moodtracker.html');
        } else if (e.key === '3') {
            navigateToApp('journal.html');
        } else if (e.key === 't') {
            homePage.showTips();
        } else if (e.key === 's') {
            homePage.showSettings();
        }
    }
});

// Add touch support for mobile
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', (e) => {
        // Add touch feedback to interactive elements
        if (e.target.classList.contains('app-btn') ||
            e.target.classList.contains('quick-action-btn') ||
            e.target.classList.contains('footer-link')) {
            e.target.style.transform = 'scale(0.95)';
        }
    });

    document.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('app-btn') ||
            e.target.classList.contains('quick-action-btn') ||
            e.target.classList.contains('footer-link')) {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);
        }
    });
}
