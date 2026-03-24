# 🎨 InnerCanvas - Personal Productivity & Wellness Hub

> Your Personal Productivity & Wellness Hub — Organize your life, track your mood, and capture your thoughts in one beautiful place.

## ✨ Features

InnerCanvas is an all-in-one web application designed to help you manage your personal life, wellness, and productivity. It includes:

### 📝 **Task Manager**
- Create and manage your daily to-do list
- Mark tasks as complete
- Filter and search through your tasks
- Persistent local storage (your data stays on your device)

### 😊 **Mood Tracker**
- Track your daily emotions with emoji-based moods
- Record mood notes and timestamps
- View mood history in an organized list
- Calendar view to see patterns over time
- View statistics on your emotional trends

### 📖 **Life Journal**
- Write and save journal entries
- Capture your thoughts, memories, and experiences
- Search through past entries
- Edit and manage your journal entries
- Organize your personal reflections

### 🏠 **Home Dashboard**
- Central hub to access all features
- Beautiful card-based UI for easy navigation
- Quick overview of available apps

## 📁 Project Structure

```
InnerCanvas/
├── home.html                 # Main landing page & navigation hub
├── homescript.js             # Home page functionality
├── homestyles.css            # Home page styling
│
├── taskmanger.html           # Task Manager application
├── taskmanagerscript.js      # Task Manager logic
├── taskmanagerstyles.css     # Task Manager styling
│
├── moodtracker.html          # Mood Tracker application
├── moodtrackerscript.js      # Mood Tracker logic
├── moodtrackerstyles.css     # Mood Tracker styling
│
├── journal.html              # Journal listing & management
├── journalscript.js          # Journal logic
├── journalstyles.css         # Journal styling
│
├── journaleditor.html        # Journal entry editor
├── journaleditor.js          # Journal editor logic
│
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or installation required!

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd InnerCanvas
   ```

2. **Open the application**
   - Simply open `home.html` in your web browser
   - Or serve it locally using a simple HTTP server:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js with http-server
     npx http-server
     ```
   - Then visit `http://localhost:8000` in your browser

## 💾 Data Storage

InnerCanvas uses **browser local storage** to save all your data:
- Tasks are stored locally on your device
- Mood entries are stored locally on your device
- Journal entries are stored locally on your device
- **Your data is private and never leaves your browser**
- Clear your browser cache/history to reset data

## 🎯 How to Use

### Task Manager
1. Click "Task Manager" from the home page
2. Click "New Task" to add a task
3. Enter your task description
4. Mark tasks complete as you finish them
5. Use filters to organize your tasks

### Mood Tracker
1. Click "Mood Tracker" from the home page
2. Go to "Add Mood" tab
3. Select your current mood from emoji options
4. Add an optional note
5. View your mood history and calendar patterns in other tabs

### Life Journal
1. Click "Life Journal" from the home page
2. Click "New Entry" to write a journal entry
3. Write your thoughts and experiences
4. Save your entry
5. Search for past entries using the search feature

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern responsive styling
- **Vanilla JavaScript** - No external dependencies
- **Local Storage API** - Data persistence
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🎨 Design Features

- **Clean, intuitive interface** - Easy to navigate and use
- **Responsive design** - Works on all devices
- **Dark/Light theme ready** - Customizable appearance
- **Emoji-based UI** - Visually engaging and fun
- **Beautiful card layouts** - Modern, polished design

## 🔒 Privacy

- All data is stored locally in your browser
- No data is sent to any server
- No tracking or analytics
- 100% private and secure

## 📱 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚧 Future Enhancements

- [ ] Export data as PDF or CSV
- [ ] Dark mode theme
- [ ] Data backup and sync
- [ ] Cloud storage integration
- [ ] Mobile app version
- [ ] Habit tracking
- [ ] Goal setting feature
- [ ] Notifications and reminders
- [ ] Custom themes and colors
- [ ] Advanced analytics and insights

## 📝 Notes

- All data persists only in your local browser storage
- To clear all data, clear your browser's local storage or cache

## 💡 Tips for Best Experience

1. **Bookmark the home page** for easy access
2. **Regularly backup** important journal entries by copying them
3. **Use your mood tracker** consistently to identify patterns
4. **Review your tasks** and journal entries periodically for reflection
5. **Customize colors and fonts** in the CSS files to match your style

## 📄 License

This project is open source and available for personal use.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

---

**Made with 💜 for personal productivity and wellness**
