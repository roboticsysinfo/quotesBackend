const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/quoteCategoryController');
const { adminOnly } = require('../middleware/authMiddleware');

// GET all
router.get('/quote-categories', getAllCategories);

// GET one
router.get('/category/:id', getCategoryById);

// CREATE
router.post('/create-category', adminOnly, createCategory);

// UPDATE
router.put('/update/category/:id', adminOnly, updateCategory);

// DELETE
router.delete('/delete/category/:id', adminOnly, deleteCategory);

module.exports = router;
