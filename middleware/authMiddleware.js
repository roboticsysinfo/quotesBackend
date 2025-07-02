const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// 🔐 Token verify and user inject
const protect = async (req, res, next) => {
  let token;

  // Check header: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded._id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
};


// 🔒 Role check middleware (Admin only)
const adminOnly = (req, res, next) => {

  if (req.user && req.user.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
};

module.exports = { protect, adminOnly };
