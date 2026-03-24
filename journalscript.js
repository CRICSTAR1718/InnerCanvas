// Main Journal Page JavaScript
class JournalManager {
    constructor() {
        this.entries = this.loadEntries();
        this.currentFilter = 'all';
        this.searchQuery = '';
        
        this.initializeElements();
        this.bindEvents();
        this.renderEntries();
        this.updateStats();
    }
    
    initializeElements() {
        this.newEntryBtn = document.getElementById('newEntryBtn');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.entriesList = document.getElementById('entriesList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        // Stats elements
        this.totalEntries = document.getElementById('totalEntries');
        this.thisMonth = document.getElementById('thisMonth');
        this.thisWeek = document.getElementById('thisWeek');
        this.totalWords = document.getElementById('totalWords');
        
        // Modal elements
        this.previewModal = document.getElementById('previewModal');
        this.modalContent = document.getElementById('modalContent');
        this.closeModal = document.querySelector('.close');
        
        // Delete modal elements
        this.deleteModal = document.getElementById('deleteModal');
        this.confirmDelete = document.getElementById('confirmDelete');
        this.cancelDelete = document.getElementById('cancelDelete');
    }
    
    bindEvents() {
        // Navigation
        this.newEntryBtn.addEventListener('click', () => this.createNewEntry());
        
        // Search
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchBtn.addEventListener('click', () => this.handleSearch(this.searchInput.value));
        
        // Filters
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        // Modal events
        this.closeModal.addEventListener('click', () => this.closeModalWindow());
        this.previewModal.addEventListener('click', (e) => {
            if (e.target === this.previewModal) this.closeModalWindow();
        });
        
        // Delete modal events
        this.confirmDelete.addEventListener('click', () => this.confirmDeleteEntry());
        this.cancelDelete.addEventListener('click', () => this.closeDeleteModal());
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) this.closeDeleteModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModalWindow();
                this.closeDeleteModal();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.createNewEntry();
            }
        });
    }
    
    createNewEntry() {
        // Generate a unique ID for the new entry
        const entryId = this.generateId();
        
        // Create a new entry object
        const newEntry = {
            id: entryId,
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
        
        // Save the new entry
        this.entries.unshift(newEntry);
        this.saveEntries();
        
        // Navigate to editor with the new entry ID
        window.location.href = `journaleditor.html?id=${entryId}`;
    }
    
    editEntry(entryId) {
        window.location.href = `journaleditor.html?id=${entryId}`;
    }
    
    deleteEntry(entryId) {
        this.entryToDelete = entryId;
        this.deleteModal.style.display = 'block';
    }
    
    confirmDeleteEntry() {
        if (this.entryToDelete) {
            this.entries = this.entries.filter(entry => entry.id !== this.entryToDelete);
            this.saveEntries();
            this.renderEntries();
            this.updateStats();
            this.showMessage('Entry deleted successfully!', 'success');
            this.closeDeleteModal();
        }
    }
    
    closeDeleteModal() {
        this.deleteModal.style.display = 'none';
        this.entryToDelete = null;
    }
    
    toggleFavorite(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (entry) {
            entry.isFavorite = !entry.isFavorite;
            this.saveEntries();
            this.renderEntries();
            this.showMessage(
                entry.isFavorite ? 'Added to favorites!' : 'Removed from favorites!', 
                'success'
            );
        }
    }
    
    previewEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;
        
        this.modalContent.innerHTML = `
            <div class="entry-preview-modal">
                <h2>${this.escapeHtml(entry.title)}</h2>
                <div class="entry-meta">
                    <span class="entry-date">${this.formatDate(entry.date)}</span>
                    ${entry.mood ? `<span class="entry-mood">${entry.mood}</span>` : ''}
                    ${entry.weather ? `<span class="entry-weather">${entry.weather}</span>` : ''}
                    ${entry.location ? `<span class="entry-location">📍 ${this.escapeHtml(entry.location)}</span>` : ''}
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
        
        this.previewModal.style.display = 'block';
    }
    
    closeModalWindow() {
        this.previewModal.style.display = 'none';
    }
    
    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.renderEntries();
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.renderEntries();
    }
    
    getFilteredEntries() {
        let filtered = this.entries;
        
        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(entry => 
                entry.title.toLowerCase().includes(this.searchQuery) ||
                entry.content.toLowerCase().includes(this.searchQuery)
            );
        }
        
        // Apply date filter
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        switch (this.currentFilter) {
            case 'today':
                filtered = filtered.filter(entry => entry.date === today.toISOString().split('T')[0]);
                break;
            case 'week':
                filtered = filtered.filter(entry => new Date(entry.date) >= weekAgo);
                break;
            case 'month':
                filtered = filtered.filter(entry => new Date(entry.date) >= monthAgo);
                break;
            case 'favorites':
                filtered = filtered.filter(entry => entry.isFavorite);
                break;
        }
        
        return filtered;
    }
    
    renderEntries() {
        const filteredEntries = this.getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            this.entriesList.style.display = 'none';
            this.emptyState.style.display = 'block';
            
            // Update empty state message
            const emptyTitle = this.emptyState.querySelector('h3');
            const emptyText = this.emptyState.querySelector('p');
            
            if (this.searchQuery) {
                emptyTitle.textContent = 'No entries found';
                emptyText.textContent = `No entries match your search for "${this.searchQuery}"`;
            } else {
                switch (this.currentFilter) {
                    case 'today':
                        emptyTitle.textContent = 'No entries today';
                        emptyText.textContent = 'You haven\'t written any entries today yet.';
                        break;
                    case 'week':
                        emptyTitle.textContent = 'No entries this week';
                        emptyText.textContent = 'You haven\'t written any entries this week yet.';
                        break;
                    case 'month':
                        emptyTitle.textContent = 'No entries this month';
                        emptyText.textContent = 'You haven\'t written any entries this month yet.';
                        break;
                    case 'favorites':
                        emptyTitle.textContent = 'No favorite entries';
                        emptyText.textContent = 'You haven\'t marked any entries as favorites yet.';
                        break;
                    default:
                        emptyTitle.textContent = 'No journal entries yet';
                        emptyText.textContent = 'Start your journaling journey by creating your first entry!';
                }
            }
        } else {
            this.entriesList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.entriesList.innerHTML = filteredEntries.map(entry => `
                <div class="journal-entry" onclick="journalManager.previewEntry('${entry.id}')">
                    <div class="entry-preview">
                        <div class="entry-title">${this.escapeHtml(entry.title)}</div>
                        <div class="entry-excerpt">${this.getExcerpt(entry.content)}</div>
                        <div class="entry-meta">
                            <span class="entry-date">${this.formatDate(entry.date)}</span>
                            <span class="entry-word-count">${entry.wordCount} words</span>
                            ${entry.mood ? `<span class="entry-mood">${entry.mood}</span>` : ''}
                            ${entry.weather ? `<span class="entry-weather">${entry.weather}</span>` : ''}
                            ${entry.isDraft ? '<span class="draft-badge">Draft</span>' : ''}
                        </div>
                    </div>
                    <div class="entry-actions" onclick="event.stopPropagation()">
                        <button class="action-btn favorite-btn ${entry.isFavorite ? 'favorited' : ''}" 
                                onclick="journalManager.toggleFavorite('${entry.id}')" title="Toggle Favorite">
                            ⭐
                        </button>
                        <button class="action-btn edit-btn" onclick="journalManager.editEntry('${entry.id}')" title="Edit">
                            ✏️
                        </button>
                        <button class="action-btn delete-btn" onclick="journalManager.deleteEntry('${entry.id}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    getExcerpt(content, maxLength = 150) {
        if (!content) return 'No content yet...';
        
        // Remove HTML tags for excerpt
        const textContent = content.replace(/<[^>]*>/g, '');
        
        if (textContent.length <= maxLength) {
            return this.escapeHtml(textContent);
        }
        
        return this.escapeHtml(textContent.substring(0, maxLength)) + '...';
    }
    
    updateStats() {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const totalEntries = this.entries.length;
        const monthEntries = this.entries.filter(entry => new Date(entry.date) >= thisMonth).length;
        const weekEntries = this.entries.filter(entry => new Date(entry.date) >= thisWeek).length;
        const totalWords = this.entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
        
        this.totalEntries.textContent = totalEntries;
        this.thisMonth.textContent = monthEntries;
        this.thisWeek.textContent = weekEntries;
        this.totalWords.textContent = totalWords.toLocaleString();
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
    saveEntries() {
        try {
            localStorage.setItem('journalEntries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Error saving entries:', error);
            this.showMessage('Error saving entries to local storage', 'error');
        }
    }
    
    loadEntries() {
        try {
            const savedEntries = localStorage.getItem('journalEntries');
            return savedEntries ? JSON.parse(savedEntries) : [];
        } catch (error) {
            console.error('Error loading entries:', error);
            this.showMessage('Error loading entries from local storage', 'error');
            return [];
        }
    }
}

// Initialize the journal manager when the page loads
let journalManager;

document.addEventListener('DOMContentLoaded', () => {
    journalManager = new JournalManager();
    
    // Add some sample entries if none exist
    if (journalManager.entries.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const sampleEntries = [
            {
                id: journalManager.generateId(),
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
                id: journalManager.generateId(),
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
        
        journalManager.entries = sampleEntries;
        journalManager.saveEntries();
        journalManager.renderEntries();
        journalManager.updateStats();
    }
});

// Handle URL parameters for editing entries
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('edit');
if (editId && journalManager) {
    journalManager.editEntry(editId);
}
