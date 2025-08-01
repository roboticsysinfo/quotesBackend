const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const PointTransactionHistory = require('../models/PointTransactionsHistory');


// 🟢 SIGNUP with referral system + reward points

const signupUser = async (req, res) => {
  try {

    const { name, email, password, phoneNumber, userRole, referredBy } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        data: null
      });
    }

    // Check phone number for duplication by role
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

    // Create the user (start with 0 points, will update later if referredBy)
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      userRole: userRole || 'user',
      referredBy: referredBy || null,
      points: 0
    });

    // 🎁 Reward points if referral code is provided and valid
    if (referredBy) {
      const inviter = await User.findOne({ referralCode: referredBy });

      if (inviter) {
        // Inviter gets 5 points
        inviter.points += 5;
        await inviter.save();

        // Referred user gets 10 points
        user.points += 10;
        await user.save();

        // ✅ Transaction log for inviter
        await PointTransactionHistory.create({
          user: inviter._id,
          deductedPoints: 5,
          type: 'referral',
          description: `Earned 5 points by inviting ${user.name}`
        });

        // ✅ Transaction log for referred user
        await PointTransactionHistory.create({
          user: user._id,
          deductedPoints: 10,
          type: 'referral',
          description: `Earned 10 points for signing up using referral code of ${inviter.name}`
        });

      }
    }

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
        userRole: user.userRole,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        points: user.points
      }
    });

  } catch (err) {
    console.error(err);
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
// const verifyOTP = async (req, res) => {
//   const { phoneNumber, otp } = req.body;

//   if (otp !== '1234') {
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid OTP'
//     });
//   }

//   const user = await User.findOne({ phoneNumber });
//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: 'User not found'
//     });
//   }

//   const token = generateToken(user);

//   res.status(200).json({
//     success: true,
//     message: 'Login successful via OTP',
//     token,
//     data: {
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       phoneNumber: user.phoneNumber,
//       userRole: user.userRole
//     }
//   });
// };


// ✅ VERIFY OTP
const verifyOTP = async (req, res) => {

  const { phoneNumber, otp } = req.body;

  try {

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

    // ✅ Add 1 point to user
    user.points = (user.points || 0) + 1;
    await user.save();

    // ✅ Save point transaction history
    await PointTransactionHistory.create({
      user: user._id,
      deductedPoints: 1, // ✅ Here it means "earned points"
      type: 'daily_login',
      description: '1 point added for daily login.'
    });

    // ✅ Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successfull',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userRole: user.userRole,
        points: user.points
      }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



module.exports = {
  signupUser,
  loginByEmail,
  sendOTP,
  verifyOTP
};
