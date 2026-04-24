// Mood Tracker JavaScript

let moods = [];
let currentCalendarDate = new Date();
let selectedMood = null;
let editingMoodId = null;

let tabButtons;
let tabContents;
let emojiButtons;
let moodTitleInput;
let moodNoteInput;
let moodDateInput;
let saveMoodButton;
let moodList;
let emptyHistory;
let moodFilter;
let clearHistoryButton;
let totalMoodsText;
let currentStreakText;
let mostCommonMoodText;
let currentMonthText;
let prevMonthButton;
let nextMonthButton;
let calendarDays;
let moodModal;
let modalContent;
let closeModalButton;

function setupMoodElements() {
    tabButtons = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    emojiButtons = document.querySelectorAll('.emoji-btn');
    moodTitleInput = document.getElementById('moodTitle');
    moodNoteInput = document.getElementById('moodNote');
    moodDateInput = document.getElementById('moodDate');
    saveMoodButton = document.getElementById('saveMoodBtn');
    moodList = document.getElementById('moodList');
    emptyHistory = document.getElementById('emptyHistory');
    moodFilter = document.getElementById('moodFilter');
    clearHistoryButton = document.getElementById('clearHistoryBtn');
    totalMoodsText = document.getElementById('totalMoods');
    currentStreakText = document.getElementById('currentStreak');
    mostCommonMoodText = document.getElementById('mostCommonMood');
    currentMonthText = document.getElementById('currentMonth');
    prevMonthButton = document.getElementById('prevMonth');
    nextMonthButton = document.getElementById('nextMonth');
    calendarDays = document.getElementById('calendarDays');
    moodModal = document.getElementById('moodModal');
    modalContent = document.getElementById('modalContent');
    closeModalButton = document.querySelector('.close');
}

function setupMoodEvents() {
    tabButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            switchTab(button.dataset.tab);
        });
    });

    emojiButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            selectEmoji(button);
        });
    });

    saveMoodButton.addEventListener('click', saveMood);
    moodTitleInput.addEventListener('input', updateSaveMoodButton);
    moodNoteInput.addEventListener('input', updateSaveMoodButton);
    moodFilter.addEventListener('change', renderMoodHistory);
    clearHistoryButton.addEventListener('click', clearAllMoods);
    prevMonthButton.addEventListener('click', function () {
        changeMonth(-1);
    });
    nextMonthButton.addEventListener('click', function () {
        changeMonth(1);
    });

    closeModalButton.addEventListener('click', closeMoodModal);
    moodModal.addEventListener('click', function (event) {
        if (event.target === moodModal) {
            closeMoodModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMoodModal();
        }

        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            if (!saveMoodButton.disabled) {
                saveMood();
            }
        }

        if (event.key >= '1' && event.key <= '9') {
            const index = Number(event.key) - 1;
            if (emojiButtons[index]) {
                selectEmoji(emojiButtons[index]);
            }
        }
    });

    setupMoodTouchSupport();
}

function setupMoodTouchSupport() {
    if (!('ontouchstart' in window)) {
        return;
    }

    document.addEventListener('touchstart', function (event) {
        if (
            event.target.classList.contains('emoji-btn') ||
            event.target.classList.contains('tab-btn') ||
            event.target.classList.contains('save-btn')
        ) {
            event.target.style.transform = 'scale(0.95)';
        }
    });

    document.addEventListener('touchend', function (event) {
        if (
            event.target.classList.contains('emoji-btn') ||
            event.target.classList.contains('tab-btn') ||
            event.target.classList.contains('save-btn')
        ) {
            setTimeout(function () {
                event.target.style.transform = '';
            }, 100);
        }
    });
}

function setTodayDate() {
    moodDateInput.value = new Date().toISOString().split('T')[0];
}

function switchTab(tabName) {
    tabButtons.forEach(function (button) {
        button.classList.remove('active');
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        }
    });

    tabContents.forEach(function (content) {
        content.classList.remove('active');
        if (content.id === tabName) {
            content.classList.add('active');
        }
    });

    if (tabName === 'calendar') {
        renderCalendar();
    }
}

function selectEmoji(button) {
    emojiButtons.forEach(function (emojiButton) {
        emojiButton.classList.remove('selected');
    });

    button.classList.add('selected');

    selectedMood = {
        emoji: button.dataset.emoji,
        mood: button.dataset.mood
    };

    updateSaveMoodButton();
}

function updateSaveMoodButton() {
    saveMoodButton.disabled = selectedMood === null;

    if (editingMoodId) {
        saveMoodButton.innerHTML = '<span class="btn-icon">✏️</span>Update Mood';
    } else {
        saveMoodButton.innerHTML = '<span class="btn-icon">💾</span>Save Mood';
    }
}

function saveMood() {
    if (!selectedMood) {
        showMoodMessage('Please select a mood emoji!', 'error');
        return;
    }

    let createdAt = new Date().toISOString();

    if (editingMoodId) {
        const oldMood = moods.find(function (item) {
            return item.id === editingMoodId;
        });
        if (oldMood) {
            createdAt = oldMood.createdAt;
        }
    }

    const moodData = {
        id: editingMoodId || createMoodId(),
        emoji: selectedMood.emoji,
        mood: selectedMood.mood,
        title: moodTitleInput.value.trim() || `${selectedMood.mood} Day`,
        note: moodNoteInput.value.trim(),
        date: moodDateInput.value,
        createdAt: createdAt
    };

    if (editingMoodId) {
        moods = moods.map(function (item) {
            return item.id === editingMoodId ? moodData : item;
        });
        showMoodMessage('Mood updated successfully!', 'success');
        editingMoodId = null;
    } else {
        moods.unshift(moodData);
        showMoodMessage('Mood saved successfully!', 'success');
    }

    resetMoodForm();
    saveMoods();
    renderMoodHistory();
    updateMoodStats();
    switchTab('mood-list');
}

function resetMoodForm() {
    selectedMood = null;
    moodTitleInput.value = '';
    moodNoteInput.value = '';
    setTodayDate();

    emojiButtons.forEach(function (button) {
        button.classList.remove('selected');
    });

    updateSaveMoodButton();
}

function editMood(moodId) {
    const mood = moods.find(function (item) {
        return item.id === moodId;
    });

    if (!mood) {
        return;
    }

    editingMoodId = moodId;
    switchTab('add-mood');
    moodTitleInput.value = mood.title;
    moodNoteInput.value = mood.note;
    moodDateInput.value = mood.date;

    const emojiButton = document.querySelector(`[data-emoji="${mood.emoji}"]`);
    if (emojiButton) {
        selectEmoji(emojiButton);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteMood(moodId) {
    const confirmed = confirm('Are you sure you want to delete this mood entry?');
    if (!confirmed) {
        return;
    }

    moods = moods.filter(function (item) {
        return item.id !== moodId;
    });

    saveMoods();
    renderMoodHistory();
    updateMoodStats();
    showMoodMessage('Mood deleted successfully!', 'success');
}

function renderMoodHistory() {
    let visibleMoods = moods;

    if (moodFilter.value !== 'all') {
        visibleMoods = moods.filter(function (mood) {
            return mood.emoji === moodFilter.value;
        });
    }

    if (visibleMoods.length === 0) {
        showMoodEmptyState();
        return;
    }

    moodList.style.display = 'block';
    emptyHistory.style.display = 'none';

    let html = '';
    visibleMoods.forEach(function (mood) {
        html += `
            <div class="mood-item" onclick="moodTracker.showMoodDetail('${mood.id}')">
                <div class="mood-emoji">${mood.emoji}</div>
                <div class="mood-content">
                    <div class="mood-title">${escapeMoodHtml(mood.title)}</div>
                    ${mood.note ? `<div class="mood-note">${escapeMoodHtml(mood.note)}</div>` : ''}
                    <div class="mood-date">${formatMoodDate(mood.date)}</div>
                </div>
                <div class="mood-actions" onclick="event.stopPropagation()">
                    <button class="action-btn edit-btn" onclick="moodTracker.editMood('${mood.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="moodTracker.deleteMood('${mood.id}')">Delete</button>
                </div>
            </div>
        `;
    });

    moodList.innerHTML = html;
}

function showMoodEmptyState() {
    const emptyIcon = emptyHistory.querySelector('.empty-icon');
    const emptyTitle = emptyHistory.querySelector('h3');
    const emptyText = emptyHistory.querySelector('p');

    moodList.style.display = 'none';
    emptyHistory.style.display = 'block';

    if (moodFilter.value === 'all') {
        emptyIcon.textContent = '📝';
        emptyTitle.textContent = 'No moods recorded yet';
        emptyText.textContent = 'Start tracking your emotions to see your mood history here!';
    } else {
        const moodName = moodFilter.options[moodFilter.selectedIndex].text;
        emptyIcon.textContent = moodFilter.value;
        emptyTitle.textContent = `No ${moodName} moods`;
        emptyText.textContent = `You haven't recorded any ${moodName.toLowerCase()} moods yet.`;
    }
}

function showMoodDetail(moodId) {
    const mood = moods.find(function (item) {
        return item.id === moodId;
    });

    if (!mood) {
        return;
    }

    modalContent.innerHTML = `
        <div class="modal-mood">
            <div class="modal-emoji">${mood.emoji}</div>
            <div class="modal-title">${escapeMoodHtml(mood.title)}</div>
            ${mood.note ? `<div class="modal-note">${escapeMoodHtml(mood.note)}</div>` : ''}
            <div class="modal-date">${formatMoodDate(mood.date)}</div>
        </div>
    `;

    moodModal.style.display = 'block';
}

function closeMoodModal() {
    moodModal.style.display = 'none';
}

function updateMoodStats() {
    totalMoodsText.textContent = moods.length;
    currentStreakText.textContent = calculateMoodStreak();
    mostCommonMoodText.textContent = getMostCommonMood() || '-';
}

function calculateMoodStreak() {
    if (moods.length === 0) {
        return 0;
    }

    const sortedMoods = [...moods].sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < sortedMoods.length; i++) {
        const moodDate = new Date(sortedMoods[i].date);
        const daysDifference = Math.floor((today - moodDate) / (1000 * 60 * 60 * 24));

        if (daysDifference === streak) {
            streak++;
        } else if (daysDifference > streak) {
            break;
        }
    }

    return streak;
}

function getMostCommonMood() {
    if (moods.length === 0) {
        return null;
    }

    const counts = {};

    moods.forEach(function (mood) {
        counts[mood.emoji] = (counts[mood.emoji] || 0) + 1;
    });

    let mostUsedEmoji = null;
    let highestCount = 0;

    Object.keys(counts).forEach(function (emoji) {
        if (counts[emoji] > highestCount) {
            highestCount = counts[emoji];
            mostUsedEmoji = emoji;
        }
    });

    return mostUsedEmoji;
}

function clearAllMoods() {
    if (moods.length === 0) {
        showMoodMessage('No moods to clear!', 'info');
        return;
    }

    const confirmed = confirm(`Are you sure you want to delete all ${moods.length} mood entries?`);
    if (!confirmed) {
        return;
    }

    moods = [];
    saveMoods();
    renderMoodHistory();
    updateMoodStats();
    showMoodMessage('All moods cleared!', 'success');
}

function changeMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    renderCalendar();
}

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    currentMonthText.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    calendarDays.innerHTML = '';

    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarDays.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const moodsForDay = moods.filter(function (mood) {
            return mood.date === dateString;
        });

        if (moodsForDay.length > 0) {
            dayElement.classList.add('has-mood');
            dayElement.innerHTML = `${day}<span class="day-emoji">${moodsForDay[0].emoji}</span>`;
        }

        const today = new Date();
        if (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate()
        ) {
            dayElement.classList.add('today');
        }

        dayElement.addEventListener('click', function () {
            showDayMoods(dateString, moodsForDay);
        });

        calendarDays.appendChild(dayElement);
    }
}

function showDayMoods(dateString, moodsForDay) {
    if (moodsForDay.length === 0) {
        showMoodMessage(`No moods recorded for ${formatMoodDate(dateString)}`, 'info');
        return;
    }

    const message = moodsForDay.map(function (mood) {
        return `${mood.emoji} ${mood.title}${mood.note ? ` - ${mood.note}` : ''}`;
    }).join('\n');

    alert(`Moods for ${formatMoodDate(dateString)}:\n\n${message}`);
}

function formatMoodDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function createMoodId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeMoodHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMoodMessage(message, type) {
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
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';

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

function saveMoods() {
    try {
        localStorage.setItem('moodTrackerMoods', JSON.stringify(moods));
    } catch (error) {
        console.error('Error saving moods:', error);
        showMoodMessage('Error saving moods to local storage', 'error');
    }
}

function loadMoods() {
    try {
        const savedMoods = localStorage.getItem('moodTrackerMoods');
        return savedMoods ? JSON.parse(savedMoods) : [];
    } catch (error) {
        console.error('Error loading moods:', error);
        showMoodMessage('Error loading moods from local storage', 'error');
        return [];
    }
}

function addSampleMoodsIfNeeded() {
    if (moods.length > 0) {
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    moods = [
        {
            id: createMoodId(),
            emoji: '😊',
            mood: 'Happy',
            title: 'Welcome to Mood Tracker!',
            note: 'This is your first mood entry. Start tracking your daily emotions!',
            date: today,
            createdAt: new Date().toISOString()
        },
        {
            id: createMoodId(),
            emoji: '😌',
            mood: 'Calm',
            title: 'Peaceful evening',
            note: 'Enjoying a quiet moment with a good book.',
            date: yesterday,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    saveMoods();
}

function startMoodTracker() {
    moods = loadMoods();
    setupMoodElements();
    setupMoodEvents();
    setTodayDate();
    addSampleMoodsIfNeeded();
    renderMoodHistory();
    renderCalendar();
    updateMoodStats();
    updateSaveMoodButton();
}

const moodTracker = {
    editMood: editMood,
    deleteMood: deleteMood,
    showMoodDetail: showMoodDetail
};

window.moodTracker = moodTracker;
document.addEventListener('DOMContentLoaded', startMoodTracker);
