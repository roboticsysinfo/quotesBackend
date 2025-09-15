// models/AdminNotification.js
const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    imageUrl: { type: String, default: null },
    createdBy: { type: String, default: "Admin" }, // always admin
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminNotification", adminNotificationSchema);
