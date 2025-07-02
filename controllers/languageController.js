const Language = require('../models/languageModel');


// GET all languages
const getLanguages = async (req, res) => {
  try {
    const languages = await Language.find().sort({ languageName: 1 });
    res.status(200).json({
      success: true,
      message: 'Languages fetched successfully',
      data: languages
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch languages',
      error: err.message
    });
  }
};

// GET language by ID
const getLanguageById = async (req, res) => {
  try {
    
    const language = await Language.findById(req.params.id);

    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Language fetched successfully',
      data: language
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch language',
      error: err.message
    });
  }
};


// POST create new language
const createLanguage = async (req, res) => {
  try {
    const { landId, languageName } = req.body;
    const newLanguage = new Language({ landId, languageName });
    await newLanguage.save();
    res.status(201).json({
      success: true,
      message: 'Language created successfully',
      data: newLanguage
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to create language',
      error: err.message
    });
  }
};

// PUT update language
const updateLanguage = async (req, res) => {
  try {
    const updated = await Language.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Language updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to update language',
      error: err.message
    });
  }
};

// DELETE language
const deleteLanguage = async (req, res) => {
  try {
    const deleted = await Language.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Language deleted successfully',
      data: deleted
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete language',
      error: err.message
    });
  }
};

module.exports = {
  getLanguages,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage
};
