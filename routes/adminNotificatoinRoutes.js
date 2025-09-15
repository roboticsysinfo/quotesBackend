const express = require("express");
const {
  createAdminNotification,
  getAdminNotifications,
  markNotificationAsRead,
  updateAdminNotification,
  deleteAdminNotification,
} = require("../controllers/adminNotificationController");

const router = express.Router();


// Create new admin notification (also sends push)
router.post("/create-admin-msg", createAdminNotification);


// Get all admin notifications (latest 20, unread count)
router.get("/get-admin-msg", getAdminNotifications);


// Mark a notification as read
router.put("/mark-as-read/:id", markNotificationAsRead);


// Update notification
router.put("/update/admin-msg/:id", updateAdminNotification);


// Delete notification
router.delete("/delete/admin-msg/:id", deleteAdminNotification);


module.exports = router;
