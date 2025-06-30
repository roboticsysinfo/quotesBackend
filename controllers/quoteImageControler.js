const QuoteImage = require('../models/quoteImageModel');
const path = require('path');


// 📤 Upload Quote Image
const uploadQuoteImage = async (req, res) => {
  try {
    const { uploadedBy = 'admin', langId, categoryId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    if (!langId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Language ID and Category ID are required'
      });
    }

    const image = `/uploads/quotes/${req.file.filename}`;

    const newImage = await QuoteImage.create({
      image,
      uploadedBy,
      langId,
      categoryId
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: newImage
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: err.message
    });
  }
};

// 📄 Get All Quote Images
const getQuoteImages = async (req, res) => {
  try {
    const images = await QuoteImage.find()
      .populate('langId', 'languageName')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Quote images fetched successfully',
      data: images
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
      error: err.message
    });
  }
};

// ❌ Delete Quote Image
const deleteQuoteImage = async (req, res) => {
  try {
    const deleted = await QuoteImage.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: deleted
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: err.message
    });
  }
};


// 📄 Get Quote Images by Category ID
const getQuoteImagesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const images = await QuoteImage.find({ categoryId })
      .populate('langId', 'languageName')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Quote images by category fetched successfully',
      data: images
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote images by category',
      error: err.message
    });
  }
};



module.exports = {
  uploadQuoteImage,
  getQuoteImages,
  deleteQuoteImage,
  getQuoteImagesByCategory
};
