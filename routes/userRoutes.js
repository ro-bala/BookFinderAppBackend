const express = require("express");
const router = express.Router();
const { getDb } = require("../config/db"); // Access to MongoDB
const jwt = require("jsonwebtoken");
const { verifyToken } = require('../middleware/authMiddleware'); // JWT middleware
const { ObjectId } = require("mongodb");

// GET /api/user/profile - Fetch user profile
router.get("/profile", verifyToken, async (req, res) => {
    const userId = req.user.id; // Extract user ID from token
  
    try {
      const db = await getDb();
      const usersCollection = db.collection("Users");
  
      // Convert userId to ObjectId and find the user
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Return the user profile without the password field
      res.status(200).json({
        fullName: user.fullName,
        email: user.email,
        bio: user.bio || "No bio available.",
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  

// PUT /api/user/profile - Update user bio
router.put('/profile', verifyToken, async (req, res) => {
    const { bio } = req.body;
    const userId = req.user.id;  // Extract user ID from JWT
  
    // Validate the input
    if (!bio) {
      return res.status(400).json({ message: 'Bio is required.' });
    }
  
    try {
      const db = await getDb();  // Ensure you get the database connection
      const usersCollection = db.collection('Users');  // Access the Users collection
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Update the bio field for the user
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { bio } }  // Set the new bio value
      );
  
      // Send success response
      res.status(200).json({ message: 'Bio updated successfully!' });
    } catch (error) {
      console.error('Error updating bio:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });
  
module.exports = router;
