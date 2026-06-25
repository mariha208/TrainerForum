const mongoose = require('mongoose');

// Paste your connection string inside the quotes below
const uri = "mongodb+srv://khanjumrati043_db_user:Trainers12345@cluster0.li8tbvz.mongodb.net/?appName=Cluster0";

async function testConnection() {
    try {
        await mongoose.connect(uri);
        console.log("SUCCESS! Your backend is successfully talking to MongoDB.");
        process.exit(); // This closes the connection when done
    } catch (error) {
        console.error("Connection failed. Check your password or network.", error);
        process.exit(1);
    }
}

testConnection();