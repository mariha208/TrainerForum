const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  trainerId: { type: String, required: true, unique: true },
  fullName: String,
  tagline: String,
  category: String,
  specialization: String,
  experience: String,
  location: String,
  deliveryMode: String,
  rate: String,
  bio: String,
  whatsapp: String,
  linkedin: String,
  website: String,
  instagram: String,
  youtube: String,
  twitter: String,
  facebook: String,
  portfolioLink: String,
  profileImageUrl: String,
  bannerImageUrl: String,
  certificationsBy: { type: Array },
  testimonialVideos: { type: Array },
  services: { type: Array },
  packages: { type: Array },
  introVideo: String,
  availability: { type: Object },
  isPaid: { type: Boolean, default: false }
}, { strict: true });

module.exports = mongoose.model('Trainer', trainerSchema);
