@echo off
echo.
echo ========================================
echo   FocusPatch Python Version
echo ========================================
echo.
echo Setting up Python environment...
echo Detecting operating system...
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
echo Using: miniconda3
echo.

REM Change to the python-focuspatch directory
cd /d "%~dp0"

REM Verify we're in the right directory
echo Current directory: %CD%
echo.

REM Check Python version and environment
echo Checking Python environment...
python --version
python -c "import sys; print('Python executable:', sys.executable)"
echo.

REM Check if Flet is available
echo Checking Flet installation...
python -c "import flet; print('✅ Flet is ready!')" 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Flet not found. Installing...
    python -m pip install flet
    echo ✅ Flet installed successfully!
    echo.
)

echo Starting FocusPatch Python version...
echo ========================================
echo.
echo 🚀 The app should open in a new window or browser tab
echo 📱 Close this terminal to stop the app
echo.

REM Start the Python app
python main.py

echo.
echo App has stopped. Press any key to exit...
pause >nul 