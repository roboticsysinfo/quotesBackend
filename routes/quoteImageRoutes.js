const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  uploadQuoteImage,
  getQuoteImages,
  deleteQuoteImage
} = require('../controllers/quoteImageControler');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/quotes'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// POST /api/quote-images/upload
router.post('/upload/quote-image/', upload.single('image'), uploadQuoteImage);

// GET /api/quote-images
router.get('/get-quote-images', getQuoteImages);

// DELETE /api/quote-images/:id
router.delete('/delete/quote-image/:id', deleteQuoteImage);

module.exports = router;
