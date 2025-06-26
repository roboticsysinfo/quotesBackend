// models/languageModel.js

const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  landId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Land', // agar aap 'Land' naam ka koi aur model use kar rahe ho
    required: true
  },
  languageName: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Language', languageSchema);
