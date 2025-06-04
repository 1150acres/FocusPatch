@echo off
echo === ASSET & TRANSFORMER FIX ===

echo Installing correct package versions and transformer...
npm install react-native@0.73.6 react-native-svg@14.1.0 --save-exact
npm install metro-react-native-babel-transformer@0.77.0 --save-dev --save-exact

echo Clearing caches...
rd /s /q ".expo" 2>nul
rd /s /q "node_modules\.cache" 2>nul

echo Starting Expo with web-only platform...
npx expo start --web-only --port 8095 --clear 