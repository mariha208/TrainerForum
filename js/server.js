require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { uploadFileToCloudinary } = require('../services/driveUpload');
const Trainer = require('./trainer-model'); // Imports your existing model

const app = express();
app.use(express.json({ limit: '50mb' })); // Allows server to read JSON

// CORS Configuration
const allowedOrigins = [
  'https://worldtrainerforum.com',
  'https://www.worldtrainerforum.com',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Mongoose User Auth Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'trainer' }
});
const User = mongoose.model('User', userSchema);

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

// Multer: store uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// ── AUTHENTICATION ROUTES ───────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'New Trainer';

    // Create the User Authentication Record
    const newUser = new User({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      role: role || 'trainer'
    });
    await newUser.save();

    // Automatically create the empty 'Trainer' profile immediately
    const newTrainer = new Trainer({
      trainerId: newUser._id.toString(), // Bind Trainer to User Auth ID
      fullName: newUser.fullName,
      email: newUser.email,
      category: 'Uncategorized',
      bio: 'New trainer profile.',
      certificationsBy: [],
      testimonialVideos: []
    });
    await newTrainer.save();

    // Generate JWT Auth Token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Registration successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // Validate password using bcrypt
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // Generate JWT Auth Token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── TRAINER ROUTES ──────────────────────────────────────────────────────────

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

// ── IMAGE UPLOAD ────────────────────────────────────────────────────────────

// POST /api/upload-image
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

// ── START SERVER ────────────────────────────────────────────────────────────

// Paste your verified working connection string below
const uri = "mongodb+srv://themarscreative_db_user:r4iaDIrZGiYL23hS@cluster0.0gndovd.mongodb.net/?appName=Cluster0";

mongoose.connect(uri).then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error("MongoDB connection failed:", err);
});