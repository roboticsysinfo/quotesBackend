const QuoteCategory = require('../models/quoteCategoryModel');

// GET all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await QuoteCategory.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: 'Quote categories fetched successfully',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// GET featured categories
const getFeaturedCategories = async (req, res) => {
  try {
    const featured = await QuoteCategory.find({ isFeatured: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: 'Featured categories fetched successfully',
      data: featured
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured categories',
      error: error.message
    });
  }
};

// GET category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await QuoteCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Category fetched successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// CREATE new category
const createCategory = async (req, res) => {
  try {
    const { name, isFeatured = false } = req.body;

    const exists = await QuoteCategory.findOne({ name });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const newCategory = await QuoteCategory.create({ name, isFeatured });
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// UPDATE category
const updateCategory = async (req, res) => {
  try {
    const { name, isFeatured } = req.body;

    const updated = await QuoteCategory.findByIdAndUpdate(
      req.params.id,
      { name, isFeatured },
      { new: true }
    );

    console.log("updated", updated);
    

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// DELETE category
const deleteCategory = async (req, res) => {
  try {
    const deleted = await QuoteCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: deleted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getFeaturedCategories, // new
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
