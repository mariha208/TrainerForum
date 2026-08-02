// routes/bookings.js — API endpoints for Hired Trainers / Bookings
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// GET /api/bookings/my-hired-trainers — Fetch hired trainers for organization
router.get('/my-hired-trainers', async (req, res) => {
  try {
    const list = await Booking.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: list.length,
      hiredTrainers: list
    });
  } catch (err) {
    console.error('❌ [Bookings] GET Error:', err);
    res.status(500).json({ error: 'Failed to fetch hired trainers.' });
  }
});

// POST /api/bookings — Hire a trainer
router.post('/', async (req, res) => {
  try {
    const { orgId, trainerName, trainerAvatar, topic, scheduledDate, duration } = req.body;
    const bookingId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = new Booking({
      bookingId,
      orgId: orgId || 'ORG-101',
      trainerName,
      trainerAvatar: trainerAvatar || '',
      topic,
      scheduledDate,
      duration: duration || '1 Day',
      status: 'Scheduled'
    });

    await newBooking.save();
    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    console.error('❌ [Bookings] POST Error:', err);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

module.exports = router;
