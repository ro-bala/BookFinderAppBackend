const express = require('express');
const { getDb } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { ObjectId } = require('mongodb'); // Import ObjectId here

const router = express.Router();

// Save Book to Collection (POST)
router.post('/collections/save', verifyToken, async (req, res) => {
  const { book } = req.body;
  const userId = req.user.id;  // Assuming JWT token gives us user ID

  try {
    const users = await getDb().collection('Users');
    const user = await users.findOne({ _id: new ObjectId(userId) });  // Use `new ObjectId()`

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Add book to the user's collection
    await users.updateOne(
      { _id: new ObjectId(userId) },  // Again, use `new ObjectId()`
      { $push: { collection: book } }
    );

    res.status(200).json({ message: 'Book saved to your collection!' });
  } catch (error) {
    console.error('Error saving book:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get Books from User's Collection (GET)
router.get('/collections', verifyToken, async (req, res) => {
  const userId = req.user.id;  // Get user ID from the token

  try {
    const users = await getDb().collection('Users');
    const user = await users.findOne({ _id: new ObjectId(userId) });  // Use `new ObjectId()`

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ books: user.collection || [] });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
