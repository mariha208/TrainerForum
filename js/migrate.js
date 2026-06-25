const mongoose = require('mongoose');
const Trainer = require('./trainer-model'); // Ensure this file exists
const data = require('../data.json'); // Ensure this file exists

// Replace with your actual working connection string
const uri = "mongodb+srv://khanjumrati043_db_user:Trainers12345@cluster0.li8tbvz.mongodb.net/?appName=Cluster0";

// This function fixes the string fields to match your Schema's array format
const transformData = (trainer) => {
    return {
        ...trainer,
        // If services/packages are strings, we turn them into an array of objects
        services: typeof trainer.services === 'string' ? [{ title: trainer.services }] : trainer.services,
        packages: typeof trainer.packages === 'string' ? [{ title: trainer.packages }] : trainer.packages
    };
};

async function runMigration() {
    try {
        // Connect to your database
        await mongoose.connect(uri);
        console.log("Connected to MongoDB!");

        // Transform your data
        const transformedData = data.map(transformData);

        // Insert into the database
        await Trainer.insertMany(transformedData);

        console.log("Migration successful! Your data is now in MongoDB.");
        process.exit();
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigration();