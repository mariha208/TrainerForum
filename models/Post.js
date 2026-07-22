// models/Post.js — Mongoose Schema for News, Events, and Blogs
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['News', 'Event', 'Blog'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

postSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Post', postSchema);
