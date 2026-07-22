// routes/notifications.js — API Endpoints for In-App Notifications
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Notification = require('../models/Notification');

const NOTIFS_FILE = path.join(__dirname, '..', 'notifications.json');

// Helper: Read JSON fallback file
function readJsonFallback(filePath, defaultData = []) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`[Notifications API] Error reading ${filePath}:`, e.message);
  }
  return defaultData;
}

// Helper: Write JSON fallback file
function writeJsonFallback(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`[Notifications API] Error writing ${filePath}:`, e.message);
  }
}

// ── GET /api/notifications ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const notifs = await Notification.find().sort({ createdAt: -1 }).limit(50).lean();
    const formatted = notifs.map(n => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: (n.type || 'general').toLowerCase(),
      targetUrl: n.targetUrl || '#',
      isRead: !!n.isRead,
      createdAt: n.createdAt
    }));

    return res.json(formatted);
  } catch (err) {
    console.warn('[Notifications API] DB fetch failed, falling back to local JSON:', err.message);
    const notifs = readJsonFallback(NOTIFS_FILE);
    notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(notifs);
  }
});

// ── PATCH /api/notifications/read-all ───────────────────────────────────────
// Must be defined BEFORE /:id/read so Express router does not catch 'read-all' as :id
router.patch('/read-all', async (req, res) => {
  try {
    try {
      await Notification.updateMany({}, { isRead: true });
    } catch (e) { }

    const localNotifs = readJsonFallback(NOTIFS_FILE);
    localNotifs.forEach(n => n.isRead = true);
    writeJsonFallback(NOTIFS_FILE, localNotifs);

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark all as read: ' + err.message });
  }
});

// ── PATCH /api/notifications/:id/read ───────────────────────────────────────
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  let updatedNotif = null;

  try {
    try {
      const n = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
      if (n) {
        updatedNotif = {
          id: n._id.toString(),
          title: n.title,
          message: n.message,
          type: n.type,
          targetUrl: n.targetUrl,
          isRead: true,
          createdAt: n.createdAt
        };
      }
    } catch (e) { }

    const localNotifs = readJsonFallback(NOTIFS_FILE);
    const itemIndex = localNotifs.findIndex(n => n.id === id || n._id === id);
    if (itemIndex !== -1) {
      localNotifs[itemIndex].isRead = true;
      writeJsonFallback(NOTIFS_FILE, localNotifs);
      if (!updatedNotif) updatedNotif = localNotifs[itemIndex];
    }

    return res.json({ success: true, notification: updatedNotif });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark notification as read: ' + err.message });
  }
});

// ── POST /api/notifications ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, message, type, targetUrl } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const timestamp = new Date();
    let savedNotif = null;

    try {
      const n = new Notification({
        title,
        message,
        type: (type || 'general').toLowerCase(),
        targetUrl: targetUrl || '#',
        isRead: false,
        createdAt: timestamp
      });
      await n.save();
      savedNotif = {
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        targetUrl: n.targetUrl,
        isRead: false,
        createdAt: n.createdAt
      };
    } catch (dbErr) { }

    if (!savedNotif) {
      savedNotif = {
        id: 'notif_' + Date.now(),
        title,
        message,
        type: (type || 'general').toLowerCase(),
        targetUrl: targetUrl || '#',
        isRead: false,
        createdAt: timestamp.toISOString()
      };
    }

    const localNotifs = readJsonFallback(NOTIFS_FILE);
    localNotifs.unshift(savedNotif);
    writeJsonFallback(NOTIFS_FILE, localNotifs);

    return res.status(201).json({ success: true, notification: savedNotif });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create notification: ' + err.message });
  }
});

module.exports = router;
