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
    const { orgId, organizationId, trainerId, trainerName, trainerAvatar, topic, scheduledDate, timeSlot, duration } = req.body;
    const bookingId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;

    const finalOrgId = orgId || organizationId || 'ORG-101';
    const finalDateStr = timeSlot ? `${scheduledDate} · ${timeSlot}` : scheduledDate;

    const newBooking = new Booking({
      bookingId,
      orgId: finalOrgId,
      organizationId: finalOrgId,
      trainerId: trainerId || '',
      trainerName: trainerName || 'Expert Trainer',
      trainerAvatar: trainerAvatar || '',
      topic: topic || '1-on-1 Training Session',
      scheduledDate: finalDateStr,
      timeSlot: timeSlot || '',
      duration: duration || '1 Hour',
      status: 'Scheduled'
    });

    await newBooking.save();

    // ── TRAINER NOTIFICATION: Create targeted notification for booked trainer exclusively ──
    if (trainerId) {
      try {
        const Notification = require('../models/Notification');
        const notification = new Notification({
          title: 'New Session Booking 📅',
          message: `You have been booked for "${topic || 'Training Session'}" on ${scheduledDate}${timeSlot ? ' at ' + timeSlot : ''}.`,
          type: 'general',
          recipientId: String(trainerId),
          targetUrl: 'dashboard.html',
          isRead: false
        });
        await notification.save();
      } catch (notifErr) {
        console.error('❌ [Bookings] Trainer notification error:', notifErr.message);
      }
    }

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    console.error('❌ [Bookings] POST Error:', err);
    res.status(500).json({ error: 'Failed to create booking: ' + err.message });
  }
});

module.exports = router;
