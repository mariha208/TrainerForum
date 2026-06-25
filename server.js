// server.js — Express server for World Trainer Forum backend
require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./db');
const fs = require('fs');
const multer = require('multer');
const { uploadFileToCloudinary } = require('./services/driveUpload');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// ── API Routes ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'World Trainer Forum API is running.' });
});

// ── Google Apps Script Proxy (bypasses CORS for browser fetches) ──────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHHlofzvb_rdgb6goyLhu8BPdeRX5g3eS-fCWgUrPKd4MipkzNsCaAZNz1SnhsSDVs/exec';

let gsheetCache = null;
let lastGsheetFetch = 0;
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

app.get('/api/gsheet', async (req, res) => {
  // We will always attempt to fetch fresh data to ensure real-time synchronization
  console.log('[GSheet GET] Fetching fresh data from Google Apps Script...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(APPS_SCRIPT_URL, {
      redirect: 'follow',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const rawText = await response.text();
    console.log('[GSheet GET] HTTP status:', response.status);

    try {
      const data = JSON.parse(rawText);
      
      // If Apps Script returns an error object instead of an array, force fallback
      if (data.status === 'error' || data.error) {
        throw new Error('Apps Script returned an error: ' + (data.message || data.error));
      }
      
      gsheetCache = data;
      lastGsheetFetch = Date.now();
      
      // Save valid data as fallback
      fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2), 'utf8', () => {});
      
      res.json(data);
    } catch (parseOrAppScriptErr) {
      console.warn('[GSheet GET] Invalid data or error from Apps Script. Falling back to local data:', parseOrAppScriptErr.message);
      fallbackToLocalData(res);
    }
  } catch (err) {
    console.error('[GSheet GET] Fetch error/timeout:', err.message);
    fallbackToLocalData(res);
  }
});

function fallbackToLocalData(res) {
  // Always read data.json fresh — never serve stale in-memory cache as fallback
  gsheetCache = null;
  try {
    const dataPath = path.join(__dirname, 'data.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath);
      const isUtf16LE = raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe;
      const jsonStr = raw.toString(isUtf16LE ? 'utf16le' : 'utf8');
      const data = JSON.parse(jsonStr.replace(/^\uFEFF/, '')); // strip BOM
      console.log('[GSheet GET] Serving from data.json fallback.');
      return res.json(data);
    }
  } catch (e) {
    console.error('[GSheet GET] Fallback failed:', e.message);
  }
  res.status(502).json({ error: 'Failed to fetch data and no fallback available' });
}


app.post('/api/gsheet', async (req, res) => {
  try {
    console.log('[GSheet POST] Sending payload keys:', Object.keys(req.body));
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow'
    });
    const rawText = await response.text();
    console.log('[GSheet POST] HTTP status:', response.status);
    console.log('[GSheet POST] Apps Script response:', rawText.slice(0, 600));
    // Try to parse — Apps Script returns JSON on success
    let parsed = null;
    try { parsed = JSON.parse(rawText); } catch { }
    if (parsed && (parsed.result === 'success' || parsed.status === 'success')) {
      // Clear cache to ensure fresh data is fetched next time
      gsheetCache = null;
      lastGsheetFetch = 0;
      res.json({ success: true, details: parsed });
    } else {
      // Still return 200 to client (POST worked), but log the issue
      console.warn('[GSheet POST] Apps Script did not confirm success. Check script logs.');
      res.json({ success: false, hint: 'Apps Script did not return {result:"success"}', raw: rawText.slice(0, 300) });
    }
  } catch (err) {
    console.error('[GSheet POST] Fetch error:', err.message);
    res.status(502).json({ error: 'Failed to post to Google Sheets', detail: err.message });
  }
});

// ── Image Upload Route ───────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageType = req.body.type || 'profile'; // 'profile' or 'banner'
    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `trainer-${imageType}-${timestamp}.${ext}`;

    console.log(`[Upload] Received ${imageType} image: ${req.file.originalname} (${req.file.size} bytes)`);

    const publicUrl = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      fileName,
      imageType
    );

    res.json({ url: publicUrl, type: imageType });
  } catch (err) {
    console.error('[Upload] Cloudinary upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payment.routes'));

app.use('/api/images', require('./routes/images'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reviews', require('./routes/reviews'));

// ── Catch-all: serve index.html (Express 5 syntax) ───────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
