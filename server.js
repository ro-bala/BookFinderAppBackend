// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

dotenv.config(); // Ensure this loads the .env file

const app = express();
app.use(cors());
app.use(express.json());

// Start the server after database connection is established
const startServer = async () => {
  try {
    await connectDB(); // Wait for database to connect first
    console.log("Database connected successfully!");

    // Routes
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/books", require("./routes/bookRoutes"));

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1); // Exit process with failure
  }
};

// Call the function to start the server
startServer();
