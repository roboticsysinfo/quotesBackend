// routes/adminNotification.routes.js
const express = require("express");
const {
    createAdminNotification,
    getAdminNotifications,
    updateAdminNotification,
    deleteAdminNotification,
} = require("../controllers/adminNotificationController");

const router = express.Router();

// Create new admin notification (also sends push)
router.post("/create-admin-msg", createAdminNotification);


// Get all admin notifications
router.get("/get-admin-msg", getAdminNotifications);


// Update notification
router.put("/update/admin-msg/:id", updateAdminNotification);


// Delete notification
router.delete("/delete/admin-msg/:id", deleteAdminNotification);


module.exports = router;
