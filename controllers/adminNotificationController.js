// controllers/adminNotification.controller.js
const AdminNotification = require("../models/AdminNotification");
const User = require("../models/userModel");
const sendNotification = require("../utils/fcm"); // your sendNotification function

// CREATE Notification (Admin)
const createAdminNotification = async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;

    // 1. Save to DB
    const notification = new AdminNotification({ title, body, imageUrl });
    await notification.save();

    // 2. Get all user FCM tokens (excluding null/empty ones)
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } }).select("fcmToken");

    // 3. Send Push Notification to all users
    const sendPromises = users.map(user =>
      sendNotification(user.fcmToken, title, body, imageUrl)
    );
    await Promise.allSettled(sendPromises);

    res.status(201).json({
      success: true,
      message: "Admin notification created & sent to all users successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error creating admin notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET All Notifications
const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// EDIT Notification
const updateAdminNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, imageUrl } = req.body;

    const updated = await AdminNotification.findByIdAndUpdate(
      id,
      { title, body, imageUrl },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE Notification
const deleteAdminNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AdminNotification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createAdminNotification,
  getAdminNotifications,
  updateAdminNotification,
  deleteAdminNotification,
};
