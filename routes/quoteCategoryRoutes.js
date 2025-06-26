const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/quoteCategoryController');

// GET all
router.get('/quote-categories', getAllCategories);

// GET one
router.get('/category/:id', getCategoryById);

// CREATE
router.post('/create-category', createCategory);

// UPDATE
router.put('/update/category/:id', updateCategory);

// DELETE
router.delete('/delete/category/:id', deleteCategory);

module.exports = router;
