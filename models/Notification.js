// models/Notification.js — Mongoose Schema for In-App Notifications
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['news', 'event', 'blog', 'News', 'Event', 'Blog', 'general'],
    required: true,
    lowercase: true,
    index: true
  },
  targetUrl: {
    type: String,
    default: '#'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
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

notificationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Notification', notificationSchema);
