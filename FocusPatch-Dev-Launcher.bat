@echo off
setlocal enabledelayedexpansion
title FocusPatch Development Launcher

:: Set colors and styling
color 0A

echo.
echo ===============================================
echo           FocusPatch Development Launcher
echo ===============================================
echo.
echo [1/4] Initializing development environment...

:: Change to the script directory
cd /d "%~dp0"

echo [2/4] Starting Expo development server...
echo.

:: Start Expo server in a new window with persistence
start "FocusPatch Server" cmd /k "echo Starting FocusPatch server... && npx expo start"

echo [3/4] Waiting for server to be ready...
:: Wait for server to start
ping 127.0.0.1 -n 8 > nul

echo [4/4] Opening development tools...
echo.

:: Open browser
echo Opening web browser...
start "" "http://localhost:8081"

:: Wait a bit more for browser to load
ping 127.0.0.1 -n 3 > nul

echo.
echo ===============================================
echo            🚀 DEVELOPMENT READY! 🚀
echo ===============================================
echo.
echo ✅ Web App:      http://localhost:8081
echo ✅ Mobile:       Check QR code in server window  
echo ✅ Browser Tools: Open DevTools (F12) in browser
echo.
echo 💡 Development Tips:
echo    - In server window: Press 'r' to reload
echo    - In server window: Press 'w' to reopen browser
echo    - In browser: Press F12 for developer tools
echo    - For mobile: Use Expo Go app to scan QR code
echo.
echo ⚠️  To stop: Close the "FocusPatch Server" window
echo.
echo ===============================================

echo Press any key to close this launcher...
pause >nul

:: Cleanup
endlocal 