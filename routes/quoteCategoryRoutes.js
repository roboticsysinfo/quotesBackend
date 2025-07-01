const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/quoteCategoryController');
const { adminOnly, protect } = require('../middleware/authMiddleware');

// GET all
router.get('/quote-categories', getAllCategories);

// GET one
router.get('/category/:id', getCategoryById);

// CREATE
router.post('/create-category', protect, adminOnly, createCategory);

// UPDATE
router.put('/update/category/:id', protect, adminOnly, updateCategory);

// DELETE
router.delete('/delete/category/:id', protect, adminOnly, deleteCategory);

module.exports = router;
