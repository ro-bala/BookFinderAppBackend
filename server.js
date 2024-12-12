const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db"); // Import DB connection function

dotenv.config(); // Load environment variables

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// MongoDB connection
const startServer = async () => {
  try {
    await connectDB(); // Ensure DB is connected before starting the server
    console.log("MongoDB connected");

    // Set up your routes
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/books", require("./routes/bookRoutes"));
    app.use("/api/user", require("./routes/userRoutes")); // New user routes
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit the process if DB connection fails
  }
};

startServer(); // Start the server and DB connection
