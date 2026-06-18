// routes/images.js — REST API routes for Images
const express = require('express');
const router = express.Router();
const Image = require('../models/Image');

// GET all images
router.get('/', async (req, res) => {
  try {
    const images = await Image.find({ isDeleted: false }).populate('uploadedBy', 'firstName lastName email');
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET images by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const images = await Image.find({ uploadedBy: req.params.userId, isDeleted: false });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new image record
router.post('/', async (req, res) => {
  try {
    const image = new Image(req.body);
    await image.save();
    res.status(201).json(image);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE (soft delete) an image
router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!image) return res.status(404).json({ error: 'Image not found' });
    res.json({ message: 'Image deleted (soft).' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
