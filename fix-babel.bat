@echo off
echo === TARGETED FIX FOR BABEL ISSUES ===

echo Clearing .expo cache...
rd /s /q ".expo" 2>nul

echo Clearing Metro cache...
rd /s /q "node_modules\.cache" 2>nul

echo Removing temporary files...
rd /s /q "node_modules\.nativewind-*" 2>nul

echo Installing essential dependencies...
npm install metro-react-native-babel-transformer --save-dev

echo Starting Expo with clean cache...
npx expo start --web --port 8095 --clear 