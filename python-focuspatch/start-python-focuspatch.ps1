# FocusPatch Python Version Launcher
# PowerShell Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FocusPatch Python Version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

Write-Host "Setting up Python environment..." -ForegroundColor Yellow
Write-Host "Detecting operating system..." -ForegroundColor Cyan
$osInfo = Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, TotalPhysicalMemory
Write-Host "OS: $($osInfo.WindowsProductName)" -ForegroundColor Green
Write-Host "Version: $($osInfo.WindowsVersion)" -ForegroundColor Green
Write-Host "Using: miniconda3" -ForegroundColor Green
Write-Host ""

# Verify directory
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Check Python environment
Write-Host "Checking Python environment..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    $pythonPath = python -c "import sys; print(sys.executable)"
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
    Write-Host "✅ Python executable: $pythonPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check Flet installation
Write-Host "Checking Flet installation..." -ForegroundColor Yellow
try {
    python -c "import flet; print('✅ Flet is ready!')"
    Write-Host "✅ Flet is ready!" -ForegroundColor Green
} catch {
    Write-Host "❌ Flet not found. Installing..." -ForegroundColor Red
    python -m pip install flet
    Write-Host "✅ Flet installed successfully!" -ForegroundColor Green
}
Write-Host ""

Write-Host "Starting FocusPatch Python version..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 The app should open in a new window or browser tab" -ForegroundColor Green
Write-Host "📱 Press Ctrl+C to stop the app" -ForegroundColor Yellow
Write-Host ""

# Start the Python app
try {
    python main.py
} catch {
    Write-Host ""
    Write-Host "❌ Error starting the app: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "App has stopped." -ForegroundColor Yellow 