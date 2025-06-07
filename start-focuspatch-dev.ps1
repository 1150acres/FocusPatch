# FocusPatch Development Server Launcher
# This script starts the Expo dev server and opens the browser automatically

param(
    [switch]$NoWebOpen = $false
)

$Host.UI.RawUI.WindowTitle = "FocusPatch Development Server"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "     FocusPatch Development Server" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory (project root)
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir

Write-Host "📁 Project Directory: $ProjectDir" -ForegroundColor Green
Write-Host "🚀 Starting Expo development server..." -ForegroundColor Yellow
Write-Host ""

try {
    # Start Expo server in a new window
    $ExpoProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectDir'; npx expo start" -PassThru
    
    Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    
    if (-not $NoWebOpen) {
        Write-Host "🌐 Opening browser..." -ForegroundColor Green
        Start-Process "http://localhost:8081"
    }
    
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Green
    Write-Host "✅ Development server is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Web:        http://localhost:8081" -ForegroundColor White
    Write-Host "📱 Mobile:     Check QR code in server window" -ForegroundColor White
    Write-Host "🔗 Tunnel:     Available for Tailscale sharing" -ForegroundColor White
    Write-Host ""
    Write-Host "🛠️  Browser Tools:" -ForegroundColor Cyan
    Write-Host "   - Developer Console available" -ForegroundColor Gray
    Write-Host "   - Network monitoring enabled" -ForegroundColor Gray
    Write-Host "   - Performance profiling ready" -ForegroundColor Gray
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "   - Press 'r' in server window to reload" -ForegroundColor Gray
    Write-Host "   - Press 'w' to open/reopen web browser" -ForegroundColor Gray
    Write-Host "   - Press 'j' to open debugger" -ForegroundColor Gray
    Write-Host "   - Press Ctrl+C in server window to stop" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Server Process ID: $($ExpoProcess.Id)" -ForegroundColor DarkGray
    
    # Keep this window open for monitoring
    Write-Host "Press any key to close this launcher window (server will continue)..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
} catch {
    Write-Host "❌ Error starting development server:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} 