// models/Review.js — Schema for Session Reviews
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    reviewerName: { type: String, default: 'Anonymous' },
    reviewerRole: { type: String, default: '' },
    trainerName: { type: String, default: '' },
    trainerEmail: { type: String, default: '' },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Review', reviewSchema);
