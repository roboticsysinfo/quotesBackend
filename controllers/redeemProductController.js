const RedeemProduct = require('../models/RedeemProduct');
const RedeemHistory = require('../models/RedeemHistory');
const User = require('../models/userModel');
const imagekit = require('../utils/imagekit');
const PointTransactionsHistory = require('../models/PointTransactionsHistory');


// ✅ Add Product
exports.createProduct = async (req, res) => {

  try {

    const { name, description, price_value, requiredPoints } = req.body;

    let productImageUrl = '';

    // Upload image to ImageKit if provided
    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `product-${Date.now()}`,
      });
      productImageUrl = uploadResponse.url;
    }

    const product = await RedeemProduct.create({
      name,
      description,
      price_value,
      requiredPoints,
      productImage: productImageUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Get All Products (with pagination and sort by requiredPoints DESC)
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;     // default to page 1
    const limit = parseInt(req.query.limit) || 10;  // default to 10 per page
    const skip = (page - 1) * limit;

    // Total count for pagination
    const totalProducts = await RedeemProduct.countDocuments();

    const products = await RedeemProduct.find()
      .sort({ requiredPoints: -1 }) // ✅ Highest requiredPoints first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ✅ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price_value, requiredPoints } = req.body;

    const product = await RedeemProduct.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `product-${Date.now()}`,
      });
      product.productImage = uploadResponse.url;
    }

    product.name = name;
    product.description = description;
    product.price_value = price_value;
    product.requiredPoints = requiredPoints;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await RedeemProduct.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.redeemProduct = async (req, res) => {
  try {

    const userId = req.user._id;
    const { productId } = req.body;

    console.log("userid", userId);
    console.log("productId", productId);
    
    const user = await User.findById(userId);
    const product = await RedeemProduct.findById(productId);

    if (!user || !product) {
      return res.status(404).json({ message: 'User or Product not found' });
    }

    if (user.points < product.requiredPoints) {
      return res.status(400).json({ message: 'Not enough points to redeem this product' });
    }

    // Deduct points
    user.points -= product.requiredPoints;
    await user.save();

    // Generate unique bill number
    const billNo = `BILL${Date.now()}`;

    // Save redeem history
    const history = new RedeemHistory({
      user: user._id,
      product: product._id,
      billNo,
      snapshot: {
        userName: user.name,
        userEmail: user.email,
        productName: product.name,
        productImage: product.productImage,
        pointsUsed: product.requiredPoints,
        priceValue: product.price_value,
      },
    });
    await history.save();

    // ✅ Save point transaction history
    const transaction = new PointTransactionsHistory({
      user: user._id,
      deductedPoints: product.requiredPoints,
      type: 'redeem',
      description: `You Redeemed "${product.name}" worth ₹${product.price_value}`,
    });
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Product redeemed successfully',
      data: {
        billNo: history.billNo,
        redeemedAt: history.redeemedAt,
        snapshot: history.snapshot,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to redeem product' });
  }
};




exports.getUserRedeemHistory = async (req, res) => {
  try {

    const userId = req.params.id; // ✅ Get user ID from route param

    const history = await RedeemHistory.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Redeem history fetched',
      data: history,
    });
  } catch (err) {
    console.error('Get History Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};



// All Redeem Product History
exports.getAllRedeemHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = {
      $or: [
        { 'snapshot.productName': { $regex: search, $options: 'i' } },
        { billNo: { $regex: search, $options: 'i' } },
        { 'snapshot.userName': { $regex: search, $options: 'i' } },
        { 'snapshot.userEmail': { $regex: search, $options: 'i' } },
      ],
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await RedeemHistory.countDocuments(query);

    const history = await RedeemHistory.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'All redeem history fetched successfully',
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching all redeem history:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// 🔹 GET Redeem Product by Bill No
exports.getRedeemHistoryByBillNo = async (req, res) => {
  try {
    const { billNo } = req.params;

    const history = await RedeemHistory.findOne({ billNo });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'No redeem history found with this bill number',
      });
    }

    const price = history.snapshot.priceValue || 0;
    const gst = parseFloat((price * 0.18).toFixed(2)); // 18% GST
    const totalPrice = parseFloat((price + gst).toFixed(2));

    res.status(200).json({
      success: true,
      message: 'Redeem product fetched successfully',
      data: {
        ...history.toObject(),
        gstAmount: gst,
        totalPrice,
      },
    });
  } catch (err) {
    console.error('Error fetching redeem product by billNo:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};


