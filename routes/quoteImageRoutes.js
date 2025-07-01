const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  uploadQuoteImage,
  getQuoteImages,
  deleteQuoteImage,
  getQuoteImagesByCategory
} = require('../controllers/quoteImageControler');
const { adminOnly } = require('../middleware/authMiddleware');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/quotes'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// POST /api/quote-images/upload
router.post('/upload/quote-image', upload.single('image'), adminOnly, uploadQuoteImage);

// GET /api/quote-images
router.get('/get-quote-images', getQuoteImages);

// DELETE /api/quote-images/:id
router.delete('/delete/quote-image/:id', adminOnly, deleteQuoteImage);

// ✅ New Route
router.get('/get-quotes-by-category/:categoryId', getQuoteImagesByCategory);

module.exports = router;
