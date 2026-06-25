const mongoose = require('mongoose');
const Trainer = require('./trainer-model'); // Imports your blueprint

// Use the same connection string you used before
const uri = "mongodb+srv://khanjumrati043_db_user:Trainers12345@cluster0.li8tbvz.mongodb.net/?appName=Cluster0";

async function readData() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB!");

        // Fetch all trainers in the database
        const allTrainers = await Trainer.find({});

        console.log("Here are the trainers in your database:");
        console.log(allTrainers);

        process.exit();
    } catch (error) {
        console.error("Error reading data:", error);
        process.exit(1);
    }
}

readData();