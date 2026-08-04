// server.js — Express server for World Trainer Forum backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
const allowedOrigins = [
  'https://worldtrainerforum.com',
  'https://www.worldtrainerforum.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  // Render self-origin (server-to-server or preview)
  'https://trainerforum.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no Origin header (curl, Postman, mobile apps, SSR)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: Origin not allowed — ' + origin), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Handle CORS and OPTIONS preflight for all routes
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// ── API Routes ────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const requirementsRoutes = require('./routes/requirements');
const bookingsRoutes = require('./routes/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/requirements', requirementsRoutes);
app.use('/api/bookings', bookingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'World Trainer Forum API is running.' });
});

// ── Trainers Route — Returns users with role 'trainer' ───────────────────────
app.get('/api/trainers', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    // Guard: if MongoDB is not connected, return empty array gracefully
    if (mongoose.connection.readyState !== 1) {
      console.warn('[Trainers API] MongoDB not connected — returning empty list');
      return res.json([]);
    }
    const User = require('./models/User');

    const filter = { role: 'trainer' };
    
    // For public requests, show only approved trainers (or legacy profiles without status)
    if (req.query.includeHidden !== 'true') {
      filter.profileVisibility = { $ne: 'HIDDEN' };
      filter.status = { $ne: 'rejected' };
      filter.$or = [
        { status: 'approved' },
        { status: { $exists: false } },
        { isApproved: true }
      ];
    }

    const trainers = await User.find(filter).sort({ displayPriority: 1 }).select('-passwordHash');
    const result = trainers.map(tr => {
      const obj = tr.toObject();
      const customBlocked = obj.customBlockedDates || obj.blockedDates || (obj.availability && (obj.availability.customBlockedDates || obj.availability.blockedDates)) || [];
      const weekly = obj.weeklySchedule || obj.weeklyAvailability || (obj.availability && (obj.availability.weeklySchedule || obj.availability.weeklyAvailability)) || [];
      obj.customBlockedDates = customBlocked;
      obj.blockedDates = customBlocked;
      obj.weeklySchedule = weekly;
      obj.weeklyAvailability = weekly;
      if (obj.availability && typeof obj.availability === 'object') {
        obj.availability.customBlockedDates = customBlocked;
        obj.availability.blockedDates = customBlocked;
        obj.availability.weeklySchedule = weekly;
        obj.availability.weeklyAvailability = weekly;
      }
      return obj;
    });
    res.json(result);
  } catch (err) {
    console.error('[Trainers API] Error:', err.message);
    res.json([]);
  }
});

// ── GET single trainer public endpoint ───────────────────────────────────────
app.get(['/api/trainers/:id', '/api/trainers/public/:id'], async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const tid = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(tid);
    const query = isObjectId ? { _id: tid } : { email: String(tid).toLowerCase() };
    const user = await User.findOne(query).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'Trainer not found' });
    
    const obj = user.toObject();
    const customBlocked = obj.customBlockedDates || obj.blockedDates || (obj.availability && (obj.availability.customBlockedDates || obj.availability.blockedDates)) || [];
    const weekly = obj.weeklySchedule || obj.weeklyAvailability || (obj.availability && (obj.availability.weeklySchedule || obj.availability.weeklyAvailability)) || [];
    obj.customBlockedDates = customBlocked;
    obj.blockedDates = customBlocked;
    obj.weeklySchedule = weekly;
    obj.weeklyAvailability = weekly;
    if (obj.availability && typeof obj.availability === 'object') {
      obj.availability.customBlockedDates = customBlocked;
      obj.availability.blockedDates = customBlocked;
      obj.availability.weeklySchedule = weekly;
      obj.availability.weeklyAvailability = weekly;
    }
    res.json({ trainer: obj, ...obj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// ── Direct Trainer Availability & Blocked Dates API Endpoints ──────────────────
app.put('/api/trainer/availability', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const { trainerId, email, availability, blockedDates, weeklyAvailability, availableDays, bookedDates } = req.body;
    let userId = trainerId || email || (req.user && req.user.id);
    
    if (!userId || mongoose.connection.readyState !== 1) {
      return res.json({ message: 'Availability stored locally', availability, blockedDates });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(userId);
    const query = isObjectId ? { _id: userId } : { email: String(userId).toLowerCase() };

    const update = { availability: availability || {} };
    if (Array.isArray(blockedDates)) update.blockedDates = blockedDates;
    if (Array.isArray(bookedDates)) update.bookedDates = bookedDates;
    if (weeklyAvailability) update.weeklyAvailability = weeklyAvailability;
    if (availableDays) update.availableDays = availableDays;

    const user = await User.findOneAndUpdate(
      query,
      { $set: update },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.json({ message: 'Availability updated', availability, blockedDates });
    }
    res.json({ message: 'Availability updated in database', availability: user.availability, blockedDates: user.blockedDates, weeklyAvailability: user.weeklyAvailability, availableDays: user.availableDays, bookedDates: user.bookedDates, user });
  } catch (err) {
    console.warn('[Availability API] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/trainer/blocked-dates', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const { trainerId, email, blockedDates, availability, weeklyAvailability, availableDays, bookedDates } = req.body;
    let userId = trainerId || email || (req.user && req.user.id);

    if (!userId || mongoose.connection.readyState !== 1) {
      return res.json({ message: 'Blocked dates stored locally', blockedDates, availability });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(userId);
    const query = isObjectId ? { _id: userId } : { email: String(userId).toLowerCase() };

    const update = {};
    if (Array.isArray(blockedDates)) update.blockedDates = blockedDates;
    if (Array.isArray(bookedDates)) update.bookedDates = bookedDates;
    if (availability) update.availability = availability;
    if (weeklyAvailability) update.weeklyAvailability = weeklyAvailability;
    if (availableDays) update.availableDays = availableDays;

    const user = await User.findOneAndUpdate(
      query,
      { $set: update },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.json({ message: 'Blocked dates updated', blockedDates, availability });
    }
    res.json({ message: 'Blocked dates updated in database', blockedDates: user.blockedDates, availability: user.availability, weeklyAvailability: user.weeklyAvailability, availableDays: user.availableDays, bookedDates: user.bookedDates, user });
  } catch (err) {
    console.warn('[Blocked Dates API] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Direct Services & Packages Endpoints (Aliases) ──────────────────────────
app.delete('/api/services/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const Service = require('./models/Service');
    const sid = String(req.params.id);

    if (mongoose.Types.ObjectId.isValid(sid)) {
      await Service.findByIdAndDelete(sid).catch(() => {});
    }

    const userId = req.query.userId || req.query.trainerId || req.body?.userId || req.body?.trainerId;
    let user;
    if (userId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(userId);
      const query = isObjectId ? { _id: userId } : { email: String(userId).toLowerCase() };
      user = await User.findOne(query);
    } else {
      user = await User.findOne({
        $or: [
          { 'services.id': sid },
          { 'services._id': sid },
          { 'services.name': new RegExp('^' + sid + '$', 'i') },
          { 'services.title': new RegExp('^' + sid + '$', 'i') }
        ]
      });
    }

    if (user) {
      user.services = (user.services || []).filter(s => {
        const key = String(s.id || s._id || '');
        return key !== sid && String(s.name || s.title || '').toLowerCase() !== sid.toLowerCase();
      });
      user.markModified('services');
      await user.save();
    }

    res.json({ message: 'Service deleted permanently from MongoDB', serviceId: sid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const Service = require('./models/Service');
    const sid = String(req.params.id);

    if (mongoose.Types.ObjectId.isValid(sid)) {
      await Service.findByIdAndUpdate(sid, req.body, { new: true }).catch(() => {});
    }

    const userId = req.body?.userId || req.body?.trainerId || req.query.userId || req.query.trainerId;
    let user;
    if (userId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(userId);
      const query = isObjectId ? { _id: userId } : { email: String(userId).toLowerCase() };
      user = await User.findOne(query);
    } else {
      user = await User.findOne({
        $or: [
          { 'services.id': sid },
          { 'services._id': sid },
          { 'services.name': new RegExp('^' + sid + '$', 'i') },
          { 'services.title': new RegExp('^' + sid + '$', 'i') }
        ]
      });
    }

    if (user) {
      let services = Array.isArray(user.services) ? user.services : [];
      let idx = services.findIndex(s => String(s._id || s.id || '') === sid || String(s.name || s.title || '').toLowerCase() === sid.toLowerCase());
      if (idx !== -1) {
        services[idx] = { ...services[idx], ...req.body, id: services[idx].id || services[idx]._id || sid, _id: services[idx]._id || services[idx].id || sid };
      } else {
        services.push({ ...req.body, id: sid, _id: sid });
      }
      user.services = services;
      user.markModified('services');
      await user.save();
    }

    res.json({ message: 'Service updated in MongoDB', id: sid, data: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const Package = require('./models/Package');
    const pid = String(req.params.id);

    if (mongoose.Types.ObjectId.isValid(pid)) {
      await Package.findByIdAndDelete(pid).catch(() => {});
    }

    const userId = req.query.userId || req.query.trainerId || req.body?.userId || req.body?.trainerId;
    let user;
    if (userId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(userId);
      const query = isObjectId ? { _id: userId } : { email: String(userId).toLowerCase() };
      user = await User.findOne(query);
    } else {
      user = await User.findOne({
        $or: [
          { 'packages.id': pid },
          { 'packages._id': pid },
          { 'packages.name': new RegExp('^' + pid + '$', 'i') },
          { 'packages.title': new RegExp('^' + pid + '$', 'i') }
        ]
      });
    }

    if (user) {
      user.packages = (user.packages || []).filter(p => {
        const key = String(p.id || p._id || '');
        return key !== pid && String(p.name || p.title || '').toLowerCase() !== pid.toLowerCase();
      });
      user.markModified('packages');
      await user.save();
    }

    res.json({ message: 'Package deleted permanently from MongoDB', packageId: pid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/packages/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    const Package = require('./models/Package');
    const pid = String(req.params.id);

    if (mongoose.Types.ObjectId.isValid(pid)) {
      await Package.findByIdAndUpdate(pid, req.body, { new: true }).catch(() => {});
    }

    const userId = req.body?.userId || req.body?.trainerId || req.query.userId || req.query.trainerId;
    let user;
    if (userId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(userId);
      const query = isObjectId ? { _id: userId } : { email: String(userId).toLowerCase() };
      user = await User.findOne(query);
    } else {
      user = await User.findOne({
        $or: [
          { 'packages.id': pid },
          { 'packages._id': pid },
          { 'packages.name': new RegExp('^' + pid + '$', 'i') },
          { 'packages.title': new RegExp('^' + pid + '$', 'i') }
        ]
      });
    }

    if (user) {
      let packages = Array.isArray(user.packages) ? user.packages : [];
      let idx = packages.findIndex(p => String(p._id || p.id || '') === pid || String(p.name || p.title || '').toLowerCase() === pid.toLowerCase());
      if (idx !== -1) {
        packages[idx] = { ...packages[idx], ...req.body, id: packages[idx].id || packages[idx]._id || pid, _id: packages[idx]._id || packages[idx].id || pid };
      } else {
        packages.push({ ...req.body, id: pid, _id: pid });
      }
      user.packages = packages;
      user.markModified('packages');
      await user.save();
    }

    res.json({ message: 'Package updated in MongoDB', id: pid, data: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/images', require('./routes/images'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/notifications', require('./routes/notifications'));

// ── Catch-all: serve index.html ───────────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
