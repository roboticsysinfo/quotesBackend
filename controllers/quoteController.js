const Quote = require('../models/quoteModel');
const path = require('path');

// Create Quote
const createQuote = async (req, res) => {
  try {
    const { quote, author, langId, categoryId } = req.body;
    let imagePath = "";

    if (req.file) {
      imagePath = `/uploads/quotes/${req.file.filename}`;
    }

    const newQuote = await Quote.create({
      quote,
      author,
      langId,
      categoryId,
      image: imagePath
    });

    res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      data: newQuote
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to create quote',
      error: err.message
    });
  }
};

// Update Quote
const updateQuote = async (req, res) => {
  try {
    const { quote, author, langId, categoryId } = req.body;
    const updatedFields = {
      quote,
      author,
      langId,
      categoryId
    };

    if (req.file) {
      updatedFields.image = `/uploads/quotes/${req.file.filename}`;
    }

    const updatedQuote = await Quote.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true
    });

    if (!updatedQuote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quote updated successfully',
      data: updatedQuote
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to update quote',
      error: err.message
    });
  }
};

// Get all quotes
const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find()
      .populate('langId', 'languageName')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Quotes fetched successfully',
      data: quotes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes',
      error: err.message
    });
  }
};

// Get quote by ID
const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('langId', 'languageName')
      .populate('categoryId', 'name');

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quote fetched successfully',
      data: quote
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote',
      error: err.message
    });
  }
};

// Get quotes by langId
const getQuotesByLanguage = async (req, res) => {
  try {
    const quotes = await Quote.find({ langId: req.params.langId })
      .populate('langId', 'languageName')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Quotes by language fetched successfully',
      data: quotes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes by language',
      error: err.message
    });
  }
};

// Get quotes by categoryId
const getQuotesByCategory = async (req, res) => {
  try {
    const quotes = await Quote.find({ categoryId: req.params.categoryId })
      .populate('langId', 'languageName')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Quotes by category fetched successfully',
      data: quotes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes by category',
      error: err.message
    });
  }
};

// Delete Quote
const deleteQuote = async (req, res) => {
  try {
    const deleted = await Quote.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quote deleted successfully',
      data: deleted
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete quote',
      error: err.message
    });
  }
};

module.exports = {
  createQuote,
  updateQuote,
  getQuotes,
  getQuoteById,
  getQuotesByLanguage,
  getQuotesByCategory,
  deleteQuote
};
