const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://worldtrainerforum:S9lUeP3SOfW9xPqg@cluster0.0gndovd.mongodb.net/wt-prod';

mongoose.connect(MONGO_URI, { dbName: 'worldtrainersforum' }).then(async () => {
  const User = require('./models/User');
  const TrainerProfile = require('./models/TrainerProfile');

  const users = await User.find({ role: 'trainer' }).lean();
  console.log(`\nFound ${users.length} users with role 'trainer':`);
  users.forEach(u => {
    console.log(`- ${u.firstName} ${u.lastName} (${u.email})`);
    console.log(`  Title: ${u.professionalTitle}`);
    console.log(`  Bio: ${u.bio ? u.bio.substring(0, 50) + '...' : ''}`);
    console.log(`  Achievements: ${u.achievements ? 'YES' : 'NO'}`);
  });

  const profiles = await TrainerProfile.find({ role: 'trainer' }).lean();
  console.log(`\nFound ${profiles.length} trainer profiles:`);
  profiles.forEach(p => {
    console.log(`- ${p.firstName} ${p.lastName} (${p.email})`);
    console.log(`  Title: ${p.professionalTitle}`);
    console.log(`  Bio: ${p.bio ? p.bio.substring(0, 50) + '...' : ''}`);
    console.log(`  Achievements: ${p.achievements ? p.achievements.length : 0} items`);
    console.log(`  Portfolio: ${p.portfolio ? p.portfolio.length : 0} items`);
  });

  process.exit(0);
}).catch(console.error);
