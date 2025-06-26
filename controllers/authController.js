const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');


// 🟢 SIGNUP with phoneNumber check per userRole
const signupUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, userRole } = req.body;

    // Check if email already registered
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        data: null
      });
    }

    // ✅ Check for phone number duplication based on userRole
    if (phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber, userRole: userRole || 'user' });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: `Phone number already registered for ${userRole || 'user'}`,
          data: null
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      userRole: userRole || 'user'
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userRole: user.userRole
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: err.message
    });
  }
};




// 🔐 LOGIN WITH EMAIL
const loginByEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userRole: user.userRole
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
};

// 📲 SEND MOCK OTP (Just simulate)
const sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  const user = await User.findOne({ phoneNumber });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Phone number not registered'
    });
  }

  // 👇 Always send same OTP
  const otp = '1234';

  // In production, send via SMS here
  res.status(200).json({
    success: true,
    message: `OTP sent to ${phoneNumber}`,
    otp // just for testing; in real remove this
  });
};

// ✅ VERIFY OTP
const verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (otp !== '1234') {
    return res.status(401).json({
      success: false,
      message: 'Invalid OTP'
    });
  }

  const user = await User.findOne({ phoneNumber });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful via OTP',
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userRole: user.userRole
    }
  });
};

module.exports = {
  signupUser,
  loginByEmail,
  sendOTP,
  verifyOTP
};
