const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // multer with memory storage
const {
  uploadQuoteMedia,
  deleteQuote,
  updateQuote,
  getAllQuotes,
  getQuoteById,
  getQuotesByCategory,
  getQuotesByLanguage,
  uploadQuoteMediaByUser
} = require('../controllers/quoteController');
const { protect, adminOnly } = require("../middleware/authMiddleware");

// 🟢 Upload (Image/Video)
router.post('/upload-quote', upload.single('media'), uploadQuoteMedia);

// 🟡 Get
router.get('/image/video/quotes', getAllQuotes);

router.get('/single-quote/:id', getQuoteById);

router.get('/quotes/by-category/:categoryId', getQuotesByCategory);

router.get('/quotes/by-language/:langId', getQuotesByLanguage);

// 🔴 Delete
router.delete('/delete-quote/:id', protect, adminOnly, deleteQuote);

// 🟠 Update
router.put('/update-quote/:id', protect, adminOnly, updateQuote);


// POST - Create by User and Uploaded by User
router.post('/by/user/upload-quote', protect, upload.single('media'), uploadQuoteMediaByUser);


module.exports = router;
