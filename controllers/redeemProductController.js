const RedeemProduct = require('../models/RedeemProduct');
const imagekit = require('../utils/imagekit');


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


// ✅ Get All Products
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
