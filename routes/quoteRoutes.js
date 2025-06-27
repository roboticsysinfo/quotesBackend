// routes/quoteRoutes.js
const express = require('express');
const router = express.Router();

const {
  createQuote,
  updateQuote,
  getQuotes,
  getQuoteById,
  getQuotesByLanguage,
  getQuotesByCategory,
  deleteQuote
} = require('../controllers/quoteController');

// Create quote
router.post('/create-quote', createQuote);

// Update quote
router.put('/update/quote/:id', updateQuote);

// Get all quotes
router.get('/quotes', getQuotes);

// Get single quote
router.get('/single/quote/:id', getQuoteById);

// Get by language
router.get('/quote/by-language/:langId', getQuotesByLanguage);

// Get by category
router.get('/quote/by-quote-category/:categoryId', getQuotesByCategory);

// Delete quote
router.delete('/delete/quote/:id', deleteQuote);

module.exports = router;
