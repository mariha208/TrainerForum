# YouTube Video Downloader (JavaScript/Node.js Version)

A pure **JavaScript/HTML** YouTube video downloader with a modern cyberpunk-themed UI. No React, no build tools - just vanilla JavaScript!

## ✨ Features

- 📹 **Download YouTube videos** in multiple formats (1080p, 720p, 480p MP4)
- 🎵 **Audio extraction** to MP3
- 🖼️ **Thumbnail downloads**
- 🎨 **Modern cyberpunk UI** with smooth animations
- 💾 **Offline storage** to your Downloads folder
- 🚀 **Pure vanilla JavaScript** - no frameworks needed!

## 📋 Prerequisites

### Required
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Optional (for MP3 conversion)
- **FFmpeg** 
  - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - **Mac**: `brew install ffmpeg`
  - **Linux**: `sudo apt install ffmpeg`

## 🚀 Quick Start

### Step 1: Install Dependencies

Open your terminal/command prompt in the project folder and run:

```bash
npm install
```

This will install:
- `express` - Web server
- `cors` - Cross-origin support
- `@distube/ytdl-core` - YouTube downloader library
- `fluent-ffmpeg` - Audio conversion (optional)

### Step 2: Start the Server

```bash
npm start
```

Or:

```bash
node server.js
```

You should see:

```
============================================================
YouTube Downloader Server (Node.js) Starting...
Download Directory: /Users/YourName/Downloads/YouTube
Server running on: http://localhost:3000
============================================================
```

**Keep this terminal window open!**

### Step 3: Open the App

Open `app.html` in your web browser:
- Double-click `app.html`, or
- Drag it into your browser, or
- Right-click → Open With → Chrome/Firefox

### Step 4: Download Videos! 🎥

1. Check that "Server Online" is green in the top-right
2. Paste a YouTube URL
3. Click **FETCH**
4. Choose your format
5. Download!

Files save to: `~/Downloads/YouTube/`

## 📁 Project Structure

```
youtube-downloader/
├── server.js           # Node.js backend server
├── app.html           # Pure HTML/JavaScript frontend (no React!)
├── package.json       # Node.js dependencies
└── README.md         # This file
```

## 🔧 Troubleshooting

### "Cannot find module 'express'"

Run: `npm install`

### "Server Offline" in the browser

1. Make sure you ran `node server.js`
2. Check the terminal for errors
3. Ensure port 3000 isn't being used by another app

### Can't download MP3

Install FFmpeg (see Prerequisites above)

### Port 3000 already in use

Edit `server.js` and change the PORT:

```javascript
const PORT = 3000; // Change to 4000, 5000, etc.
```

Then update `app.html`:

```javascript
const API_URL = 'http://localhost:3000/api'; // Update to match
```

## 🎯 API Endpoints

The server provides these REST endpoints:

### GET `/api/health`
Check server status
```bash
curl http://localhost:3000/api/health
```

### POST `/api/info`
Get video information
```bash
curl -X POST http://localhost:3000/api/info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=..."}'
```

### POST `/api/download`
Download video
```bash
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=...", "format": "mp4_720"}'
```

## 📦 Available Formats

| Format ID | Description | Approx Size |
|-----------|-------------|-------------|
| `mp4_1080` | 1080p Video | ~150 MB |
| `mp4_720` | 720p Video | ~80 MB |
| `mp4_480` | 480p Video | ~40 MB |
| `mp3` | Audio Only | ~5 MB |
| `thumbnail` | Thumbnail Image | ~200 KB |

## 🌟 Features Explained

### Pure JavaScript
No React, Vue, or Angular - just vanilla JavaScript. Easy to understand and modify!

### No Build Process
No webpack, no babel, no bundlers. Just open the HTML file and it works!

### Modern ES6+
Uses modern JavaScript features like async/await, fetch API, and arrow functions.

### Responsive Design
Works on desktop, tablet, and mobile devices.

### Animated UI
Smooth animations and transitions for a professional feel.

## 🔒 Privacy & Security

- ✅ Everything runs locally on your computer
- ✅ No data sent to third-party servers
- ✅ No tracking or analytics
- ✅ Open source - inspect the code yourself

## 💡 Tips

**Download multiple videos:** Open multiple browser tabs with the app!

**Change download location:** Edit `DOWNLOAD_DIR` in `server.js`

**Speed up downloads:** Close other bandwidth-heavy applications

**Avoid errors:** Use valid, public YouTube URLs (no age-restricted or private videos)

## ⚠️ Legal Notice

This tool is for **educational purposes only**. 

- Only download videos you have permission to download
- Respect YouTube's Terms of Service
- Respect copyright laws
- Don't redistribute copyrighted content

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- ytdl-core (@distube fork)
- FFmpeg (optional)

**Frontend:**
- Pure HTML5
- Vanilla JavaScript (ES6+)
- CSS3 with custom animations
- No frameworks or libraries!

## 🐛 Known Issues

- **Age-restricted videos**: Not supported (requires authentication)
- **Very long videos**: May take time to download
- **Premium content**: Cannot download YouTube Premium content
- **Live streams**: Not supported

## 🚀 Advanced Usage

### Custom Download Directory

Edit `server.js`:

```javascript
const DOWNLOAD_DIR = '/your/custom/path';
```

### Run Server on Different Port

Edit `server.js`:

```javascript
const PORT = 5000; // Any available port
```

### Enable Debug Mode

Add to `server.js`:

```javascript
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
```

## 📝 FAQ

**Q: Why Node.js instead of Python?**
A: JavaScript on both frontend and backend! Easier for web developers.

**Q: Can I use this commercially?**
A: Check YouTube's Terms of Service and copyright laws in your region.

**Q: Does this work with playlists?**
A: No, one video at a time. You can download multiple videos by opening multiple tabs.

**Q: What's the maximum quality?**
A: Up to 1080p (higher resolutions may be available for some videos).

**Q: Can I download from other platforms?**
A: This version is YouTube-only. ytdl-core supports YouTube primarily.

**Q: Is my internet speed important?**
A: Yes! Faster internet = faster downloads.

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - Free to use with attribution

## 🙏 Credits

- Built with [Express.js](https://expressjs.com/)
- Downloads powered by [@distube/ytdl-core](https://github.com/distubejs/ytdl-core)
- UI inspired by cyberpunk aesthetics

---

**Enjoy downloading! 🎬✨**

Made with ❤️ using pure JavaScript
