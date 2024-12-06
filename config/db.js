const { MongoClient } = require("mongodb"); // Import MongoClient from mongodb package
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI; // Get MongoDB URI from environment variable

let client;

const connectDB = async () => {
  try {
    client = await MongoClient.connect(MONGO_URI); // Remove deprecated options here
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if there's an error connecting to MongoDB
  }
};

module.exports = connectDB;
