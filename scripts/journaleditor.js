// Journal Editor JavaScript

let currentEntryId = '';
let currentEntry = null;
let autoSaveTimer = null;

let backBtn;
let entryTitleInput;
let saveBtn;
let previewBtn;
let editor;
let entryDateInput;
let wordCountText;
let charCountText;
let toolbarButtons;
let fontSizeSelect;
let fontFamilySelect;
let textColorInput;
let backgroundColorInput;
let imageInput;
let insertImageBtn;
let addMoodBtn;
let addWeatherBtn;
let addLocationBtn;
let themeButtons;
let lastSavedText;
let draftBtn;
let publishBtn;
let moodModal;
let weatherModal;
let locationModal;
let locationInput;
let addLocationConfirmBtn;

function setupEditorElements() {
    backBtn = document.getElementById('backBtn');
    entryTitleInput = document.getElementById('entryTitle');
    saveBtn = document.getElementById('saveBtn');
    previewBtn = document.getElementById('previewBtn');
    editor = document.getElementById('editor');
    entryDateInput = document.getElementById('entryDate');
    wordCountText = document.getElementById('wordCount');
    charCountText = document.getElementById('charCount');
    toolbarButtons = document.querySelectorAll('.toolbar-btn');
    fontSizeSelect = document.getElementById('fontSize');
    fontFamilySelect = document.getElementById('fontFamily');
    textColorInput = document.getElementById('textColor');
    backgroundColorInput = document.getElementById('backgroundColor');
    imageInput = document.getElementById('imageInput');
    insertImageBtn = document.getElementById('insertImageBtn');
    addMoodBtn = document.getElementById('addMoodBtn');
    addWeatherBtn = document.getElementById('addWeatherBtn');
    addLocationBtn = document.getElementById('addLocationBtn');
    themeButtons = document.querySelectorAll('.theme-btn');
    lastSavedText = document.getElementById('lastSaved');
    draftBtn = document.getElementById('draftBtn');
    publishBtn = document.getElementById('publishBtn');
    moodModal = document.getElementById('moodModal');
    weatherModal = document.getElementById('weatherModal');
    locationModal = document.getElementById('locationModal');
    locationInput = document.getElementById('locationInput');
    addLocationConfirmBtn = document.getElementById('addLocationConfirm');
}

function setupEditorEvents() {
    backBtn.addEventListener('click', goBackToJournal);
    saveBtn.addEventListener('click', function () {
        saveEntry(true);
    });
    previewBtn.addEventListener('click', showPreview);

    entryTitleInput.addEventListener('input', updateEntryFromEditor);
    editor.addEventListener('input', updateEntryFromEditor);
    entryDateInput.addEventListener('change', updateEntryFromEditor);
    entryTitleInput.addEventListener('blur', autoSaveEntry);
    editor.addEventListener('blur', autoSaveEntry);

    toolbarButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
            const command = event.currentTarget.dataset.command;
            runEditorCommand(command);
        });
    });

    fontSizeSelect.addEventListener('change', changeFontSize);
    fontFamilySelect.addEventListener('change', changeFontFamily);
    textColorInput.addEventListener('change', changeTextColor);
    backgroundColorInput.addEventListener('change', changeBackgroundColor);
    insertImageBtn.addEventListener('click', function () {
        imageInput.click();
    });
    imageInput.addEventListener('change', addImageToEntry);

    addMoodBtn.addEventListener('click', function () {
        moodModal.style.display = 'block';
    });
    addWeatherBtn.addEventListener('click', function () {
        weatherModal.style.display = 'block';
    });
    addLocationBtn.addEventListener('click', function () {
        locationModal.style.display = 'block';
        locationInput.focus();
    });
    addLocationConfirmBtn.addEventListener('click', addLocationToEntry);

    themeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            changeEditorTheme(button.dataset.theme);
        });
    });

    draftBtn.addEventListener('click', saveAsDraft);
    publishBtn.addEventListener('click', publishEntry);

    setupEditorModalEvents();
    setupEditorKeyboardShortcuts();
}

function setupEditorModalEvents() {
    document.querySelectorAll('.close').forEach(function (button) {
        button.addEventListener('click', function (event) {
            const modal = event.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    [moodModal, weatherModal, locationModal].forEach(function (modal) {
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.mood-btn').forEach(function (button) {
        button.addEventListener('click', function () {
            currentEntry.mood = button.dataset.mood;
            updateEntryFromEditor();
            moodModal.style.display = 'none';
            showEditorMessage('Mood added to entry!', 'success');
        });
    });

    document.querySelectorAll('.weather-btn').forEach(function (button) {
        button.addEventListener('click', function () {
            currentEntry.weather = button.dataset.weather;
            updateEntryFromEditor();
            weatherModal.style.display = 'none';
            showEditorMessage('Weather added to entry!', 'success');
        });
    });
}

function setupEditorKeyboardShortcuts() {
    document.addEventListener('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            saveEntry(true);
        }

        if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
            event.preventDefault();
            runEditorCommand('bold');
        }

        if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
            event.preventDefault();
            runEditorCommand('italic');
        }

        if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
            event.preventDefault();
            runEditorCommand('underline');
        }

        if (event.key === 'Escape') {
            goBackToJournal();
        }
    });
}

function getEntryIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || createEditorId();
}

function createEditorId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createBlankEntry() {
    return {
        id: currentEntryId,
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

function loadCurrentEntry() {
    const savedEntries = loadEditorEntries();
    const savedEntry = savedEntries.find(function (entry) {
        return entry.id === currentEntryId;
    });

    currentEntry = savedEntry || createBlankEntry();
}

function fillEditorWithEntryData() {
    entryTitleInput.value = currentEntry.title;
    editor.innerHTML = currentEntry.content;
    entryDateInput.value = currentEntry.date;
    changeEditorTheme(currentEntry.theme, false);
    updateCounts();
    updateLastSavedText();
    updateSaveButtonState();
}

function updateEntryFromEditor() {
    currentEntry.title = entryTitleInput.value || 'Untitled Entry';
    currentEntry.content = editor.innerHTML;
    currentEntry.date = entryDateInput.value;
    currentEntry.updatedAt = new Date().toISOString();

    updateCounts();
    updateSaveButtonState();
}

function updateCounts() {
    const text = editor.textContent || '';
    const words = text.trim().split(/\s+/).filter(function (word) {
        return word.length > 0;
    });

    currentEntry.wordCount = words.length;
    currentEntry.charCount = text.length;

    wordCountText.textContent = currentEntry.wordCount;
    charCountText.textContent = currentEntry.charCount;
}

function updateSaveButtonState() {
    const hasContent = currentEntry.title !== 'Untitled Entry' || currentEntry.content.trim() !== '';
    saveBtn.disabled = !hasContent;
}

function runEditorCommand(command) {
    if (!command) {
        return;
    }

    document.execCommand(command, false, null);
    editor.focus();
    updateEntryFromEditor();
}

function changeFontSize() {
    const size = fontSizeSelect.value;
    document.execCommand('fontSize', false, '7');

    editor.querySelectorAll('font[size="7"]').forEach(function (fontElement) {
        fontElement.removeAttribute('size');
        fontElement.style.fontSize = size;
    });

    updateEntryFromEditor();
}

function changeFontFamily() {
    document.execCommand('fontName', false, fontFamilySelect.value);
    updateEntryFromEditor();
}

function changeTextColor() {
    document.execCommand('foreColor', false, textColorInput.value);
    updateEntryFromEditor();
}

function changeBackgroundColor() {
    document.execCommand('backColor', false, backgroundColorInput.value);
    updateEntryFromEditor();
}

function addImageToEntry(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        showEditorMessage('Please select a valid image file.', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showEditorMessage('Image size must be less than 5MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (loadEvent) {
        const image = document.createElement('img');
        image.src = loadEvent.target.result;
        image.style.maxWidth = '100%';
        image.style.height = 'auto';
        image.style.borderRadius = '8px';
        image.style.margin = '10px 0';
        image.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(image);
            range.setStartAfter(image);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            editor.appendChild(image);
        }

        currentEntry.images.push({
            src: loadEvent.target.result,
            name: file.name,
            size: file.size,
            type: file.type
        });

        updateEntryFromEditor();
        showEditorMessage('Image added successfully!', 'success');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
}

function addLocationToEntry() {
    const location = locationInput.value.trim();

    if (!location) {
        showEditorMessage('Please enter a location.', 'error');
        return;
    }

    currentEntry.location = location;
    locationInput.value = '';
    locationModal.style.display = 'none';
    updateEntryFromEditor();
    showEditorMessage('Location added to entry!', 'success');
}

function changeEditorTheme(theme, showMessage = true) {
    themeButtons.forEach(function (button) {
        button.classList.remove('active');
    });

    const selectedButton = document.querySelector(`[data-theme="${theme}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    editor.className = `rich-editor theme-${theme}`;
    currentEntry.theme = theme;

    if (showMessage) {
        updateEntryFromEditor();
        showEditorMessage(`Theme changed to ${theme}!`, 'success');
    }
}

function saveAsDraft() {
    currentEntry.isDraft = true;
    saveEntry(true);
}

function publishEntry() {
    currentEntry.isDraft = false;
    saveEntry(true);
}

function saveEntry(showMessage = false) {
    updateEntryFromEditor();

    const entries = loadEditorEntries();
    const existingIndex = entries.findIndex(function (entry) {
        return entry.id === currentEntryId;
    });

    if (existingIndex !== -1) {
        entries[existingIndex] = currentEntry;
    } else {
        entries.unshift(currentEntry);
    }

    saveEditorEntries(entries);
    updateLastSavedText();

    if (showMessage) {
        showEditorMessage('Your entry has been saved!', 'success');
    }
}

function autoSaveEntry() {
    if (currentEntry.title !== 'Untitled Entry' || currentEntry.content.trim() !== '') {
        saveEntry(false);
    }
}

function startAutoSave() {
    autoSaveTimer = setInterval(function () {
        autoSaveEntry();
    }, 30000);
}

function updateLastSavedText() {
    lastSavedText.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
}

function showPreview() {
    updateEntryFromEditor();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>📖 Entry Preview</h3>
            <div class="preview-content">
                <h2>${currentEntry.title}</h2>
                <div class="preview-meta">
                    <span class="preview-date">${formatEditorDate(currentEntry.date)}</span>
                    ${currentEntry.mood ? `<span class="preview-mood">${currentEntry.mood}</span>` : ''}
                    ${currentEntry.weather ? `<span class="preview-weather">${currentEntry.weather}</span>` : ''}
                    ${currentEntry.location ? `<span class="preview-location">📍 ${currentEntry.location}</span>` : ''}
                </div>
                <div class="preview-text">
                    ${currentEntry.content || '<p><em>No content yet...</em></p>'}
                </div>
                <div class="preview-stats">
                    <span>${currentEntry.wordCount} words</span>
                    <span>${currentEntry.charCount} characters</span>
                    ${currentEntry.isDraft ? '<span class="draft-badge">Draft</span>' : ''}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close').addEventListener('click', function () {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function formatEditorDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function goBackToJournal() {
    autoSaveEntry();
    window.location.href = 'journal.html';
}

function showEditorMessage(message, type) {
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

function saveEditorEntries(entries) {
    try {
        localStorage.setItem('journalEntries', JSON.stringify(entries));
    } catch (error) {
        console.error('Error saving entries:', error);
        showEditorMessage('Error saving entries to local storage', 'error');
    }
}

function loadEditorEntries() {
    try {
        const savedEntries = localStorage.getItem('journalEntries');
        return savedEntries ? JSON.parse(savedEntries) : [];
    } catch (error) {
        console.error('Error loading entries:', error);
        showEditorMessage('Error loading entries from local storage', 'error');
        return [];
    }
}

function startJournalEditor() {
    currentEntryId = getEntryIdFromUrl();
    loadCurrentEntry();
    setupEditorElements();
    setupEditorEvents();
    fillEditorWithEntryData();
    startAutoSave();

    window.addEventListener('beforeunload', function (event) {
        if (currentEntry.title !== 'Untitled Entry' || currentEntry.content.trim() !== '') {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}

document.addEventListener('DOMContentLoaded', startJournalEditor);
