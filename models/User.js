// models/User.js — Unified User/Trainer schema for World Trainer Forum
const mongoose = require('mongoose');

/* ── Achievements (badges/milestones) ───────────────────────────────────── */
const AchievementSchema = new mongoose.Schema({
  id:     { type: String, required: true },
  title:  { type: String, required: true, trim: true },
  sub:    { type: String, default: '', trim: true },
  ico:    { type: String, default: '🏅' },
  verify: { type: Boolean, default: false }
}, { _id: false });

/* ── Certifications By (Certification name, given by, year) ─────────────── */
const CertificationSchema = new mongoose.Schema({
  name:    { type: String, default: '', trim: true },
  givenBy: { type: String, default: '', trim: true },
  year:    { type: String, default: '', trim: true }
}, { _id: false });

/* ── Past Events / Speaking ──────────────────────────────────────────────── */
const EventSchema = new mongoose.Schema({
  id:      { type: String, required: true },
  company: { type: String, required: true, trim: true },
  event:   { type: String, required: true, trim: true },
  date:    { type: String, required: true, trim: true },
  logo:    { type: String, default: '🏢' }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────
    firstName:     { type: String, required: true, trim: true },
    lastName:      { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:  { type: String },
    role:          { type: String, enum: ['client', 'trainer', 'admin'], default: 'client' },

    // ── Membership Field Control (Main Logic) ──────────────────
    membershipType:    { type: String, enum: ['FREE', 'STANDARD', 'PREMIUM'], default: 'FREE' },
    membershipStatus:  { type: String, enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED'], default: 'ACTIVE' },
    paymentStatus:     { type: String, enum: ['PAID', 'PENDING', 'FREE'], default: 'FREE' },
    isFeatured:        { type: Boolean, default: false },
    displayPriority:   { type: Number, default: 100 },
    profileVisibility: { type: String, enum: ['PUBLIC', 'PRIVATE', 'HIDDEN'], default: 'PUBLIC' },

    // ── Profile Images ─────────────────────────────────────────
    profilePictureUrl: { type: String, default: '' },
    coverBannerUrl:    { type: String, default: '' },

    // ── Trainer-specific Fields ────────────────────────────────
    professionalTitle: { type: String, default: '' },
    bio:               { type: String, default: '' },
    expertiseCategory: { type: String, default: '' },
    skills:            [{ type: String }],
    hourlyRate:        { type: Number, default: 0 },
    yearsOfExperience: { type: Number, default: 0 },
    city:              { type: String, default: '' },
    country:           { type: String, default: '' },
    languages:         [{ type: String }],
    mode:              { type: String, default: 'Online' },
    phoneNumber:       { type: String, default: '' },
    linkedinProfile:   { type: String, default: '' },
    website:           { type: String, default: '' },
    socialLinks:       { type: mongoose.Schema.Types.Mixed, default: {} },

    // ── Metrics ────────────────────────────────────────────────
    rating:            { type: Number, default: 5.0, min: 0, max: 5 },
    reviews:           { type: Number, default: 0 },
    sessions:          { type: String, default: '0' },

    // ── Extended Profile Fields ────────────────────────────────
    specialization:    { type: String, default: '' },
    availability:      { type: mongoose.Schema.Types.Mixed, default: {} },
    services:          { type: mongoose.Schema.Types.Mixed, default: [] },
    packages:          { type: mongoose.Schema.Types.Mixed, default: [] },
    testimonials:      { type: mongoose.Schema.Types.Mixed, default: [] },
    achievements:      { type: mongoose.Schema.Types.Mixed, default: [] },
    events:            { type: [EventSchema], default: [] },
    videoIntro:        { type: String, default: '' },
    introVideo:        { type: String, default: '' }, // alias saved by dashboard
    certificationsBy:  { type: [CertificationSchema], default: [] }, // {name, givenBy, year}
    portfolio:         { type: mongoose.Schema.Types.Mixed, default: [] },
    portfolioLinks:    { type: String, default: '' },
    tags:              { type: mongoose.Schema.Types.Mixed, default: [] },

    // ── Firebase UID link (if using Firebase Auth) ────────────
    firebaseUid:   { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

/**
 * Public Trainer Card projection 
 */
userSchema.methods.toPublicCard = function () {
  return {
    id: this._id,
    membershipType: this.membershipType,
    isFeatured: this.isFeatured,
    name: `${this.firstName} ${this.lastName}`.trim(),
    role: this.professionalTitle,
    cat: this.expertiseCategory,
    bio: this.bio,
    pn: this.hourlyRate,
    price: this.hourlyRate ? this.hourlyRate.toLocaleString('en-IN') : 'On request',
    exp: this.yearsOfExperience ? `${this.yearsOfExperience}yr` : '1yr',
    city: [this.city, this.country].filter(Boolean).join(', ') || 'Online',
    mode: this.mode,
    lang: this.languages.join(', ') || 'English',
    tags: this.skills.slice(0, 3),
    etags: this.skills,
    photoUrl: this.profilePictureUrl || null,
    bannerUrl: this.coverBannerUrl || null,
    achievements: this.achievements,
    events: this.events,
    socialLinks: this.socialLinks,
    whatsapp: this.phoneNumber,
    linkedin: this.linkedinProfile,
    videoIntro: this.videoIntro || null,
    services: this.services,
    packages: this.packages,
    availability: this.availability,
    portfolio: this.portfolio,
  };
};

module.exports = mongoose.model('User', userSchema);
