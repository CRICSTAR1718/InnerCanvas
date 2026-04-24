// Main Journal Page JavaScript

let journalEntries = [];
let currentJournalFilter = 'all';
let searchText = '';
let entryToDeleteId = null;

let newEntryButton;
let searchInput;
let searchButton;
let entriesList;
let emptyState;
let filterButtons;
let totalEntriesText;
let thisMonthText;
let thisWeekText;
let totalWordsText;
let previewModal;
let modalContent;
let closeModalButton;
let deleteModal;
let confirmDeleteButton;
let cancelDeleteButton;

function setupJournalElements() {
    newEntryButton = document.getElementById('newEntryBtn');
    searchInput = document.getElementById('searchInput');
    searchButton = document.getElementById('searchBtn');
    entriesList = document.getElementById('entriesList');
    emptyState = document.getElementById('emptyState');
    filterButtons = document.querySelectorAll('.filter-btn');
    totalEntriesText = document.getElementById('totalEntries');
    thisMonthText = document.getElementById('thisMonth');
    thisWeekText = document.getElementById('thisWeek');
    totalWordsText = document.getElementById('totalWords');
    previewModal = document.getElementById('previewModal');
    modalContent = document.getElementById('modalContent');
    closeModalButton = document.querySelector('.close');
    deleteModal = document.getElementById('deleteModal');
    confirmDeleteButton = document.getElementById('confirmDelete');
    cancelDeleteButton = document.getElementById('cancelDelete');
}

function setupJournalEvents() {
    newEntryButton.addEventListener('click', createNewEntry);
    searchInput.addEventListener('input', function () {
        searchText = searchInput.value.toLowerCase();
        renderJournalEntries();
    });
    searchButton.addEventListener('click', function () {
        searchText = searchInput.value.toLowerCase();
        renderJournalEntries();
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            changeJournalFilter(button.dataset.filter);
        });
    });

    closeModalButton.addEventListener('click', closePreviewModal);
    previewModal.addEventListener('click', function (event) {
        if (event.target === previewModal) {
            closePreviewModal();
        }
    });

    confirmDeleteButton.addEventListener('click', deleteSelectedEntry);
    cancelDeleteButton.addEventListener('click', closeDeleteModal);
    deleteModal.addEventListener('click', function (event) {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closePreviewModal();
            closeDeleteModal();
        }

        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            createNewEntry();
        }
    });
}

function createNewEntry() {
    const newEntry = {
        id: createJournalId(),
        title: 'Untitled Entry',
        content: '',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDraft: true,
        wordCount: 0,
        charCount: 0,
        mood: null,
        weather: null,
        location: null,
        theme: 'default',
        images: []
    };

    journalEntries.unshift(newEntry);
    saveJournalEntries();
    window.location.href = `journaleditor.html?id=${newEntry.id}`;
}

function editEntry(entryId) {
    window.location.href = `journaleditor.html?id=${entryId}`;
}

function askToDeleteEntry(entryId) {
    entryToDeleteId = entryId;
    deleteModal.style.display = 'block';
}

function deleteSelectedEntry() {
    if (!entryToDeleteId) {
        return;
    }

    journalEntries = journalEntries.filter(function (entry) {
        return entry.id !== entryToDeleteId;
    });

    saveJournalEntries();
    renderJournalEntries();
    updateJournalStats();
    showJournalMessage('Entry deleted successfully!', 'success');
    closeDeleteModal();
}

function closeDeleteModal() {
    deleteModal.style.display = 'none';
    entryToDeleteId = null;
}

function toggleFavorite(entryId) {
    const entry = journalEntries.find(function (item) {
        return item.id === entryId;
    });

    if (!entry) {
        return;
    }

    entry.isFavorite = !entry.isFavorite;
    saveJournalEntries();
    renderJournalEntries();
    showJournalMessage(entry.isFavorite ? 'Added to favorites!' : 'Removed from favorites!', 'success');
}

function previewEntry(entryId) {
    const entry = journalEntries.find(function (item) {
        return item.id === entryId;
    });

    if (!entry) {
        return;
    }

    modalContent.innerHTML = `
        <div class="entry-preview-modal">
            <h2>${escapeJournalHtml(entry.title)}</h2>
            <div class="entry-meta">
                <span class="entry-date">${formatJournalDate(entry.date)}</span>
                ${entry.mood ? `<span class="entry-mood">${entry.mood}</span>` : ''}
                ${entry.weather ? `<span class="entry-weather">${entry.weather}</span>` : ''}
                ${entry.location ? `<span class="entry-location">📍 ${escapeJournalHtml(entry.location)}</span>` : ''}
            </div>
            <div class="entry-content">
                ${entry.content || '<p><em>No content yet...</em></p>'}
            </div>
            <div class="entry-stats">
                <span>${entry.wordCount} words</span>
                <span>${entry.charCount} characters</span>
                ${entry.isDraft ? '<span class="draft-badge">Draft</span>' : ''}
            </div>
        </div>
    `;

    previewModal.style.display = 'block';
}

function closePreviewModal() {
    previewModal.style.display = 'none';
}

function changeJournalFilter(filter) {
    currentJournalFilter = filter;

    filterButtons.forEach(function (button) {
        button.classList.remove('active');
        if (button.dataset.filter === filter) {
            button.classList.add('active');
        }
    });

    renderJournalEntries();
}

function getVisibleEntries() {
    let visibleEntries = [...journalEntries];

    if (searchText) {
        visibleEntries = visibleEntries.filter(function (entry) {
            return (
                entry.title.toLowerCase().includes(searchText) ||
                entry.content.toLowerCase().includes(searchText)
            );
        });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (currentJournalFilter === 'today') {
        visibleEntries = visibleEntries.filter(function (entry) {
            return entry.date === today.toISOString().split('T')[0];
        });
    } else if (currentJournalFilter === 'week') {
        visibleEntries = visibleEntries.filter(function (entry) {
            return new Date(entry.date) >= weekAgo;
        });
    } else if (currentJournalFilter === 'month') {
        visibleEntries = visibleEntries.filter(function (entry) {
            return new Date(entry.date) >= monthAgo;
        });
    } else if (currentJournalFilter === 'favorites') {
        visibleEntries = visibleEntries.filter(function (entry) {
            return entry.isFavorite;
        });
    }

    return visibleEntries;
}

function renderJournalEntries() {
    const visibleEntries = getVisibleEntries();

    if (visibleEntries.length === 0) {
        showJournalEmptyState();
        return;
    }

    entriesList.style.display = 'block';
    emptyState.style.display = 'none';

    let html = '';
    visibleEntries.forEach(function (entry) {
        html += `
            <div class="journal-entry" onclick="journalManager.previewEntry('${entry.id}')">
                <div class="entry-preview">
                    <div class="entry-title">${escapeJournalHtml(entry.title)}</div>
                    <div class="entry-excerpt">${getEntryExcerpt(entry.content)}</div>
                    <div class="entry-meta">
                        <span class="entry-date">${formatJournalDate(entry.date)}</span>
                        <span class="entry-word-count">${entry.wordCount} words</span>
                        ${entry.mood ? `<span class="entry-mood">${entry.mood}</span>` : ''}
                        ${entry.weather ? `<span class="entry-weather">${entry.weather}</span>` : ''}
                        ${entry.isDraft ? '<span class="draft-badge">Draft</span>' : ''}
                    </div>
                </div>
                <div class="entry-actions" onclick="event.stopPropagation()">
                    <button class="action-btn favorite-btn ${entry.isFavorite ? 'favorited' : ''}" onclick="journalManager.toggleFavorite('${entry.id}')">⭐</button>
                    <button class="action-btn edit-btn" onclick="journalManager.editEntry('${entry.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="journalManager.deleteEntry('${entry.id}')">Delete</button>
                </div>
            </div>
        `;
    });

    entriesList.innerHTML = html;
}

function showJournalEmptyState() {
    const emptyTitle = emptyState.querySelector('h3');
    const emptyText = emptyState.querySelector('p');

    entriesList.style.display = 'none';
    emptyState.style.display = 'block';

    if (searchText) {
        emptyTitle.textContent = 'No entries found';
        emptyText.textContent = `No entries match your search for "${searchText}"`;
        return;
    }

    if (currentJournalFilter === 'today') {
        emptyTitle.textContent = 'No entries today';
        emptyText.textContent = 'You haven\'t written any entries today yet.';
    } else if (currentJournalFilter === 'week') {
        emptyTitle.textContent = 'No entries this week';
        emptyText.textContent = 'You haven\'t written any entries this week yet.';
    } else if (currentJournalFilter === 'month') {
        emptyTitle.textContent = 'No entries this month';
        emptyText.textContent = 'You haven\'t written any entries this month yet.';
    } else if (currentJournalFilter === 'favorites') {
        emptyTitle.textContent = 'No favorite entries';
        emptyText.textContent = 'You haven\'t marked any entries as favorites yet.';
    } else {
        emptyTitle.textContent = 'No journal entries yet';
        emptyText.textContent = 'Start your journaling journey by creating your first entry!';
    }
}

function getEntryExcerpt(content) {
    if (!content) {
        return 'No content yet...';
    }

    const plainText = content.replace(/<[^>]*>/g, '');
    if (plainText.length <= 150) {
        return escapeJournalHtml(plainText);
    }

    return `${escapeJournalHtml(plainText.substring(0, 150))}...`;
}

function updateJournalStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    totalEntriesText.textContent = journalEntries.length;
    thisMonthText.textContent = journalEntries.filter(function (entry) {
        return new Date(entry.date) >= startOfMonth;
    }).length;
    thisWeekText.textContent = journalEntries.filter(function (entry) {
        return new Date(entry.date) >= oneWeekAgo;
    }).length;

    const totalWords = journalEntries.reduce(function (sum, entry) {
        return sum + (entry.wordCount || 0);
    }, 0);
    totalWordsText.textContent = totalWords.toLocaleString();
}

function formatJournalDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function createJournalId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeJournalHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showJournalMessage(message, type) {
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

function saveJournalEntries() {
    try {
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    } catch (error) {
        console.error('Error saving entries:', error);
        showJournalMessage('Error saving entries to local storage', 'error');
    }
}

function loadJournalEntries() {
    try {
        const savedEntries = localStorage.getItem('journalEntries');
        return savedEntries ? JSON.parse(savedEntries) : [];
    } catch (error) {
        console.error('Error loading entries:', error);
        showJournalMessage('Error loading entries from local storage', 'error');
        return [];
    }
}

function addSampleEntriesIfNeeded() {
    if (journalEntries.length > 0) {
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    journalEntries = [
        {
            id: createJournalId(),
            title: 'Welcome to Your Journal!',
            content: '<p>This is your first journal entry. Start writing about your thoughts, experiences, and memories.</p><p>You can format your text, add images, and organize your entries however you like!</p>',
            date: today,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDraft: false,
            wordCount: 35,
            charCount: 200,
            mood: '😊',
            weather: '☀️',
            location: 'Home',
            theme: 'default',
            images: []
        },
        {
            id: createJournalId(),
            title: 'Getting Started',
            content: '<p>Journaling is a wonderful way to reflect on your day and express your thoughts.</p><p><strong>Tips for effective journaling:</strong></p><ul><li>Write regularly, even if just a few sentences</li><li>Be honest and authentic</li><li>Don\'t worry about perfect grammar or spelling</li><li>Include details about your day</li></ul>',
            date: yesterday,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            isDraft: false,
            wordCount: 45,
            charCount: 280,
            mood: '🤔',
            weather: '⛅',
            location: 'Office',
            theme: 'paper',
            images: []
        }
    ];

    saveJournalEntries();
}

function startJournalManager() {
    journalEntries = loadJournalEntries();
    setupJournalElements();
    setupJournalEvents();
    addSampleEntriesIfNeeded();
    renderJournalEntries();
    updateJournalStats();
}

const journalManager = {
    previewEntry: previewEntry,
    toggleFavorite: toggleFavorite,
    editEntry: editEntry,
    deleteEntry: askToDeleteEntry
};

window.journalManager = journalManager;
document.addEventListener('DOMContentLoaded', startJournalManager);
