'use strict';
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const jwt     = require('jsonwebtoken');
const TrainerProfile = require('../models/TrainerProfile');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// ── Auth middleware (same Bearer/authToken scheme as /api/auth) ───────────
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── 2A. Multer config — Profile Photo only (server-stored, CDN-style URL) ─
const AVATAR_DIR = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`)
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype))
});

// ── GET /api/trainers/public — public listing of all verified trainers with full data ──
router.get('/public', async (req, res) => {
  try {
    const profiles = await TrainerProfile.find({ role: 'trainer' }).lean();
    
    // Clean out sensitive data just in case
    const safeProfiles = profiles.map(p => {
      delete p.password;
      return p;
    });
    
    res.json(safeProfiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/trainers/profile/:id — unified state (dashboard + public card source) ──
router.get('/profile/:id', async (req, res) => {
  const profile = await TrainerProfile.findById(req.params.id).lean();
  if (!profile) return res.status(404).json({ error: 'Trainer not found' });
  delete profile.password;
  res.json(profile);
});

// ── PUT /api/trainer/profile/:id — single save endpoint for the whole pipeline ──
// Accepts text fields, achievements/events (with embedded base64 images),
// and coverBannerUrl (base64). profilePictureUrl is NOT writable here —
// it only changes via /upload-avatar.
router.put('/profile/:id', authenticate, async (req, res) => {
  if (String(req.user.id) !== String(req.params.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const ALLOWED = [
    'firstName', 'lastName', 'professionalTitle', 'expertiseCategory', 'bio',
    'city', 'country', 'mode', 'languages', 'skills', 'hourlyRate', 'yearsOfExperience',
    'phoneNumber', 'linkedinProfile', 'website', 'socialLinks',
    'coverBannerUrl', 'achievements', 'events',
    'videoIntro', 'services', 'packages', 'availability', 'portfolio',
  ];

  const update = {};
  for (const key of ALLOWED) {
    if (key in req.body) update[key] = req.body[key];
  }

  const profile = await TrainerProfile.findByIdAndUpdate(
    req.params.id, update, { new: true, runValidators: true }
  ).lean();

  if (!profile) return res.status(404).json({ error: 'Trainer not found' });
  delete profile.password;
  res.json({ user: profile });
});

// ── POST /api/trainer/profile/upload-avatar — 2A. Database-Mapped Core Asset ──
router.post('/profile/upload-avatar', authenticate, uploadAvatar.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file uploaded (field: avatar)' });

  const url = `/uploads/profiles/${req.file.filename}`;
  await TrainerProfile.findByIdAndUpdate(req.user.id, { profilePictureUrl: url });

  res.json({ url });
});

module.exports = router;

/* ── Mount in server.js ─────────────────────────────────────────────────
   const path = require('path');
   app.use(express.json({ limit: '12mb' }));   // headroom for base64 cert/event/banner images
   app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
   app.use('/api/trainer', require('./routes/trainerProfile.routes'));
*/
