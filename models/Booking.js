// models/Booking.js — Hired Trainers / Session Bookings Mongoose Model
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  orgId: {
    type: String,
    required: true
  },
  organizationId: {
    type: String
  },
  trainerId: {
    type: mongoose.Schema.Types.Mixed
  },
  trainerName: {
    type: String,
    required: true
  },
  trainerAvatar: {
    type: String,
    default: ''
  },
  topic: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: String,
    required: true
  },
  timeSlot: {
    type: String
  },
  duration: {
    type: String,
    default: '1 Hour'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Active', 'Completed'],
    default: 'Scheduled'
  }
}, { timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
