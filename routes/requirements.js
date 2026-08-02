// routes/requirements.js — API endpoints for Organization Requirements
const express = require('express');
const router = express.Router();
const Requirement = require('../models/Requirement');

// POST /api/requirements — Submit a new organization requirement
router.post('/', async (req, res) => {
  try {
    const { orgName, topic, budget, locationType, cityDetails, targetDate, duration, notes } = req.body;

    if (!orgName || !topic || !budget || !cityDetails || !targetDate || !duration) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    const newReq = new Requirement({
      reqId,
      orgName,
      topic,
      budget: Number(budget),
      locationType: locationType || 'In City',
      cityDetails,
      targetDate,
      duration,
      notes: notes || '',
      submittedDate: today,
      status: 'Pending'
    });

    await newReq.save();

    console.log(`✅ [Requirements] New requirement created: ${reqId} — ${topic}`);
    res.status(201).json({
      success: true,
      message: 'Requirement submitted successfully! It is currently under review.',
      requirement: newReq
    });
  } catch (err) {
    console.error('❌ [Requirements] POST Error:', err);
    res.status(500).json({ error: 'Failed to submit requirement.' });
  }
});

// GET /api/requirements/my-requirements — Fetch organization requirements
router.get('/my-requirements', async (req, res) => {
  try {
    const list = await Requirement.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: list.length,
      requirements: list
    });
  } catch (err) {
    console.error('❌ [Requirements] GET Error:', err);
    res.status(500).json({ error: 'Failed to fetch requirements.' });
  }
});

module.exports = router;
