# FocusPatch - Python Version

A productivity app for managing daily tasks and goals, built with Python and Flet (Flutter for Python).

## Features

- **Daily Task Management**: Organize tasks across Today, Tomorrow, and Day After columns
- **Goal Tracking**: Create and track progress on long-term goals
- **Data Persistence**: Automatically saves data to JSON file
- **Cross-Platform**: Runs on Windows, macOS, Linux, and Web
- **Clean UI**: Modern interface built with Flet/Flutter

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Setup
1. Install required packages:
```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install flet datetime uuid
```

## Usage

### Running the App

**Desktop Mode:**
```bash
python main.py
```

**Web Mode:**
Change the last line in `main.py` to:
```python
ft.app(target=main, view=ft.WEB_BROWSER)
```

**Mobile Mode (when building for mobile):**
```python
ft.app(target=main, view=ft.FLET_APP)
```

### Building for Mobile

To build for mobile platforms:

```bash
# For Android
flet build apk

# For iOS (macOS only)
flet build ipa

# For Web
flet build web
```

## Project Structure

```
python-focuspatch/
├── main.py              # Main application file
├── requirements.txt     # Python dependencies
├── README.md           # This file
└── focuspatch_data.json # Data storage (created automatically)
```

## Features Comparison with React Native Version

| Feature | React Native | Python/Flet | Status |
|---------|-------------|-------------|---------|
| Daily task columns | ✅ | ✅ | Complete |
| Goal management | ✅ | ✅ | Complete |
| Data persistence | ✅ | ✅ | Complete |
| Bottom navigation | ✅ | ✅ | Complete |
| Task completion | ✅ | ✅ | Complete |
| Mobile responsive | ✅ | ✅ | Complete |
| Keyboard avoidance | ✅ | 🔄 | Auto-handled by Flet |
| Context menus | ✅ | 🔄 | Planned |
| Goal steps | ✅ | 🔄 | Planned |

## Data Format

The app stores data in `focuspatch_data.json`:

```json
{
  "tasks": [
    {
      "id": "1750206319593",
      "title": "Sample task",
      "time": "8:25 PM",
      "category": "general",
      "day": 0,
      "completed": false
    }
  ],
  "goals": [
    {
      "id": "goal-1749190378102",
      "title": "Sample goal",
      "subtitle": "Goal description",
      "icon": "🎯",
      "steps": [],
      "completed": 0,
      "total": 0,
      "createdAt": "2025-06-06T06:12:58.102Z"
    }
  ],
  "lastSaved": "2025-06-17T20:58:00.000Z"
}
```

## Development

### Adding New Features

1. **New UI Components**: Add functions in the main.py file
2. **Data Models**: Extend the FocusPatchApp class
3. **Screens**: Create new screen functions and add to navigation

### Debugging

Add print statements or use Python's logging module:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Deployment

### Web Deployment
```bash
flet build web
# Deploy the build/web folder to any web server
```

### Desktop App
```bash
# Windows
flet build windows

# macOS
flet build macos

# Linux
flet build linux
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the FocusPatch application suite.

## Support

For issues or questions about the Python version, please check:
1. Flet documentation: https://flet.dev
2. Python documentation: https://docs.python.org
3. Create an issue in the main FocusPatch repository 