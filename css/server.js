const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Download directory - Use /tmp for Render or system temp for others
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || path.join(os.tmpdir(), 'ytdl-downloads');

// **NEW: Path to cookies file**
const COOKIES_PATH = path.join(__dirname, 'youtube_cookies.txt');

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Helper to run yt-dlp
const runYtDlp = (args) => {
    return new Promise((resolve, reject) => {
        // **UPDATED: Add cookies if file exists**
        let command = 'yt-dlp';
        if (fs.existsSync(COOKIES_PATH)) {
            command += ` --cookies "${COOKIES_PATH}"`;
        }
        command += ` ${args.join(' ')}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`yt-dlp error: ${stderr}`);
                return reject(error);
            }
            resolve(stdout);
        });
    });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'running',
        download_directory: DOWNLOAD_DIR,
        server: 'Node.js (yt-dlp)',
        cookies_loaded: fs.existsSync(COOKIES_PATH) // **NEW: Show if cookies are available**
    });
});

// List all downloads
app.get('/api/downloads', (req, res) => {
    try {
        if (!fs.existsSync(DOWNLOAD_DIR)) {
            return res.json([]);
        }

        const files = fs.readdirSync(DOWNLOAD_DIR);
        const fileList = files.map(file => {
            const filePath = path.join(DOWNLOAD_DIR, file);
            const stats = fs.statSync(filePath);
            const ext = path.extname(file).toLowerCase().substring(1);

            // Only allow specific media extensions
            const allowedExtensions = ['mp4', 'mp3', 'm4a', 'webm', 'wav', 'jpg', 'jpeg', 'png'];

            // Only include files (not directories) and strictly filter for media types
            if (stats.isFile() && allowedExtensions.includes(ext)) {
                return {
                    name: file,
                    size: stats.size,
                    size_mb: (stats.size / (1024 * 1024)).toFixed(2),
                    atime: stats.atime,
                    mtime: stats.mtime,
                    type: ext
                };
            }
            return null;
        }).filter(f => f !== null && f.size > 0);

        // Sort by most recent first
        fileList.sort((a, b) => b.mtime - a.mtime);

        res.json(fileList);
    } catch (error) {
        console.error('Error listing downloads:', error);
        res.status(500).json({ error: 'Failed to list downloads' });
    }
});

// Download a specific file to browser
app.get('/api/download-file/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(DOWNLOAD_DIR, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Error during file download:', err);
                if (!res.headersSent) {
                    res.status(500).send('Error downloading file');
                }
            }
        });
    } else {
        res.status(404).send('File not found');
    }
});

// Get video info endpoint
app.post('/api/info', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }

        // Get video info using yt-dlp
        console.log(`Fetching info for: ${url}`);
        const stdout = await runYtDlp(['--dump-json', `"${url}"`]);
        const info = JSON.parse(stdout);

        // Extract relevant information
        const videoData = {
            id: info.id,
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration,
            channel: info.uploader,
            views: info.view_count,
            description: info.description,
            upload_date: info.upload_date,
            formats_available: true
        };

        // Format duration as MM:SS (or HH:MM:SS)
        const hours = Math.floor(videoData.duration / 3600);
        const minutes = Math.floor((videoData.duration % 3600) / 60);
        const seconds = videoData.duration % 60;

        if (hours > 0) {
            videoData.duration_formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            videoData.duration_formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // Format views
        const views = videoData.views;
        if (views >= 1000000) {
            videoData.views_formatted = `${(views / 1000000).toFixed(1)}M views`;
        } else if (views >= 1000) {
            videoData.views_formatted = `${(views / 1000).toFixed(1)}K views`;
        } else {
            videoData.views_formatted = `${views} views`;
        }

        res.json(videoData);
    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({ error: `Failed to fetch video info: ${error.message}` });
    }
});

// Added GET handler for debugging
app.get('/api/info', (req, res) => {
    res.status(405).json({ error: 'Please use POST method to fetch video info' });
});

// Download video endpoint
app.post('/api/download', async (req, res) => {
    try {
        const { url, format } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }

        // Get info first to get clean title
        const stdout = await runYtDlp(['--dump-json', `"${url}"`]);
        const info = JSON.parse(stdout);
        const title = info.title.replace(/[^\w\s-]/g, '').trim();

        let filename;
        let ytDlpArgs = [];

        // **UPDATED: Add cookies to spawn arguments if available**
        if (fs.existsSync(COOKIES_PATH)) {
            ytDlpArgs.push('--cookies', COOKIES_PATH);
        }

        // Configure download based on format - using pre-merged formats that don't need ffmpeg
        switch (format) {
            case 'mp4_1080':
                filename = `${title}_best.mp4`;
                ytDlpArgs.push('-f', '22/18/best[ext=mp4]/best');
                break;
            case 'mp4_720':
                filename = `${title}_720p.mp4`;
                ytDlpArgs.push('-f', '22/18/best[ext=mp4]/best');
                break;
            case 'mp4_480':
                filename = `${title}_480p.mp4`;
                ytDlpArgs.push('-f', '18/best[ext=mp4]/best');
                break;
            case 'mp3':
                filename = `${title}.mp3`;
                ytDlpArgs.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
                break;
            case 'thumbnail':
                filename = `${title}_thumbnail.jpg`;
                const thumbnailUrl = info.thumbnail;
                const thumbnailPath = path.join(DOWNLOAD_DIR, filename);

                const httpModule = thumbnailUrl.startsWith('https') ? require('https') : require('http');
                const file = fs.createWriteStream(thumbnailPath);
                httpModule.get(thumbnailUrl, response => {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        res.json({
                            success: true,
                            filename: filename,
                            filepath: thumbnailPath,
                            downloadUrl: `/api/download-file/${encodeURIComponent(filename)}`,
                            message: `Downloaded successfully to ${DOWNLOAD_DIR}`
                        });
                    });
                }).on('error', (err) => {
                    fs.unlink(thumbnailPath, () => { });
                    res.status(500).json({ error: `Failed to download thumbnail: ${err.message}` });
                });
                return;
            default:
                filename = `${title}.mp4`;
                ytDlpArgs.push('-f', '22/18/best[ext=mp4]/best');
        }

        const outputPath = path.join(DOWNLOAD_DIR, filename);

        // Add common args for reliability
        ytDlpArgs.push(
            '--no-warnings',
            '--no-playlist',
            '-o', outputPath,
            url
        );

        console.log(`Starting download: yt-dlp ${ytDlpArgs.join(' ')}`);

        // Use spawn for download
        const child = spawn('yt-dlp', ytDlpArgs);

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        child.on('close', (code) => {
            const fileExists = fs.existsSync(outputPath);
            const fileSize = fileExists ? fs.statSync(outputPath).size : 0;

            if (fileExists && fileSize > 0) {
                console.log(`Download successful: ${filename} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
                res.json({
                    success: true,
                    filename: filename,
                    filepath: outputPath,
                    downloadUrl: `/api/download-file/${encodeURIComponent(filename)}`,
                    message: `Downloaded successfully to ${DOWNLOAD_DIR}`
                });
            } else if (code === 0) {
                res.json({
                    success: true,
                    filename: filename,
                    filepath: outputPath,
                    downloadUrl: `/api/download-file/${encodeURIComponent(filename)}`,
                    message: `Downloaded successfully to ${DOWNLOAD_DIR}`
                });
            } else {
                console.error(`yt-dlp process exited with code ${code}, file exists: ${fileExists}, size: ${fileSize}`);
                res.status(500).json({ error: `Download failed with exit code ${code}` });
            }
        });

    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ error: `Download failed: ${error.message}` });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'YouTube Downloader API',
        version: '1.1.0',
        server: 'Node.js (yt-dlp)',
        endpoints: {
            '/api/health': 'GET - Check server status',
            '/api/info': 'POST - Get video information',
            '/api/download': 'POST - Download video'
        },
        download_directory: DOWNLOAD_DIR,
        cookies_loaded: fs.existsSync(COOKIES_PATH) // **NEW**
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('YouTube Downloader Server (Node.js) Starting...');
    console.log(`Download Directory: ${DOWNLOAD_DIR}`);
    console.log(`Cookies File: ${fs.existsSync(COOKIES_PATH) ? 'LOADED ✓' : 'NOT FOUND ✗'}`); // **NEW**
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log('Using yt-dlp for downloads');
    console.log('='.repeat(60));
});
