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
    let notifs = await Notification.find().sort({ createdAt: -1 }).limit(50).lean();
    
    // If no explicit notification records exist yet in DB, dynamically construct notifications from latest published posts
    if (!notifs || notifs.length === 0) {
      try {
        const Post = require('../models/Post');
        const posts = await Post.find().sort({ createdAt: -1 }).limit(15).lean();
        notifs = posts.map(p => ({
          _id: p._id,
          title: `New ${p.category || 'Announcement'}: ${p.title}`,
          message: p.description && p.description.length > 100 ? p.description.substring(0, 97) + '...' : (p.description || ''),
          type: (p.category || 'news').toLowerCase(),
          targetUrl: (p.category || '').toLowerCase() === 'blog' ? 'blog.html' : 'news-events.html',
          isRead: false,
          createdAt: p.createdAt
        }));
      } catch (postErr) { }
    }

    const formatted = notifs.map(n => ({
      id: (n._id || n.id).toString(),
      title: n.title,
      message: n.message,
      type: (n.type || 'news').toLowerCase(),
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

// ── PATCH /api/notifications/mark-read & /read-all ───────────────────────────
router.patch(['/mark-read', '/read-all'], async (req, res) => {
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
