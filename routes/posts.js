// routes/posts.js — API Endpoints for Posts (News, Events, Blogs)
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const POSTS_FILE = path.join(__dirname, '..', 'posts.json');
const NOTIFS_FILE = path.join(__dirname, '..', 'notifications.json');

// Helper: Read JSON fallback file
function readJsonFallback(filePath, defaultData = []) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`[Posts API] Error reading ${filePath}:`, e.message);
  }
  return defaultData;
}

// Helper: Write JSON fallback file
function writeJsonFallback(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`[Posts API] Error writing ${filePath}:`, e.message);
  }
}

// ── GET /api/posts ─────────────────────────────────────────────────────────────
// Query params: category (optional: 'news', 'event', 'blog' or legacy names)
router.get('/', async (req, res) => {
  const { category } = req.query;
  
  try {
    const filter = {};
    if (category) {
      const cat = String(category).toLowerCase();
      if (cat === 'news' || cat.includes('news')) {
        filter.category = { $regex: /news|announcement/i };
      } else if (cat === 'event' || cat.includes('event')) {
        filter.category = { $regex: /event/i };
      } else if (cat === 'blog' || cat.includes('blog')) {
        filter.category = { $regex: /blog/i };
      } else {
        filter.category = new RegExp(category, 'i');
      }
    }

    const posts = await Post.find(filter).sort({ createdAt: -1 }).lean();
    
    // Normalize id field for API consumers
    const formatted = posts.map(p => ({
      id: p._id.toString(),
      category: p.category,
      title: p.title,
      description: p.description,
      content: p.content,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt
    }));

    return res.json(formatted);
  } catch (err) {
    console.warn('[Posts API] DB fetch failed, falling back to local JSON:', err.message);
    let posts = readJsonFallback(POSTS_FILE);
    if (category) {
      const cat = String(category).toLowerCase();
      posts = posts.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        if (cat === 'news' || cat.includes('news')) return pCat.includes('news') || pCat.includes('announcement');
        if (cat === 'event' || cat.includes('event')) return pCat.includes('event');
        if (cat === 'blog' || cat.includes('blog')) return pCat.includes('blog');
        return pCat === cat;
      });
    }
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(posts);
  }
});

// ── GET /api/posts/:id ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      return res.json({
        id: post._id.toString(),
        category: post.category,
        title: post.title,
        description: post.description,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt
      });
    }
  } catch (err) { }

  const posts = readJsonFallback(POSTS_FILE);
  const found = posts.find(p => p.id === req.params.id || p._id === req.params.id);
  if (found) return res.json(found);

  return res.status(404).json({ error: 'Post not found' });
});

// ── POST /api/posts ────────────────────────────────────────────────────────────
// Admin Post Publishing Handler
router.post('/', async (req, res) => {
  try {
    const { category, title, description, content, imageUrl } = req.body;

    if (!category || !title || !description || !content) {
      return res.status(400).json({ error: 'Category, title, description, and content are required fields.' });
    }

    const validCategories = ['News', 'Event', 'Blog'];
    const normalizedCategory = validCategories.find(c => c.toLowerCase() === category.toLowerCase()) || 'News';

    const timestamp = new Date();
    let savedPost = null;
    let savedNotif = null;

    // Target URL based on category
    const catLower = normalizedCategory.toLowerCase();
    const targetUrl = (catLower === 'blog') ? 'blog.html' : 'news-events.html';

    // 1. Try DB insertion
    try {
      const newPost = new Post({
        category: normalizedCategory,
        title,
        description,
        content,
        imageUrl: imageUrl || '',
        createdAt: timestamp
      });
      await newPost.save();

      savedPost = {
        id: newPost._id.toString(),
        category: newPost.category,
        title: newPost.title,
        description: newPost.description,
        content: newPost.content,
        imageUrl: newPost.imageUrl,
        createdAt: newPost.createdAt
      };

      // Create Notification Record
      const newNotif = new Notification({
        title: `New ${normalizedCategory}: ${title}`,
        message: description.length > 100 ? description.substring(0, 97) + '...' : description,
        type: catLower,
        targetUrl: targetUrl,
        isRead: false,
        createdAt: timestamp
      });
      await newNotif.save();

      savedNotif = {
        id: newNotif._id.toString(),
        title: newNotif.title,
        message: newNotif.message,
        type: newNotif.type,
        targetUrl: newNotif.targetUrl,
        isRead: newNotif.isRead,
        createdAt: newNotif.createdAt
      };

    } catch (dbErr) {
      console.warn('[Posts API] DB save failed, writing to fallback JSON:', dbErr.message);
    }

    // 2. Sync to JSON fallback files as well for dual resilience
    const postId = savedPost ? savedPost.id : 'post_' + Date.now();
    const notifId = savedNotif ? savedNotif.id : 'notif_' + Date.now();

    if (!savedPost) {
      savedPost = {
        id: postId,
        category: normalizedCategory,
        title,
        description,
        content,
        imageUrl: imageUrl || '',
        createdAt: timestamp.toISOString()
      };
    }

    if (!savedNotif) {
      savedNotif = {
        id: notifId,
        title: `New ${normalizedCategory}: ${title}`,
        message: description.length > 100 ? description.substring(0, 97) + '...' : description,
        type: catLower,
        targetUrl: targetUrl,
        isRead: false,
        createdAt: timestamp.toISOString()
      };
    }

    const localPosts = readJsonFallback(POSTS_FILE);
    localPosts.unshift(savedPost);
    writeJsonFallback(POSTS_FILE, localPosts);

    const localNotifs = readJsonFallback(NOTIFS_FILE);
    localNotifs.unshift(savedNotif);
    writeJsonFallback(NOTIFS_FILE, localNotifs);

    return res.status(201).json({
      success: true,
      message: `${normalizedCategory} post published and notification sent successfully!`,
      post: savedPost,
      notification: savedNotif
    });

  } catch (err) {
    console.error('[Posts API] Server error:', err);
    return res.status(500).json({ error: 'Failed to publish post: ' + err.message });
  }
});

// ── DELETE /api/posts/:id ──────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    try {
      await Post.findByIdAndDelete(id);
    } catch (e) { }

    const posts = readJsonFallback(POSTS_FILE);
    const updated = posts.filter(p => p.id !== id && p._id !== id);
    writeJsonFallback(POSTS_FILE, updated);

    return res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete post: ' + err.message });
  }
});

module.exports = router;
