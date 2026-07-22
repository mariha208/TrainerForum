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
    // Guard: if MongoDB is not connected, return empty array gracefully
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.warn('[Users API] MongoDB not connected — returning empty list');
      return res.json([]);
    }

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    
    // Default: don't show hidden or unapproved profiles on public requests
    if (!req.query.includeHidden) {
      filter.profileVisibility = { $ne: 'HIDDEN' };
      if (req.query.role === 'trainer') {
        filter.status = { $ne: 'rejected' };
        filter.$or = [
          { status: 'approved' },
          { status: { $exists: false } },
          { isApproved: true }
        ];
      }
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
    console.error('[Users API] GET / error:', err.message);
    // Return empty array instead of crashing the admin panel
    res.json([]);
  }
});

// Helper: Automated email & WhatsApp notification dispatch
async function sendApprovalNotification(trainer) {
  const email = trainer.email;
  const name = [trainer.firstName, trainer.lastName].filter(Boolean).join(' ') || trainer.fullName || 'Trainer';
  const phone = trainer.phoneNumber || trainer.whatsapp || '';

  const subject = "Congratulations! Your Trainer Profile is Approved 🎉";
  const body = `Hello ${name}, your trainer account on World Trainer Forum has been approved! You can now log in to your dashboard and manage your profile.`;

  console.log(`\n📧 [APPROVAL EMAIL DISPATCH] To: ${email}\nSubject: ${subject}\nBody: ${body}\n`);
  console.log(`💬 [WHATSAPP DISPATCH LOG] To: ${phone}\nMessage: ${body}\n`);

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: `"World Trainer Forum" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        text: body,
        html: `<div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #c5a059; margin-top: 0;">Congratulations! Your Trainer Profile is Approved 🎉</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your trainer account on <strong>World Trainer Forum</strong> has been approved!</p>
          <p>You can now log in to your dashboard to complete your profile, manage services, and receive booking requests from clients worldwide.</p>
          <p style="margin-top: 28px;">
            <a href="https://www.worldtrainerforum.com" style="background: linear-gradient(135deg, #c5a059, #e8c97a); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log In to Dashboard</a>
          </p>
        </div>`
      });
      console.log(`✅ [Nodemailer] Approval email successfully sent to ${email}`);
    } catch (mailErr) {
      console.warn(`[Nodemailer] Mail send warning:`, mailErr.message);
    }
  }
}

// PATCH approve a trainer
router.patch('/:id/approve', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { email: req.params.id.toLowerCase() };

    const user = await User.findOneAndUpdate(
      query,
      { $set: { status: 'approved', isApproved: true } },
      { new: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ error: 'Trainer not found' });

    await sendApprovalNotification(user);

    res.json({ message: 'Trainer approved successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH reject a trainer
router.patch('/:id/reject', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { email: req.params.id.toLowerCase() };

    const user = await User.findOneAndUpdate(
      query,
      { $set: { status: 'rejected', isApproved: false } },
      { new: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ error: 'Trainer not found' });

    res.json({ message: 'Trainer profile rejected', user });
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
    if (body.category1    !== undefined) update.expertiseCategory1 = body.category1;
    if (body.category2    !== undefined) update.expertiseCategory2 = body.category2;
    if (body.category3    !== undefined) update.expertiseCategory3 = body.category3;
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
