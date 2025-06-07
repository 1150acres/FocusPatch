@echo off
title FocusPatch Development Server
echo ====================================
echo      FocusPatch Development Server
echo ====================================
echo.
echo Starting Expo development server...
echo.

REM Change to the project directory
cd /d "%~dp0"

REM Start the Expo server in the background and wait for it to be ready
start /B cmd /c "npx expo start --web > server.log 2>&1"

echo Waiting for server to start...
timeout /t 10 /nobreak > nul

echo Opening browser...
start http://localhost:8081

echo.
echo ====================================
echo Server is running!
echo Web: http://localhost:8081
echo Check the other terminal for QR code
echo Press Ctrl+C to stop the server
echo ====================================
echo.

REM Keep this window open and show server status
echo Monitoring server... (Press any key to exit)
pause > nul 