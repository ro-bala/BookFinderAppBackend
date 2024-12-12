const express = require('express');
const { getDb } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { ObjectId } = require('mongodb');
const axios = require('axios');

const router = express.Router();

// Helper to fetch Open Library key if the book doesn't have one
const fetchOpenLibraryKey = async (bookTitle, author) => {
  try {
    const response = await axios.get(`https://openlibrary.org/search.json`, {
      params: { title: bookTitle, author: author },
    });

    if (response.data.docs.length > 0) {
      return response.data.docs[0].key;
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
  const userId = req.user.id;

  try {
    const users = await getDb().collection('Users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Ensure user.collection exists
    if (!user.collection) {
      user.collection = [];
    }

    // Check if the book already exists in the user's collection
    const existingBook = user.collection.find((b) => b.key === book.key);
    if (existingBook) {
      return res.status(400).json({ message: 'Book already exists in your collection.' });
    }

    // Fetch the Open Library key if not already provided
    if (!book.key) {
      const key = await fetchOpenLibraryKey(book.title, book.author);
      if (key) {
        book.key = key;
      } else {
        return res.status(404).json({ message: 'Book key not found. Cannot save book.' });
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

    // Handle empty collection case
    const userCollection = user.collection || [];
    if (userCollection.length === 0) {
      return res.status(200).json({ books: [], message: 'Your collection is empty.' });
    }

    // Fetch more details for each book using Open Library key
    const booksWithDetails = await Promise.all(
      userCollection.map(async (book) => {
        if (book.key) {
          const bookDetails = await fetchBookDetailsFromOpenLibrary(book.key);
          return { ...book, ...bookDetails };
        }
        return book;
      })
    );

    res.status(200).json({ books: booksWithDetails });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Helper to fetch book details from Open Library using the key
const fetchBookDetailsFromOpenLibrary = async (key) => {
  try {
    const response = await axios.get(`https://openlibrary.org${key}.json`);
    return {
      cover: response.data.covers
        ? `https://covers.openlibrary.org/b/id/${response.data.covers[0]}-L.jpg`
        : null,
      description: response.data.description || 'No description available.',
    };
  } catch (error) {
    console.error('Error fetching book details from Open Library:', error);
    return {};
  }
};

// Delete Book from Collection (DELETE)
router.delete('/collections/delete', verifyToken, async (req, res) => {
  const { key } = req.body;
  const userId = req.user.id;

  try {
    const users = await getDb().collection('Users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Ensure the collection exists
    if (!user.collection || user.collection.length === 0) {
      return res.status(404).json({ message: 'Your collection is empty.' });
    }

    // Check if the book exists in the user's collection
    const bookExists = user.collection.some((book) => book.key === key);

    if (!bookExists) {
      return res.status(404).json({ message: 'Book not found in your collection.' });
    }

    // Remove the book from the user's collection
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { collection: { key } } }
    );

    res.status(200).json({ message: 'Book removed from your collection.' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
