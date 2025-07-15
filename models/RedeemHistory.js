const mongoose = require('mongoose');

const redeemHistorySchema = new mongoose.Schema({
    
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RedeemProduct',
    required: true,
  },
  redeemedAt: {
    type: Date,
    default: Date.now,
  },
  billNo: {
    type: String,
    unique: true,
    required: true,
  },
  snapshot: {
    userName: String,
    userEmail: String,
    userPhone: String,
    userAddress: String,
    productName: String,
    productImage: String,
    pointsUsed: Number,
    priceValue: Number,
  }
}, { timestamps: true });


module.exports = mongoose.model('RedeemHistory', redeemHistorySchema);
