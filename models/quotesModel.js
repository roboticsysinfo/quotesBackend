// models/quotesModel.js
const mongoose = require('mongoose');

const quotesSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: { type: String, required: true }, // ImageKit URL
  uploadedBy: { type: String, default: 'admin' },
  langId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuoteCategory',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quotes', quotesSchema);
