// Journal Editor JavaScript
class JournalEditor {
    constructor() {
        this.entryId = this.getEntryIdFromURL();
        this.entry = this.loadEntry();
        this.autoSaveInterval = null;
        this.lastSaved = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadEntryData();
        this.startAutoSave();
    }
    
    initializeElements() {
        // Navigation elements
        this.backBtn = document.getElementById('backBtn');
        this.entryTitle = document.getElementById('entryTitle');
        this.saveBtn = document.getElementById('saveBtn');
        this.previewBtn = document.getElementById('previewBtn');
        
        // Editor elements
        this.editor = document.getElementById('editor');
        this.entryDate = document.getElementById('entryDate');
        this.wordCount = document.getElementById('wordCount');
        this.charCount = document.getElementById('charCount');
        
        // Toolbar elements
        this.toolbarBtns = document.querySelectorAll('.toolbar-btn');
        this.fontSize = document.getElementById('fontSize');
        this.fontFamily = document.getElementById('fontFamily');
        this.textColor = document.getElementById('textColor');
        this.backgroundColor = document.getElementById('backgroundColor');
        this.imageInput = document.getElementById('imageInput');
        this.insertImageBtn = document.getElementById('insertImageBtn');
        
        // Sidebar elements
        this.addMoodBtn = document.getElementById('addMoodBtn');
        this.addWeatherBtn = document.getElementById('addWeatherBtn');
        this.addLocationBtn = document.getElementById('addLocationBtn');
        this.themeBtns = document.querySelectorAll('.theme-btn');
        
        // Footer elements
        this.lastSavedEl = document.getElementById('lastSaved');
        this.autoSaveStatus = document.getElementById('autoSaveStatus');
        this.draftBtn = document.getElementById('draftBtn');
        this.publishBtn = document.getElementById('publishBtn');
        
        // Modal elements
        this.moodModal = document.getElementById('moodModal');
        this.weatherModal = document.getElementById('weatherModal');
        this.locationModal = document.getElementById('locationModal');
        this.locationInput = document.getElementById('locationInput');
        this.addLocationConfirm = document.getElementById('addLocationConfirm');
    }
    
    bindEvents() {
        // Navigation
        this.backBtn.addEventListener('click', () => this.goBack());
        
        // Save button
        this.saveBtn.addEventListener('click', () => this.saveEntry(true));
        
        // Preview button
        this.previewBtn.addEventListener('click', () => this.showPreview());
        
        // Title and content
        this.entryTitle.addEventListener('input', () => this.updateEntry());
        this.editor.addEventListener('input', () => this.updateEntry());
        this.entryDate.addEventListener('change', () => this.updateEntry());
        
        // Toolbar events
        this.toolbarBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.executeCommand(e.target.dataset.command));
        });
        
        // Font controls
        this.fontSize.addEventListener('change', () => this.updateFontSize());
        this.fontFamily.addEventListener('change', () => this.updateFontFamily());
        this.textColor.addEventListener('change', () => this.updateTextColor());
        this.backgroundColor.addEventListener('change', () => this.updateBackgroundColor());
        
        // Image handling
        this.insertImageBtn.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Sidebar events
        this.addMoodBtn.addEventListener('click', () => this.showMoodModal());
        this.addWeatherBtn.addEventListener('click', () => this.showWeatherModal());
        this.addLocationBtn.addEventListener('click', () => this.showLocationModal());
        this.addLocationConfirm.addEventListener('click', () => this.addLocation());
        
        // Theme selection
        this.themeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.changeTheme(theme);
            });
        });
        
        // Footer events
        this.draftBtn.addEventListener('click', () => this.saveAsDraft());
        this.publishBtn.addEventListener('click', () => this.publishEntry());
        
        // Modal events
        this.bindModalEvents();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Auto-save on focus loss
        this.editor.addEventListener('blur', () => this.autoSave());
        this.entryTitle.addEventListener('blur', () => this.autoSave());
    }
    
    bindModalEvents() {
        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });
        
        // Close modals on outside click
        [this.moodModal, this.weatherModal, this.locationModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Mood selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mood = e.target.dataset.mood;
                this.addMoodToEntry(mood);
                this.moodModal.style.display = 'none';
            });
        });
        
        // Weather selection
        document.querySelectorAll('.weather-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weather = e.target.dataset.weather;
                this.addWeatherToEntry(weather);
                this.weatherModal.style.display = 'none';
            });
        });
    }
    
    getEntryIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || this.generateId();
    }
    
    loadEntry() {
        const entries = this.loadEntries();
        return entries.find(entry => entry.id === this.entryId) || this.createNewEntry();
    }
    
    createNewEntry() {
        return {
            id: this.entryId,
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
    }
    
    loadEntryData() {
        this.entryTitle.value = this.entry.title;
        this.editor.innerHTML = this.entry.content;
        this.entryDate.value = this.entry.date;
        
        // Set theme
        this.changeTheme(this.entry.theme, false);
        
        // Update word count
        this.updateWordCount();
        
        // Update last saved
        this.updateLastSaved();
    }
    
    updateEntry() {
        this.entry.title = this.entryTitle.value || 'Untitled Entry';
        this.entry.content = this.editor.innerHTML;
        this.entry.date = this.entryDate.value;
        this.entry.updatedAt = new Date().toISOString();
        
        this.updateWordCount();
        this.updateSaveButton();
    }
    
    updateWordCount() {
        const textContent = this.editor.textContent || '';
        const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
        
        this.entry.wordCount = words.length;
        this.entry.charCount = textContent.length;
        
        this.wordCount.textContent = this.entry.wordCount;
        this.charCount.textContent = this.entry.charCount;
    }
    
    updateSaveButton() {
        const hasContent = this.entry.title !== 'Untitled Entry' || this.entry.content.trim() !== '';
        this.saveBtn.disabled = !hasContent;
    }
    
    executeCommand(command) {
        document.execCommand(command, false, null);
        this.editor.focus();
        this.updateEntry();
    }
    
    updateFontSize() {
        const size = this.fontSize.value;
        document.execCommand('fontSize', false, '7');
        const fontElements = this.editor.querySelectorAll('font[size="7"]');
        fontElements.forEach(el => {
            el.removeAttribute('size');
            el.style.fontSize = size;
        });
        this.updateEntry();
    }
    
    updateFontFamily() {
        const font = this.fontFamily.value;
        document.execCommand('fontName', false, font);
        this.updateEntry();
    }
    
    updateTextColor() {
        const color = this.textColor.value;
        document.execCommand('foreColor', false, color);
        this.updateEntry();
    }
    
    updateBackgroundColor() {
        const color = this.backgroundColor.value;
        document.execCommand('backColor', false, color);
        this.updateEntry();
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select a valid image file.', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showMessage('Image size must be less than 5MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '10px 0';
            img.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            
            // Insert image at cursor position
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.insertNode(img);
                range.setStartAfter(img);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                this.editor.appendChild(img);
            }
            
            // Store image data
            this.entry.images.push({
                src: e.target.result,
                name: file.name,
                size: file.size,
                type: file.type
            });
            
            this.updateEntry();
            this.showMessage('Image added successfully!', 'success');
        };
        
        reader.readAsDataURL(file);
        
        // Clear the input
        event.target.value = '';
    }
    
    showMoodModal() {
        this.moodModal.style.display = 'block';
    }
    
    showWeatherModal() {
        this.weatherModal.style.display = 'block';
    }
    
    showLocationModal() {
        this.locationModal.style.display = 'block';
        this.locationInput.focus();
    }
    
    addMoodToEntry(mood) {
        this.entry.mood = mood;
        this.updateEntry();
        this.showMessage('Mood added to entry!', 'success');
    }
    
    addWeatherToEntry(weather) {
        this.entry.weather = weather;
        this.updateEntry();
        this.showMessage('Weather added to entry!', 'success');
    }
    
    addLocation() {
        const location = this.locationInput.value.trim();
        if (!location) {
            this.showMessage('Please enter a location.', 'error');
            return;
        }
        
        this.entry.location = location;
        this.locationInput.value = '';
        this.locationModal.style.display = 'none';
        this.updateEntry();
        this.showMessage('Location added to entry!', 'success');
    }
    
    changeTheme(theme, updateEntry = true) {
        console.log('Changing theme to:', theme); // Debug log
        
        // Remove active class from all theme buttons
        this.themeBtns.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected theme
        const selectedBtn = document.querySelector(`[data-theme="${theme}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        // Apply theme to editor
        this.editor.className = `rich-editor theme-${theme}`;
        console.log('Editor class set to:', this.editor.className); // Debug log
        
        if (updateEntry) {
            this.entry.theme = theme;
            this.updateEntry();
        }
        
        this.showMessage(`Theme changed to ${theme}!`, 'success');
    }
    
    saveAsDraft() {
        this.entry.isDraft = true;
        this.saveEntry();
        this.showMessage('Entry saved as draft!', 'success');
    }
    
    publishEntry() {
        this.entry.isDraft = false;
        this.saveEntry();
        this.showMessage('Entry published successfully!', 'success');
    }
    
    saveEntry(showMessage = false) {
        this.updateEntry();
        
        const entries = this.loadEntries();
        const existingIndex = entries.findIndex(entry => entry.id === this.entryId);
        
        if (existingIndex !== -1) {
            entries[existingIndex] = this.entry;
        } else {
            entries.unshift(this.entry);
        }
        
        this.saveEntries(entries);
        this.updateLastSaved();
        
        if (showMessage) {
            this.showMessage('Your entry has been saved!', 'success');
        }
    }
    
    autoSave() {
        if (this.entry.title !== 'Untitled Entry' || this.entry.content.trim() !== '') {
            this.saveEntry();
        }
    }
    
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000); // Auto-save every 30 seconds
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    updateLastSaved() {
        this.lastSaved = new Date();
        this.lastSavedEl.textContent = `Last saved: ${this.lastSaved.toLocaleTimeString()}`;
    }
    
    showPreview() {
        // Update entry data first
        this.updateEntry();
        
        // Create preview content
        const previewContent = `
            <div class="preview-content">
                <h2>${this.entry.title}</h2>
                <div class="preview-meta">
                    <span class="preview-date">${this.formatDate(this.entry.date)}</span>
                    ${this.entry.mood ? `<span class="preview-mood">${this.entry.mood}</span>` : ''}
                    ${this.entry.weather ? `<span class="preview-weather">${this.entry.weather}</span>` : ''}
                    ${this.entry.location ? `<span class="preview-location">📍 ${this.entry.location}</span>` : ''}
                </div>
                <div class="preview-text">
                    ${this.entry.content || '<p><em>No content yet...</em></p>'}
                </div>
                <div class="preview-stats">
                    <span>${this.entry.wordCount} words</span>
                    <span>${this.entry.charCount} characters</span>
                    ${this.entry.isDraft ? '<span class="draft-badge">Draft</span>' : ''}
                </div>
            </div>
        `;
        
        // Show in modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>📖 Entry Preview</h3>
                ${previewContent}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
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
    
    goBack() {
        // Save before leaving
        this.autoSave();
        
        // Go back to main journal page
        window.location.href = 'journal.html';
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveEntry();
            this.showMessage('Entry saved!', 'success');
        }
        
        // Ctrl/Cmd + B for bold
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.executeCommand('bold');
        }
        
        // Ctrl/Cmd + I for italic
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            this.executeCommand('italic');
        }
        
        // Ctrl/Cmd + U for underline
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            this.executeCommand('underline');
        }
        
        // Escape to go back
        if (e.key === 'Escape') {
            this.goBack();
        }
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
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Local Storage Methods
    saveEntries(entries) {
        try {
            localStorage.setItem('journalEntries', JSON.stringify(entries));
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

// Initialize the journal editor when the page loads
let journalEditor;

document.addEventListener('DOMContentLoaded', () => {
    journalEditor = new JournalEditor();
    
    // Warn user before leaving if there are unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (journalEditor.entry.title !== 'Untitled Entry' || journalEditor.entry.content.trim() !== '') {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
});

// Theme styles are now defined in journalstyles.css
