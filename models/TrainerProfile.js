'use strict';
const mongoose = require('mongoose');

/* ── Achievements & Certifications ────────────────────────────────────────
   ico: emoji default OR base64 data URI (frontend-local asset, 2B) */
const AchievementSchema = new mongoose.Schema({
  id:     { type: String, required: true },
  title:  { type: String, required: true, trim: true },   // Certificate Title/Name
  sub:    { type: String, default: '', trim: true },       // Issuing Body/Details
  ico:    { type: String, default: '🏅' },
  verify: { type: Boolean, default: false }
}, { _id: false });

/* ── Past Events / Speaking ────────────────────────────────────────────────
   logo: emoji default OR base64 data URI (frontend-local asset, 2B) */
const EventSchema = new mongoose.Schema({
  id:      { type: String, required: true },
  company: { type: String, required: true, trim: true },
  event:   { type: String, required: true, trim: true },
  date:    { type: String, required: true, trim: true },
  logo:    { type: String, default: '🏢' }
}, { _id: false });

const TrainerProfileSchema = new mongoose.Schema({
  // ── Auth / identity (shared with /api/auth) ──────────────────────────────
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, default: 'trainer', enum: ['trainer', 'organization', 'admin'] },
  verified: { type: Boolean, default: false },
  firstName: { type: String, default: '' },
  lastName:  { type: String, default: '' },

  // ── Dashboard <-> Public Card shared fields ──────────────────────────────
  professionalTitle: { type: String, default: '' },   // tagline
  expertiseCategory: { type: String, default: '' },
  bio:               { type: String, default: '' },
  city:              { type: String, default: '' },
  country:           { type: String, default: '' },
  mode:              { type: String, default: 'Online' },
  languages:         { type: [String], default: [] },
  skills:            { type: [String], default: [] },  // expertise tags
  hourlyRate:        { type: Number, default: 0 },
  yearsOfExperience: { type: Number, default: 0 },
  phoneNumber:       { type: String, default: '' },
  linkedinProfile:   { type: String, default: '' },
  website:           { type: String, default: '' },
  socialLinks:       { type: mongoose.Schema.Types.Mixed, default: {} },

  // ── 2A. Database-mapped core asset — remote CDN/S3 URL ───────────────────
  profilePictureUrl: { type: String, default: '' },

  // ── 2B. Pure frontend-local assets — base64 data URIs, no separate CDN ───
  coverBannerUrl: { type: String, default: '' },
  achievements:   { type: [AchievementSchema], default: [] },
  events:         { type: [EventSchema], default: [] },

  // ── Extended profile (existing platform fields, preserved as-is) ─────────
  videoIntro:   { type: String, default: '' },
  services:     { type: mongoose.Schema.Types.Mixed, default: [] },
  packages:     { type: mongoose.Schema.Types.Mixed, default: [] },
  availability: { type: mongoose.Schema.Types.Mixed, default: {} },
  portfolio:    { type: mongoose.Schema.Types.Mixed, default: [] },
}, { timestamps: true, collection: 'users' });

/**
 * Public Trainer Card projection — derived from the SAME document, never a
 * separate record. Used by /api/users (browse/home grids) and any server-
 * rendered card output, guaranteeing dashboard and public card never drift.
 */
TrainerProfileSchema.methods.toPublicCard = function () {
  return {
    id: this._id,
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

module.exports = mongoose.model('TrainerProfile', TrainerProfileSchema);
