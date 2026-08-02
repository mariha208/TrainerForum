// routes/auth.js — Authentication REST API
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, professionalTitle, expertiseCategory, expertiseCategory1, expertiseCategory2, expertiseCategory3, city, linkedinProfile, bio, hourlyRate, skills, phoneNumber, country, yearsOfExperience, website, membershipType } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let assignedMembershipType = membershipType || 'FREE';
    let paymentStatus = 'FREE';
    let isFeatured = false;
    let displayPriority = 100;

    if (assignedMembershipType === 'PREMIUM') {
      paymentStatus = 'PAID';
      isFeatured = true;
      displayPriority = 1;
    } else if (assignedMembershipType === 'STANDARD') {
      paymentStatus = 'PAID';
      displayPriority = 50;
    } else {
      assignedMembershipType = 'FREE'; // ensure fallback
    }

    const targetRole = role || 'trainer';
    const isTrainer = targetRole === 'trainer';
    const initialStatus = isTrainer ? 'pending' : 'approved';
    const initialApproved = !isTrainer;

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: targetRole,
      professionalTitle,
      expertiseCategory,
      expertiseCategory1,
      expertiseCategory2,
      expertiseCategory3,
      city,
      linkedinProfile,
      bio,
      hourlyRate,
      skills: skills || [],
      phoneNumber,
      country,
      website,
      sessions: '0',
      reviews: 0,
      rating: 5.0,
      
      // Membership & Approval Controls
      membershipType: assignedMembershipType,
      membershipStatus: 'ACTIVE',
      paymentStatus,
      isFeatured,
      displayPriority,
      profileVisibility: 'PUBLIC',
      status: initialStatus,
      isApproved: initialApproved,
      
      verified: true // Automatically verified for demo
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;

    const message = isTrainer
      ? 'Registration submitted! Your profile is pending admin approval.'
      : 'Registration successful';

    res.status(201).json({ message, token, user: userResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Access Control: Block pending or rejected trainers
    if (user.role === 'trainer' && user.status && user.status !== 'approved') {
      return res.status(403).json({
        error: 'Your profile is under review. You will receive an email/WhatsApp notification once approved.'
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({ message: 'Login successful', token, user: userResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SECURITY HELPERS & RATE LIMITING ──────────────────────────────────────────
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/emailService');

// In-memory rate limiting map for password reset requests: IP/email -> timestamps array
const resetAttemptsMap = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3;

  const timestamps = (resetAttemptsMap.get(key) || []).filter(ts => now - ts < windowMs);
  if (timestamps.length >= maxAttempts) {
    return true;
  }
  timestamps.push(now);
  resetAttemptsMap.set(key, timestamps);
  return false;
}

function validatePasswordCriteria(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.json({ message: "If an account exists, we've sent a password reset link." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rateLimitKey = `${req.ip}_${cleanEmail}`;

    if (isRateLimited(rateLimitKey)) {
      return res.status(429).json({
        error: 'Too many password reset requests. Please wait 15 minutes before trying again.'
      });
    }

    // Always respond with identical non-revealing message to prevent account enumeration
    const successMsg = "If an account exists, we've sent a password reset link.";

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.json({ message: successMsg });
    }

    // Google OAuth users manage password via Google
    if (user.authProvider === 'google') {
      return res.json({ message: successMsg });
    }

    // Generate secure random unhashed token
    const unhashedToken = crypto.randomBytes(32).toString('hex');

    // Hash token using SHA-256 for DB storage
    const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');

    // Save hashed token and 15-minute expiration
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save({ validateBeforeSave: false });

    // Determine host origin for reset link
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const resetUrl = `${protocol}://${host}/reset-password.html?token=${unhashedToken}`;

    // Send email asynchronously
    const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
    sendPasswordResetEmail({
      email: user.email,
      name: userName,
      resetUrl
    }).catch(err => {
      console.error('[Forgot Password] Email send error:', err.message);
      console.error('[Forgot Password] Full error stack:', err.stack || err);
    });

    return res.json({ message: successMsg });
  } catch (err) {
    console.error('[Forgot Password] Error:', err);
    res.status(500).json({ error: 'An internal error occurred. Please try again later.' });
  }
});

// ── POST /api/auth/verify-reset-token ────────────────────────────────────────
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ valid: false, error: 'Password reset link is invalid or missing token.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ valid: false, error: 'Password reset link is invalid or has expired.' });
    }

    res.json({ valid: true, email: user.email });
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

// ── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    const valErr = validatePasswordCriteria(newPassword);
    if (valErr) {
      return res.status(400).json({ error: valErr });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset link is invalid or has expired.' });
    }

    // Update password
    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Invalidate reset token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successful! You can now log in with your new password.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/change-password ───────────────────────────────────────────
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({ error: 'Password is managed through your Google account.' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Account does not have a password set.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    // Validate new password criteria
    const valErr = validatePasswordCriteria(newPassword);
    if (valErr) {
      return res.status(400).json({ error: valErr });
    }

    // Hash and update password
    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

