# FocusPatch - ADHD Planner App

A mobile-first ADHD planner app built with Expo, React Native, NativeWind (TailwindCSS), and Firebase.

## Features

- Home screen with 3-day calendar view and upcoming tasks
- Goals screen for managing long-term goals
- Clean, distraction-free UI optimized for ADHD users

## Tech Stack

- Expo with React Native
- NativeWind (TailwindCSS for styling)
- Expo Router for navigation
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
│   ├── TaskCard.js       # Card for each task
│   └── GoalItem.js       # Item for each goal
├── services/             # Service modules
│   └── firebase.js       # Firebase service
├── babel.config.js       # Babel configuration
├── tailwind.config.js    # TailwindCSS configuration
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── firebaseConfig.js     # Firebase configuration
```

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
