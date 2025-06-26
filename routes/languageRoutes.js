const express = require('express');
const router = express.Router();

const {
  getLanguages,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage
} = require('../controllers/languageController');

router.get('/languages', getLanguages);

router.get('/language/:id', getLanguageById);

router.post('/create-language', createLanguage);

router.put('/update/language/:id', updateLanguage);

router.delete('/delete/language/:id', deleteLanguage);

module.exports = router;
