const mongoose = require("mongoose");

const pointTransactionsHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deductedPoints: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: [
            "referral",
            "redeem",
            'quote',
            "daily_login"
        ],
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("PointTransactionHistory", pointTransactionsHistorySchema);
