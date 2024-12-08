const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI; // MongoDB URI
const DB_NAME = "BookFinderAppBackend"; // Default database name

let client;
let dbConnection;

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    if (!client) {
      const options = {
        useNewUrlParser: true,  // Ensure the new URL parser is used
        useUnifiedTopology: true,  // Ensure the unified topology engine is used
        ssl: true,  // Ensure SSL is enabled
        
        tlsAllowInvalidCertificates: false,  // Disable invalid certificate allowance
      };

      client = new MongoClient(MONGO_URI, options);  // Pass options to MongoClient
      await client.connect();
      dbConnection = client.db(DB_NAME);
      console.log("Connected to MongoDB");
    }
    return dbConnection;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

// Function to get the database connection
const getDb = () => {
  if (!dbConnection) {
    throw new Error("Database connection is not established yet. Call connectDB first.");
  }
  return dbConnection;
};

// Close the connection when needed
const closeDB = async () => {
  if (client) {
    await client.close();
    client = null;
    dbConnection = null;
    console.log("MongoDB connection closed.");
  }
};

module.exports = { connectDB, getDb, closeDB };
