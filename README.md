# FocusPatch - ADHD Planner App

A mobile-first ADHD planner app built with Expo, React Native, NativeWind, and Firebase.

## Features

- Home screen with 3-day calendar view and upcoming tasks
- Goals screen for managing long-term goals
- Smart task detection to route simple tasks vs. long-term goals
- Clean, distraction-free UI optimized for ADHD users

## Tech Stack

- Expo with React Native
- Expo Router for navigation
- NativeWind (TailwindCSS for styling)
- Firebase for backend
- date-fns for date manipulation

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Scan the QR code with the Expo Go app on your mobile device or use an emulator.

## Project Structure

```
focuspatch/
├── app/                  # Expo Router app directory
│   ├── _layout.js        # Layout for the app
│   ├── index.js          # Home screen
│   └── goals.js          # Goals screen
├── components/           # React components
│   ├── DayColumn.js      # Column for each day in calendar
│   └── GoalItem.js       # Item for each goal
├── services/             # Service modules
│   └── firebase.js       # Firebase service
├── babel.config.js       # Babel configuration
├── tailwind.config.js    # TailwindCSS configuration
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── firebaseConfig.js     # Firebase configuration
```

## Development Roadmap

### MVP (Current)
- Basic calendar view with 3-day layout
- Simple goal tracking with progress bars
- Local data storage

### Future Development
- User authentication
- Cloud syncing across devices
- Notifications and reminders
- Time tracking features
- Integrations with calendar apps
- Advanced task categorization

## Get started

1. Install dependencies

   ```