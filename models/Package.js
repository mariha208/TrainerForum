const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  title: { type: String },
  desc: { type: String },
  description: { type: String },
  duration: { type: String },
  price: { type: Number, default: 0 },
  features: [{ type: String }],
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
