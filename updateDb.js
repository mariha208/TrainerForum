const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const connectDB = require('./db');

connectDB().then(async () => {
  try {
    const result = await User.updateMany(
      { role: 'trainer' },
      { 
        $set: { 
          membershipType: 'PREMIUM', 
          isFeatured: true, 
          displayPriority: 1, 
          paymentStatus: 'PAID', 
          membershipStatus: 'ACTIVE' 
        } 
      }
    );
    console.log('Updated trainers to PREMIUM!', result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
