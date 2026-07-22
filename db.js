// db.js — MongoDB connection using Mongoose
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.warn('⚠️ MONGO_URI is not defined in environment. Running with local JSON file fallback persistence.');
    return null;
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      dbName: 'worldtrainersforum',
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ MongoDB Connection Error: ${err.message}. Falling back to local JSON persistence.`);
    return null;
  }
};

module.exports = connectDB;
