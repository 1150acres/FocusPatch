@echo off
echo === FIXING REACT NAVIGATION ASSETS ===

echo Fixing package versions...
npm install react-native@0.73.6 react-native-svg@14.1.0 --save-exact

echo Clearing Node modules cache...
rd /s /q "node_modules\.cache" 2>nul

echo Installing asset registry...
npm install @react-native-community/cli-platform-android --save-dev
npm install @react-native-community/cli-platform-ios --save-dev

echo Starting Expo with cleared cache...
npx expo start --web --port 8095 --clear 