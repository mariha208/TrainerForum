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
    const { email, password, firstName, lastName, role, professionalTitle, expertiseCategory, city, linkedinProfile, bio, hourlyRate, skills, phoneNumber, country, yearsOfExperience, website, membershipType } = req.body;

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

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: role || 'trainer',
      professionalTitle,
      expertiseCategory,
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
      
      // Membership Controls
      membershipType: assignedMembershipType,
      membershipStatus: 'ACTIVE',
      paymentStatus,
      isFeatured,
      displayPriority,
      profileVisibility: 'PUBLIC',
      
      verified: true // Automatically verified for this demo
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({ message: 'Registration successful', token, user: userResponse });
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

module.exports = router;
