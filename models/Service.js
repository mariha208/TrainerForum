const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  title: { type: String },
  desc: { type: String },
  description: { type: String },
  duration: { type: String },
  price: { type: Number, default: 0 },
  mode: { type: String, default: 'Online' },
  type: { type: String, default: '1-on-1' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
