const Status = require('../models/statusModel');
const fs = require('fs');
const path = require('path');


exports.uploadStatus = async (req, res) => {
  try {
    const userId = req.body.user;
    const imagePath = req.file?.filename;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!imagePath) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const status = await Status.create({
      image: imagePath,
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Status uploaded",
      data: status,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllStatuses = async (req, res) => {
  try {
    const statuses = await Status.find().sort({ createdAt: -1 }).populate('user', 'name');
    return res.json({ success: true, data: statuses });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteStatus = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ success: false, message: "Status not found" });

    // Optional: Check if the user is authorized to delete
    if (String(status.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Delete image file
    const filePath = path.join(__dirname, '..', 'uploads', 'status', status.image);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete image:", err);
    });

    await status.deleteOne();
    return res.json({ success: true, message: "Status deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
