// config/db.js
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI; // Get MongoDB URI from environment variable

let client;

const connectDB = async () => {
  try {
    client = await MongoClient.connect(MONGO_URI); 
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if there's an error connecting to MongoDB
  }
};

// Export the client and a function to get the database
const getDb = () => {
  if (!client) {
    throw new Error("Database connection is not established yet");
  }
  return client.db("BookFinderAppBackend"); // Returns the default database
};

module.exports = { connectDB, getDb };
