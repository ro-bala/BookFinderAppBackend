const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { getDb } = require("../config/db");

dotenv.config();

const router = express.Router();
const usersCollection = "Users";

// Helper to access the collection
const getUsersCollection = async () => {
  const db = await getDb(); // Just use getDb() without passing dbName
  return db.collection(usersCollection);
};

// Sign-Up Route
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const users = await getUsersCollection();
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({ fullName, email, password: hashedPassword });
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error("Error in /signup:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const users = await getUsersCollection();
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    console.log(process.env.JWT_SECRET);  // Check if this prints the correct secret

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Error in /login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
