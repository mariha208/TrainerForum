require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { uploadFileToCloudinary } = require('../services/driveUpload');
const Trainer = require('./trainer-model'); // Imports your existing model

const app = express();
app.use(express.json({ limit: '50mb' })); // Allows server to read JSON
const allowedOrigins = [
  'https://worldtrainerforum.com',
  'https://www.worldtrainerforum.com',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Multer: store uploaded files in memory (not on disk) before sending to Drive
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Paste your verified working connection string below
const uri = "mongodb+srv://themarscreative_db_user:r4iaDIrZGiYL23hS@cluster0.0gndovd.mongodb.net/?appName=Cluster0";

// API Route: GET all trainers
app.get('/api/trainers', async (req, res) => {
    try {
        const trainers = await Trainer.find({});
        res.json(trainers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trainers" });
    }
});

// API Route: GET a specific trainer by ID
app.get('/api/trainers/:id', async (req, res) => {
    try {
        const filter = req.params.id.length === 24 ? { _id: req.params.id } : { trainerId: req.params.id };
        const trainer = await Trainer.findOne(filter);
        if (!trainer) {
            return res.status(404).json({ error: "Trainer not found" });
        }
        res.json(trainer);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trainer" });
    }
});

app.patch('/api/trainers/:id', async (req, res) => {
  try {
    const updated = await Trainer.findOneAndUpdate(
      { trainerId: req.params.id }, 
      { $set: req.body }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Trainer not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Image Upload Route ───────────────────────────────────────────────────────
// POST /api/upload-image
// Accepts: multipart/form-data with field "image" (the file) and "type" (profile|banner)
// Returns: { url: "https://res.cloudinary.com/..." }
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageType = req.body.type || 'profile'; // 'profile' or 'banner'
    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `trainer-${imageType}-${timestamp}.${ext}`;

    console.log(`[Upload] Received ${imageType} image: ${req.file.originalname} (${req.file.size} bytes)`);

    const publicUrl = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      fileName,
      imageType
    );

    res.json({ url: publicUrl, type: imageType });
  } catch (err) {
    console.error('[Upload] Cloudinary upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
mongoose.connect(uri).then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});