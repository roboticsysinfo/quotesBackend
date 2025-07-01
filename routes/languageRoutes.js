const express = require('express');
const router = express.Router();

const {
  getLanguages,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage
} = require('../controllers/languageController');
const { adminOnly } = require('../middleware/authMiddleware');

router.get('/languages', getLanguages);

router.get('/language/:id', getLanguageById);

router.post('/create-language', adminOnly, createLanguage);

router.put('/update/language/:id', adminOnly, updateLanguage);

router.delete('/delete/language/:id', adminOnly, deleteLanguage);

module.exports = router;
