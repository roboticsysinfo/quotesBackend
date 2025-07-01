const express = require('express');
const router = express.Router();

const {
  getLanguages,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage
} = require('../controllers/languageController');
const { adminOnly, protect } = require('../middleware/authMiddleware');

router.get('/languages', getLanguages);

router.get('/language/:id', getLanguageById);

router.post('/create-language', protect, adminOnly, createLanguage);

router.put('/update/language/:id', protect, adminOnly, updateLanguage);

router.delete('/delete/language/:id', protect, adminOnly, deleteLanguage);

module.exports = router;
