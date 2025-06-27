// models/quoteImageModel.js
const mongoose = require('mongoose');

const quoteImageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    uploadedBy: { type: String }, // optional: "admin", "user", etc.
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

module.exports = mongoose.model('QuoteImage', quoteImageSchema);
