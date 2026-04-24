# InnerCanvas - Personal Productivity & Wellness Hub

> Organize your life, track your mood, and capture your thoughts in one place.

## Features

InnerCanvas is an all-in-one web app for personal productivity and wellness. It includes:

### Task Manager
- Create and manage daily to-do items
- Mark tasks as complete
- Filter and search tasks
- Save data locally in the browser

### Mood Tracker
- Track daily emotions with emoji-based moods
- Add notes and dates to entries
- Review mood history
- Use a calendar view to spot patterns
- See simple mood statistics

### Life Journal
- Write and save journal entries
- Search past entries
- Edit and manage saved entries
- Organize personal reflections

### Home Dashboard
- Navigate between all features
- View a quick overview from the landing page

## Project Structure

```text
InnerCanvas/
|-- index.html                    # Main landing page
|-- pages/
|   |-- taskmanager.html          # Task Manager app
|   |-- moodtracker.html          # Mood Tracker app
|   |-- journal.html              # Journal list page
|   `-- journaleditor.html        # Journal editor page
|-- scripts/
|   |-- homescript.js             # Home page logic
|   |-- taskmanagerscript.js      # Task Manager logic
|   |-- moodtrackerscript.js      # Mood Tracker logic
|   |-- journalscript.js          # Journal page logic
|   `-- journaleditor.js          # Journal editor logic
|-- styles/
|   |-- homestyles.css            # Home page styles
|   |-- taskmanagerstyles.css     # Task Manager styles
|   |-- moodtrackerstyles.css     # Mood Tracker styles
|   `-- journalstyles.css         # Journal styles
`-- README.md
```

## Getting Started

### Prerequisites
- A modern web browser
- No installation required

### Run the app

1. Clone or download the project.
2. Open `index.html` directly in your browser.

You can also serve it locally:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data Storage

InnerCanvas uses browser local storage:
- Tasks stay on your device
- Mood entries stay on your device
- Journal entries stay on your device
- No data is sent to a server

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Local Storage API

## Notes

- All data is stored only in the browser.
- Clearing browser storage will remove saved app data.

## License

This project is open source and available for personal use.
