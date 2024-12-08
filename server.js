// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config(); // Ensure this loads the .env file

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URI);

client
  .connect()
  .then(() => {
    console.log("MongoDB connected");

    // Routes
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/books", require("./routes/bookRoutes"));

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure if connection fails
  });
