// models/Requirement.js — Organization Requirement Mongoose Model
const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  reqId: {
    type: String,
    required: true,
    unique: true
  },
  orgName: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    type: Number,
    required: true
  },
  locationType: {
    type: String,
    enum: ['In City', 'Out City', 'Remote'],
    default: 'In City'
  },
  cityDetails: {
    type: String,
    required: true,
    trim: true
  },
  targetDate: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  submittedDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.models.Requirement || mongoose.model('Requirement', RequirementSchema);
