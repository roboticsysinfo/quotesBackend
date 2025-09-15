const AdminNotification = require("../models/AdminNotification");
const User = require("../models/userModel");
const sendNotification = require("../utils/fcm"); // your sendNotification function


// CREATE Notification (Admin) & send push
const createAdminNotification = async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;

    // 1️⃣ Save to DB
    const notification = new AdminNotification({ title, body, imageUrl });
    await notification.save();

    // 2️⃣ Get all user FCM tokens (excluding null/empty ones)
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } }).select("fcmToken");

    // 3️⃣ Send Push Notification to all users
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

// GET All Notifications (latest 20, new on top) & unread count
const getAdminNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // optional pagination
    const limit = 20;
    const skip = (page - 1) * limit;

    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await AdminNotification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// MARK Notification as Read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await AdminNotification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const unreadCount = await AdminNotification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: updated,
      unreadCount,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
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
  markNotificationAsRead,
  updateAdminNotification,
  deleteAdminNotification,
};
