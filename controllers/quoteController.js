const Quotes = require('../models/quotesModel');
const imagekit = require('../utils/imagekit');
const User = require('../models/userModel'); // Import user model
const PointTransactionHistory = require('../models/PointTransactionsHistory');
const sendNotification = require('../utils/fcm'); // Import notification util


const uploadQuoteMedia = async (req, res) => {
  try {
    const { uploadedBy = 'admin', langId, categoryId, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    if (!['image', 'video'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid media type' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = `quote-${Date.now()}-${req.file.originalname}`;

    const uploaded = await imagekit.upload({
      file: fileBuffer,
      fileName,
      folder: '/quotes',
    });

    const newMedia = await Quotes.create({
      type,
      url: uploaded.url,
      uploadedBy,
      langId,
      categoryId
    });

    // ✅ 🔔 Notification logic added here
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });

    const title = `New ${type === 'image' ? 'Image' : 'Video'} Quote`;
    const body = `A new ${type === 'image' ? 'image' : 'video'} quote has been added for you.`;


    for (let user of users) {
      try {
        const imageUrl = type === 'image' ? uploaded.url : null; // ✅ only if it's image
        await sendNotification(user.fcmToken, title, body, imageUrl);
      } catch (err) {
        console.error(`Failed to notify user ${user._id}`, err.message);
      }
    }


    res.status(201).json({
      success: true,
      message: `${type} uploaded successfully`,
      data: newMedia
    });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};


// ❌ Delete Quote
const deleteQuote = async (req, res) => {
  try {
    const deleted = await Quotes.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    res.status(200).json({ success: true, message: 'Quote deleted successfully', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
  }
};

// ✏️ Update/Edit Quote
const updateQuote = async (req, res) => {
  try {
    const { langId, categoryId } = req.body;

    const updated = await Quotes.findByIdAndUpdate(
      req.params.id,
      { langId, categoryId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    res.status(200).json({ success: true, message: 'Quote updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed', error: err.message });
  }
};

// 📄 Get All Quotes
const getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quotes.find()
      .populate('langId', 'languageName')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: quotes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch quotes', error: err.message });
  }
};

// 📄 Get Quote by ID
const getQuoteById = async (req, res) => {
  try {
    const quote = await Quotes.findById(req.params.id)
      .populate('langId', 'languageName')
      .populate('categoryId', 'name');

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    res.status(200).json({ success: true, data: quote });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch quote', error: err.message });
  }
};

// 📄 Get Quotes by Category ID
const getQuotesByCategory = async (req, res) => {
  try {
    const quotes = await Quotes.find({ categoryId: req.params.categoryId })
      .populate('langId', 'languageName')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: quotes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch', error: err.message });
  }
};

// 📄 Get Quotes by Language ID
const getQuotesByLanguage = async (req, res) => {
  try {
    const quotes = await Quotes.find({ langId: req.params.langId })
      .populate('langId', 'languageName')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: quotes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch', error: err.message });
  }
};


// POST -- Quote Upload by User and Create by User
const uploadQuoteMediaByUser = async (req, res) => {
  try {
    const { langId, categoryId, type } = req.body;
    const uploadedBy = req.user?._id || 'admin'; // ✅ support user uploads
    const user = await User.findById(uploadedBy);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    if (!['image', 'video'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid media type' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = `quote-${Date.now()}-${req.file.originalname}`;

    const uploaded = await imagekit.upload({
      file: fileBuffer,
      fileName,
      folder: '/quotes',
    });

    // ✅ Save the quote
    const newMedia = await Quotes.create({
      type,
      url: uploaded.url,
      uploadedBy,
      langId,
      categoryId
    });

    // ✅ Give 10 points to user
    user.points += 10;
    await user.save();

    // ✅ Add to point transaction history
    await PointTransactionHistory.create({
      user: user._id,
      deductedPoints: 10,
      type: 'quote', // ✅ Add this to enum in your schema
      description: `You earned 10 points for uploading a ${type} quote.`,
    });

    // ✅ Send push notification to all users (optional)
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });

    const title = `New ${type === 'image' ? 'Image' : 'Video'} Quote`;
    const body = `A new ${type} quote has been added for you.`;

    for (let u of users) {
      try {
        const imageUrl = type === 'image' ? uploaded.url : null;
        await sendNotification(u.fcmToken, title, body, imageUrl);
      } catch (err) {
        console.error(`Failed to notify user ${u._id}`, err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: `${type} quote uploaded and points rewarded`,
      data: newMedia
    });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};


module.exports = {
  uploadQuoteMedia,
  deleteQuote,
  updateQuote,
  getAllQuotes,
  getQuoteById,
  getQuotesByCategory,
  getQuotesByLanguage,
  uploadQuoteMediaByUser
};
