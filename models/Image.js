// models/Image.js — Schema for storing uploaded image URLs
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    // Who uploaded it
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The public URL (e.g. from Cloudinary, Firebase Storage, S3, etc.)
    url:       { type: String, required: true },

    // Optional thumbnail/small version URL
    thumbUrl:  { type: String, default: '' },

    // What kind of image is this?
    category:  {
      type: String,
      enum: ['profile', 'banner', 'portfolio', 'testimonial', 'company_logo', 'other'],
      default: 'other',
    },

    // Human-readable label
    label:     { type: String, default: '' },

    // File metadata (populated if you know it at upload time)
    fileName:  { type: String, default: '' },
    fileSize:  { type: Number, default: 0 },   // bytes
    mimeType:  { type: String, default: '' },  // e.g. "image/jpeg"

    // Soft-delete flag
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('Image', imageSchema);
