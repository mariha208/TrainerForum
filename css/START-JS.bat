@echo off
echo ========================================
echo YouTube Downloader (JavaScript Version)
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found: 
node --version
echo.

echo Checking if dependencies are installed...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

echo ========================================
echo Starting YouTube Downloader Server...
echo ========================================
echo.
echo Server will start in a new window.
echo Keep that window open while using the app.
echo.

start "YouTube Downloader Server" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo Opening web interface...
start "" app.html

echo.
echo ========================================
echo YouTube Downloader is now running!
echo ========================================
echo.
echo Next steps:
echo 1. Wait for server window to show "Server running on: http://localhost:3000"
echo 2. Your browser should open automatically
echo 3. Paste a YouTube URL and click FETCH
echo 4. Select your format and download
echo.
echo Downloads will be saved to: %USERPROFILE%\Downloads\YouTube
echo.
echo To stop the server, close the server window or press Ctrl+C
echo.
pause
