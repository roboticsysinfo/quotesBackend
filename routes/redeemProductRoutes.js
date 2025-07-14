const express = require('express');
const router = express.Router();


const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/redeemProductController');
const { adminOnly, protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


// Create product (POST)
router.post('/add-product', upload.single('productImage'), protect, adminOnly, createProduct);


// Get all products (GET)
router.get('/products', getAllProducts);


// Update product (PUT)
router.put('/update/product/:id', upload.single('productImage'), protect, adminOnly, updateProduct);


// Delete product (DELETE)
router.delete('/delete/product/:id', protect, adminOnly, deleteProduct);


module.exports = router;
