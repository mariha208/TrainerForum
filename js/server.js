require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { uploadFileToCloudinary } = require('../services/driveUpload');

const app = express();

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
      return callback(new Error('CORS restriction'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// ── 1. TRAINER SCHEMA DEFINED DIRECTLY IN FILE ──
const trainerSchema = new mongoose.Schema({
  trainerId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  tagline: { type: String, default: '' },
  category: { type: String, default: 'General' },
  bio: { type: String, default: '' },
  rate: { type: String, default: '0' },
  membershipType: { type: String, default: 'FREE' },
  profileImageUrl: { type: String, default: '' }
}, { timestamps: true });

const Trainer = mongoose.models.Trainer || mongoose.model('Trainer', trainerSchema);

// ── 2. USER SCHEMA DEFINED DIRECTLY IN FILE ──
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'trainer' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_session_token_key';

// ── AUTHENTICATION ENDPOINTS ──

// POST: Register User + Auto-Create MongoDB Trainer Profile
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    // Directly inserts a blank tracking card for this trainer into your MongoDB Cluster
    const newProfile = new Trainer({
      trainerId: newUser._id.toString(),
      fullName: newUser.fullName,
      category: 'General',
      rate: '0',
      membershipType: 'FREE'
    });
    await newProfile.save();

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── TRAINER ENGINE ENDPOINTS ──

// GET: Fetch all active profiles
app.get('/api/trainers', async (req, res) => {
  try {
    const trainers = await Trainer.find({});
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trainers" });
  }
});

// GET: Fetch a specific trainer by ID
app.get('/api/trainers/:id', async (req, res) => {
    try {
        const filter = req.params.id.length === 24 ? { _id: req.params.id } : { trainerId: req.params.id };
        const trainer = await Trainer.findOne(filter);
        if (!trainer) return res.status(404).json({ error: "Trainer not found" });
        res.json(trainer);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trainer" });
    }
});

// PATCH: Update a trainer profile
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

// ── IMAGE UPLOAD ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const imageType = req.body.type || 'profile';
    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `trainer-${imageType}-${timestamp}.${ext}`;
    const publicUrl = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype, fileName, imageType);
    res.json({ url: publicUrl, type: imageType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database Activation & Server Startup
const uri = "mongodb+srv://themarscreative_db_user:r4iaDIrZGiYL23hS@cluster0.0gndovd.mongodb.net/?appName=Cluster0";
mongoose.connect(uri)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running safely on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB initialization failed:", err));