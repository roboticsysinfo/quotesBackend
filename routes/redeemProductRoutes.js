const express = require('express');
const router = express.Router();


const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  redeemProduct,
  getUserRedeemHistory,
  getAllRedeemHistory,
  getRedeemHistoryByBillNo,
} = require('../controllers/redeemProductController');
const { adminOnly, protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const RedeemProduct = require('../models/RedeemProduct');


// Create product (POST)
router.post('/add-product', upload.single('productImage'), protect, adminOnly, createProduct);


// Get all products (GET)
router.get('/products', getAllProducts);


// Update product (PUT)
router.put('/update/product/:id', upload.single('productImage'), protect, adminOnly, updateProduct);


// Delete product (DELETE)
router.delete('/delete/product/:id', protect, adminOnly, deleteProduct);


// POST - Redeem Product
router.post('/redeem-product', protect, redeemProduct);


// Get User Redeem Product History by
router.get('/user/redeem-product-history/:id', protect, getUserRedeemHistory);


// Get All Redeem Product History
router.get('/all/redeem-product-history', protect, getAllRedeemHistory);


// Get redeem product history for generate invoice by bill no
router.get('/product/invoice/:billNo', protect, adminOnly, getRedeemHistoryByBillNo);

module.exports = router;
