const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({

    quote: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        default: "Unknown",
        trim: true
    },
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
    image: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quote', quoteSchema);

