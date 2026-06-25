// routes/users.js — REST API routes for User
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer config — Profile Photo ──
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

// GET all users
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    
    // Default: don't show hidden profiles
    if (!req.query.includeHidden) {
      filter.profileVisibility = { $ne: 'HIDDEN' };
    }

    // Always sort by displayPriority (ascending) to show Premium (1), Professional (50), Starter (100)
    const users = await User.find(filter).sort({ displayPriority: 1 }).select('-passwordHash');
    
    res.json(users.map(u => {
      const t = u.toObject();
      return {
        ...t,
        fullName: [t.firstName, t.lastName].filter(Boolean).join(' ') || '',
        tagline: t.professionalTitle || '',
        category: t.expertiseCategory || '',
        location: t.city || '',
        experience: t.yearsOfExperience || 0,
        rate: t.hourlyRate || 0,
        whatsapp: t.phoneNumber || '',
        linkedin: t.linkedinProfile || '',
        profileImageUrl: t.profilePictureUrl || '',
        bannerImageUrl: t.coverBannerUrl || '',
        certificationsBy: t.certificationsBy || [],  // native certifications array
        introVideo: t.introVideo || t.videoIntro || '', // video URL for frontend
        videoIntro: t.videoIntro || t.introVideo || '', // alias
      };
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user's own profile via auth token
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload avatar
router.post('/profile/upload-avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file uploaded (field: avatar)' });
  const url = `/uploads/profiles/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user.id, { profilePictureUrl: url });
  res.json({ url });
});

// GET single user by ID or email
router.get('/:id', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { email: req.params.id.toLowerCase() };
    const user = await User.findOne(query).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a user's own profile via auth token
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.body._id) delete req.body._id;
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true, runValidators: true,
    }).select('-passwordHash');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update a user — maps dashboard field names → User model field names
router.patch('/:id', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { email: req.params.id.toLowerCase() };

    const body = req.body;
    const update = {};

    // Remove protected fields
    delete body._id;
    delete body.password;
    delete body.passwordHash;

    // Map dashboard field names → User model field names
    if (body.fullName !== undefined) {
      const parts = (body.fullName || '').trim().split(/\s+/);
      update.firstName = parts[0] || '';
      update.lastName = parts.slice(1).join(' ') || '';
    }
    if (body.tagline      !== undefined) update.professionalTitle = body.tagline;
    if (body.category     !== undefined) update.expertiseCategory = body.category;
    if (body.location     !== undefined) update.city              = body.location;
    if (body.deliveryMode !== undefined) update.mode              = body.deliveryMode;
    if (body.rate         !== undefined) update.hourlyRate        = parseFloat(body.rate) || 0;
    if (body.experience   !== undefined) update.yearsOfExperience = parseInt(body.experience) || 0;
    if (body.whatsapp     !== undefined) update.phoneNumber       = body.whatsapp;
    if (body.linkedin     !== undefined) update.linkedinProfile   = body.linkedin;
    if (body.profileImageUrl !== undefined) update.profilePictureUrl = body.profileImageUrl;
    if (body.bannerImageUrl !== undefined) update.coverBannerUrl    = body.bannerImageUrl;
    if (body.certificationsBy !== undefined) {
      // Save directly to certificationsBy field (NOT achievements)
      update.certificationsBy = Array.isArray(body.certificationsBy) ? body.certificationsBy : [];
    }
    if (body.introVideo !== undefined) {
      // Save to both fields so every alias works
      update.introVideo = body.introVideo;
      update.videoIntro = body.introVideo;
    }

    // Social links — merge into socialLinks object
    const social = {};
    if (body.instagram !== undefined) social.instagram = body.instagram;
    if (body.youtube   !== undefined) social.youtube   = body.youtube;
    if (body.twitter   !== undefined) social.twitter   = body.twitter;
    if (body.facebook  !== undefined) social.facebook  = body.facebook;
    if (Object.keys(social).length) update.socialLinks = social;

    // Pass-through fields that match User model directly
    const passthrough = [
      'bio', 'website', 'specialization', 'availability',
      'services', 'packages', 'testimonials', 'videoIntro',
      'portfolioLinks', 'tags', 'skills', 'languages',
      'country', 'firebaseUid',
      // Admin overrides
      'membershipType', 'membershipStatus', 'paymentStatus',
      'isFeatured', 'displayPriority', 'profileVisibility'
    ];
    for (const key of passthrough) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const user = await User.findOneAndUpdate(query, { $set: update }, {
      new: true, runValidators: false,
    }).select('-passwordHash');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
