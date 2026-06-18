// models/User.js — User schema for World Trainer Forum
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────
    firstName:     { type: String, required: true, trim: true },
    lastName:      { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:  { type: String },           // store bcrypt hash, never plain text
    role:          { type: String, enum: ['client', 'trainer', 'admin'], default: 'client' },

    // ── Profile images ────────────────────────────────────────
    profilePic:    { type: String, default: '' },   // URL (cloud storage / upload)
    coverBanner:   { type: String, default: '' },   // URL
    profilePictureUrl: { type: String, default: '' }, // URL explicitly requested
    coverBannerUrl: { type: String, default: '' },    // URL explicitly requested

    // ── Trainer-specific fields ───────────────────────────────
    professionalTitle: { type: String, default: '' },
    bio:               { type: String, default: '' },
    expertiseCategory: { type: String, default: '' },
    skills:            [{ type: String }],
    hourlyRate:        { type: Number, default: 0 },
    city:              { type: String, default: '' },
    country:           { type: String, default: '' },
    languages:         [{ type: String }],
    mode:              { type: String, default: 'Online' }, // Online | In-Person | Hybrid
    phoneNumber:       { type: String, default: '' },
    linkedinProfile:   { type: String, default: '' },
    rating:            { type: Number, default: 5.0, min: 0, max: 5 },
    reviews:           { type: Number, default: 0 },
    sessions:          { type: String, default: '0' },
    featured:          { type: Boolean, default: false },
    verified:          { type: Boolean, default: false },

    // ── Firebase UID link (if using Firebase Auth) ────────────
    firebaseUid:   { type: String, default: '' },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model('User', userSchema);
