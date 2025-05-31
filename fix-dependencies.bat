@echo off
echo === FIXING DEPENDENCIES AND CACHE ===
echo Clearing caches...
rd /s /q ".expo" 2>nul
rd /s /q "node_modules\.cache" 2>nul
rd /s /q "node_modules\.nativewind-*" 2>nul

echo Installing metro transformer...
npm install metro-react-native-babel-transformer --save-dev

echo Done! 