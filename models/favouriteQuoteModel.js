const mongoose = require('mongoose');

const favouriteQuoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FavouriteQuote', favouriteQuoteSchema);
