// Mood Tracker JavaScript
class MoodTracker {
    constructor() {
        this.moods = this.loadMoods();
        this.currentDate = new Date();
        this.selectedEmoji = null;
        this.editingMoodId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.setCurrentDate();
        this.renderMoodHistory();
        this.renderCalendar();
        this.updateStats();
    }
    
    initializeElements() {
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Add mood form elements
        this.emojiBtns = document.querySelectorAll('.emoji-btn');
        this.moodTitle = document.getElementById('moodTitle');
        this.moodNote = document.getElementById('moodNote');
        this.moodDate = document.getElementById('moodDate');
        this.saveMoodBtn = document.getElementById('saveMoodBtn');
        
        // Mood history elements
        this.moodList = document.getElementById('moodList');
        this.emptyHistory = document.getElementById('emptyHistory');
        this.moodFilter = document.getElementById('moodFilter');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // Stats elements
        this.totalMoods = document.getElementById('totalMoods');
        this.currentStreak = document.getElementById('currentStreak');
        this.mostCommonMood = document.getElementById('mostCommonMood');
        
        // Calendar elements
        this.currentMonthEl = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.calendarDays = document.getElementById('calendarDays');
        
        // Modal elements
        this.modal = document.getElementById('moodModal');
        this.modalContent = document.getElementById('modalContent');
        this.closeModal = document.querySelector('.close');
    }
    
    bindEvents() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Emoji selection
        this.emojiBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectEmoji(e.target.closest('.emoji-btn')));
        });
        
        // Form submission
        this.saveMoodBtn.addEventListener('click', () => this.saveMood());
        
        // Form validation
        this.moodTitle.addEventListener('input', () => this.validateForm());
        this.moodNote.addEventListener('input', () => this.validateForm());
        
        // Mood history
        this.moodFilter.addEventListener('change', () => this.filterMoods());
        this.clearHistoryBtn.addEventListener('click', () => this.clearAllMoods());
        
        // Calendar navigation
        this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
        
        // Modal
        this.closeModal.addEventListener('click', () => this.closeModalWindow());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModalWindow();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModalWindow();
        });
    }
    
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        this.moodDate.value = today;
    }
    
    switchTab(tabName) {
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Update tab content
        this.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabName) {
                content.classList.add('active');
            }
        });
        
        // Refresh calendar if switching to calendar tab
        if (tabName === 'calendar') {
            this.renderCalendar();
        }
    }
    
    selectEmoji(emojiBtn) {
        // Remove previous selection
        this.emojiBtns.forEach(btn => btn.classList.remove('selected'));
        
        // Add selection to clicked button
        emojiBtn.classList.add('selected');
        
        // Store selected emoji and mood
        this.selectedEmoji = {
            emoji: emojiBtn.dataset.emoji,
            mood: emojiBtn.dataset.mood
        };
        
        this.validateForm();
    }
    
    validateForm() {
        const hasEmoji = this.selectedEmoji !== null;
        const hasTitle = this.moodTitle.value.trim().length > 0;
        const hasNote = this.moodNote.value.trim().length > 0;
        
        // Enable save button if at least emoji is selected
        this.saveMoodBtn.disabled = !hasEmoji;
        
        // Update button text based on editing state
        if (this.editingMoodId) {
            this.saveMoodBtn.innerHTML = '<span class="btn-icon">✏️</span>Update Mood';
        } else {
            this.saveMoodBtn.innerHTML = '<span class="btn-icon">💾</span>Save Mood';
        }
    }
    
    saveMood() {
        if (!this.selectedEmoji) {
            this.showMessage('Please select a mood emoji!', 'error');
            return;
        }
        
        const moodData = {
            id: this.editingMoodId || this.generateId(),
            emoji: this.selectedEmoji.emoji,
            mood: this.selectedEmoji.mood,
            title: this.moodTitle.value.trim() || `${this.selectedEmoji.mood} Day`,
            note: this.moodNote.value.trim(),
            date: this.moodDate.value,
            createdAt: this.editingMoodId ? 
                this.moods.find(m => m.id === this.editingMoodId).createdAt : 
                new Date().toISOString()
        };
        
        if (this.editingMoodId) {
            // Update existing mood
            const index = this.moods.findIndex(m => m.id === this.editingMoodId);
            if (index !== -1) {
                this.moods[index] = moodData;
                this.showMessage('Mood updated successfully!', 'success');
            }
            this.editingMoodId = null;
        } else {
            // Add new mood
            this.moods.unshift(moodData);
            this.showMessage('Mood saved successfully!', 'success');
        }
        
        this.resetForm();
        this.saveMoods();
        this.renderMoodHistory();
        this.updateStats();
        
        // Switch to mood history tab to show the new entry
        this.switchTab('mood-list');
    }
    
    resetForm() {
        this.selectedEmoji = null;
        this.moodTitle.value = '';
        this.moodNote.value = '';
        this.setCurrentDate();
        
        // Remove emoji selection
        this.emojiBtns.forEach(btn => btn.classList.remove('selected'));
        
        this.validateForm();
    }
    
    editMood(moodId) {
        const mood = this.moods.find(m => m.id === moodId);
        if (!mood) return;
        
        this.editingMoodId = moodId;
        
        // Switch to add mood tab
        this.switchTab('add-mood');
        
        // Fill form with mood data
        this.moodTitle.value = mood.title;
        this.moodNote.value = mood.note;
        this.moodDate.value = mood.date;
        
        // Select the emoji
        const emojiBtn = document.querySelector(`[data-emoji="${mood.emoji}"]`);
        if (emojiBtn) {
            this.selectEmoji(emojiBtn);
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    deleteMood(moodId) {
        if (confirm('Are you sure you want to delete this mood entry?')) {
            this.moods = this.moods.filter(m => m.id !== moodId);
            this.saveMoods();
            this.renderMoodHistory();
            this.updateStats();
            this.showMessage('Mood deleted successfully!', 'success');
        }
    }
    
    filterMoods() {
        this.renderMoodHistory();
    }
    
    renderMoodHistory() {
        const filter = this.moodFilter.value;
        let filteredMoods = this.moods;
        
        if (filter !== 'all') {
            filteredMoods = this.moods.filter(mood => mood.emoji === filter);
        }
        
        if (filteredMoods.length === 0) {
            this.moodList.style.display = 'none';
            this.emptyHistory.style.display = 'block';
            
            // Update empty state message based on filter
            const emptyIcon = this.emptyHistory.querySelector('.empty-icon');
            const emptyTitle = this.emptyHistory.querySelector('h3');
            const emptyText = this.emptyHistory.querySelector('p');
            
            if (filter === 'all') {
                emptyIcon.textContent = '📝';
                emptyTitle.textContent = 'No moods recorded yet';
                emptyText.textContent = 'Start tracking your emotions to see your mood history here!';
            } else {
                const moodName = this.moodFilter.options[this.moodFilter.selectedIndex].text;
                emptyIcon.textContent = this.moodFilter.value;
                emptyTitle.textContent = `No ${moodName} moods`;
                emptyText.textContent = `You haven't recorded any ${moodName.toLowerCase()} moods yet.`;
            }
        } else {
            this.moodList.style.display = 'block';
            this.emptyHistory.style.display = 'none';
            
            this.moodList.innerHTML = filteredMoods.map(mood => `
                <div class="mood-item" onclick="moodTracker.showMoodDetail('${mood.id}')">
                    <div class="mood-emoji">${mood.emoji}</div>
                    <div class="mood-content">
                        <div class="mood-title">${this.escapeHtml(mood.title)}</div>
                        ${mood.note ? `<div class="mood-note">${this.escapeHtml(mood.note)}</div>` : ''}
                        <div class="mood-date">${this.formatDate(mood.date)}</div>
                    </div>
                    <div class="mood-actions" onclick="event.stopPropagation()">
                        <button class="action-btn edit-btn" onclick="moodTracker.editMood('${mood.id}')">
                            ✏️ Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="moodTracker.deleteMood('${mood.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    showMoodDetail(moodId) {
        const mood = this.moods.find(m => m.id === moodId);
        if (!mood) return;
        
        this.modalContent.innerHTML = `
            <div class="modal-mood">
                <div class="modal-emoji">${mood.emoji}</div>
                <div class="modal-title">${this.escapeHtml(mood.title)}</div>
                ${mood.note ? `<div class="modal-note">${this.escapeHtml(mood.note)}</div>` : ''}
                <div class="modal-date">${this.formatDate(mood.date)}</div>
            </div>
        `;
        
        this.modal.style.display = 'block';
    }
    
    closeModalWindow() {
        this.modal.style.display = 'none';
    }
    
    updateStats() {
        this.totalMoods.textContent = this.moods.length;
        
        // Calculate streak
        const streak = this.calculateStreak();
        this.currentStreak.textContent = streak;
        
        // Find most common mood
        const mostCommon = this.getMostCommonMood();
        this.mostCommonMood.textContent = mostCommon || '-';
    }
    
    calculateStreak() {
        if (this.moods.length === 0) return 0;
        
        const sortedMoods = [...this.moods].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = new Date();
        
        // Start from today and work backwards
        for (let i = 0; i < sortedMoods.length; i++) {
            const moodDate = new Date(sortedMoods[i].date);
            const daysDiff = Math.floor((currentDate - moodDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
            } else if (daysDiff > streak) {
                break;
            }
        }
        
        return streak;
    }
    
    getMostCommonMood() {
        if (this.moods.length === 0) return null;
        
        const moodCounts = {};
        this.moods.forEach(mood => {
            moodCounts[mood.emoji] = (moodCounts[mood.emoji] || 0) + 1;
        });
        
        const mostCommon = Object.entries(moodCounts)
            .sort(([,a], [,b]) => b - a)[0];
        
        return mostCommon ? mostCommon[0] : null;
    }
    
    clearAllMoods() {
        if (this.moods.length === 0) {
            this.showMessage('No moods to clear!', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to delete all ${this.moods.length} mood entries?`)) {
            this.moods = [];
            this.saveMoods();
            this.renderMoodHistory();
            this.updateStats();
            this.showMessage('All moods cleared!', 'success');
        }
    }
    
    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }
    
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.currentMonthEl.textContent = `${monthNames[month]} ${year}`;
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Clear calendar
        this.calendarDays.innerHTML = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            emptyDay.textContent = '';
            this.calendarDays.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Check if this day has a mood
            const dayMoods = this.moods.filter(mood => mood.date === dateStr);
            
            if (dayMoods.length > 0) {
                dayElement.classList.add('has-mood');
                dayElement.innerHTML = `
                    ${day}
                    <span class="day-emoji">${dayMoods[0].emoji}</span>
                `;
                dayElement.title = `${dayMoods.length} mood${dayMoods.length > 1 ? 's' : ''} recorded`;
            }
            
            // Highlight today
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Add click event
            dayElement.addEventListener('click', () => this.showDayMoods(dateStr, dayMoods));
            
            this.calendarDays.appendChild(dayElement);
        }
    }
    
    showDayMoods(dateStr, moods) {
        if (moods.length === 0) {
            this.showMessage(`No moods recorded for ${this.formatDate(dateStr)}`, 'info');
            return;
        }
        
        const moodList = moods.map(mood => 
            `${mood.emoji} ${mood.title}${mood.note ? ` - ${mood.note}` : ''}`
        ).join('\n');
        
        alert(`Moods for ${this.formatDate(dateStr)}:\n\n${moodList}`);
    }
    
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
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
            wordWrap: 'break-word',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
        });
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        toast.style.background = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Local Storage Methods
    saveMoods() {
        try {
            localStorage.setItem('moodTrackerMoods', JSON.stringify(this.moods));
        } catch (error) {
            console.error('Error saving moods:', error);
            this.showMessage('Error saving moods to local storage', 'error');
        }
    }
    
    loadMoods() {
        try {
            const savedMoods = localStorage.getItem('moodTrackerMoods');
            return savedMoods ? JSON.parse(savedMoods) : [];
        } catch (error) {
            console.error('Error loading moods:', error);
            this.showMessage('Error loading moods from local storage', 'error');
            return [];
        }
    }
}

// Initialize the mood tracker when the page loads
let moodTracker;

document.addEventListener('DOMContentLoaded', () => {
    moodTracker = new MoodTracker();
    
    // Add some sample moods if none exist
    if (moodTracker.moods.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const sampleMoods = [
            {
                id: moodTracker.generateId(),
                emoji: '😊',
                mood: 'Happy',
                title: 'Welcome to Mood Tracker!',
                note: 'This is your first mood entry. Start tracking your daily emotions!',
                date: today,
                createdAt: new Date().toISOString()
            },
            {
                id: moodTracker.generateId(),
                emoji: '😌',
                mood: 'Calm',
                title: 'Peaceful evening',
                note: 'Enjoying a quiet moment with a good book.',
                date: yesterday,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        moodTracker.moods = sampleMoods;
        moodTracker.saveMoods();
        moodTracker.renderMoodHistory();
        moodTracker.updateStats();
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to save mood
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (moodTracker.saveMoodBtn && !moodTracker.saveMoodBtn.disabled) {
            moodTracker.saveMood();
        }
    }
    
    // Number keys 1-9 to quickly select emojis
    if (e.key >= '1' && e.key <= '9') {
        const emojiIndex = parseInt(e.key) - 1;
        const emojiBtns = document.querySelectorAll('.emoji-btn');
        if (emojiBtns[emojiIndex]) {
            moodTracker.selectEmoji(emojiBtns[emojiIndex]);
        }
    }
});

// Add touch support for mobile
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', (e) => {
        // Add touch feedback to buttons
        if (e.target.classList.contains('emoji-btn') || 
            e.target.classList.contains('tab-btn') ||
            e.target.classList.contains('save-btn')) {
            e.target.style.transform = 'scale(0.95)';
        }
    });
    
    document.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('emoji-btn') || 
            e.target.classList.contains('tab-btn') ||
            e.target.classList.contains('save-btn')) {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);
        }
    });
}
