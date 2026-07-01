#!/bin/bash

echo "========================================"
echo "YouTube Downloader (JavaScript Version)"
echo "========================================"
echo ""

# Check Node.js installation
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "Node.js found: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
    echo ""
fi

# Check FFmpeg (optional)
echo "Checking FFmpeg installation..."
if ! command -v ffmpeg &> /dev/null; then
    echo "WARNING: FFmpeg not found"
    echo "MP3 downloads will not work without FFmpeg"
    echo ""
    echo "Install FFmpeg:"
    echo "  Mac:   brew install ffmpeg"
    echo "  Linux: sudo apt install ffmpeg"
    echo ""
else
    echo "FFmpeg found: $(ffmpeg -version | head -n1)"
    echo ""
fi

echo "========================================"
echo "Starting YouTube Downloader Server..."
echo "========================================"
echo ""
echo "Server starting in background..."
echo "Keep this terminal open while using the app."
echo ""

# Start server in background
node server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Open browser
echo "Opening web interface..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open app.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open app.html
    else
        echo "Please open app.html in your browser manually"
    fi
fi

echo ""
echo "========================================"
echo "YouTube Downloader is now running!"
echo "========================================"
echo ""
echo "Server PID: $SERVER_PID"
echo "Server URL: http://localhost:3000"
echo "Downloads location: ~/Downloads/YouTube"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Wait for Ctrl+C
trap "kill $SERVER_PID; exit" INT
wait $SERVER_PID
