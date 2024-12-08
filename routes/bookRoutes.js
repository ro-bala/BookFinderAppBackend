const express = require('express');
const { getDb } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { ObjectId } = require('mongodb');
const axios = require('axios'); // Import axios to fetch data from Open Library

const router = express.Router();

// Helper to fetch Open Library key if the book doesn't have one
const fetchOpenLibraryKey = async (bookTitle, author) => {
  try {
    const response = await axios.get(`https://openlibrary.org/search.json`, {
      params: {
        title: bookTitle,
        author: author,
      },
    });

    if (response.data.docs.length > 0) {
      return response.data.docs[0].key; // Return the key of the first matched book
    }

    return null;
  } catch (error) {
    console.error('Error fetching book from Open Library:', error);
    return null;
  }
};

// Save Book to User's Collection (POST)
router.post('/collections/save', verifyToken, async (req, res) => {
  const { book } = req.body;
  const userId = req.user.id;  // Assuming JWT token gives us user ID

  try {
    const users = await getDb().collection('Users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Fetch the Open Library key if not already provided
    if (!book.key) {
      const key = await fetchOpenLibraryKey(book.title, book.author);
      if (key) {
        book.key = key; // Assign the Open Library key if available
      }
    }

    // Add book to the user's collection
    await users.updateOne(
      { _id: new ObjectId(userId) },
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
  const userId = req.user.id;

  try {
    const users = await getDb().collection('Users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ books: user.collection || [] });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Delete Book from User's Collection (DELETE)
router.delete('/collections/delete', verifyToken, async (req, res) => {
  const { bookId } = req.body; // Book ID to delete
  const userId = req.user.id;

  try {
    const users = await getDb().collection('Users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Remove the book from the user's collection
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { collection: { _id: bookId } } } // Pull the book with the matching ID
    );

    res.status(200).json({ message: 'Book deleted from your collection.' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
