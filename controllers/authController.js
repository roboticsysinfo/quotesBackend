const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const PointTransactionHistory = require('../models/PointTransactionsHistory');
const axios = require("axios");
const OTPModel = require('../models/OTPModel');


// 🟢 SIGNUP with referral system + reward points
const signupUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, userRole, referredBy } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check phone number for duplication by role
    if (phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber, userRole: userRole || 'user' });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: `Phone number already registered for ${userRole || 'user'}`
        });
      }
    }

    let inviter = null;

    // 🎯 If referredBy is given, find inviter by referralCode
    if (referredBy) {
      inviter = await User.findOne({ referralCode: referredBy });
    }

    // Create the user (set referredBy as ObjectId if inviter found)
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      userRole: userRole || 'user',
      referredBy: inviter ? inviter._id : null,
      points: 0
    });

    // 🎁 Reward points if inviter exists
    if (inviter) {
      // 🔹 Increase referral downloads count
      inviter.referralDownloads = (inviter.referralDownloads || 0) + 1;

      // Inviter gets 10 points
      inviter.points += 10;
      await inviter.save();

      // Referred user gets 10 points
      user.points += 10;
      await user.save();

      // ✅ Transaction log for inviter
      await PointTransactionHistory.create({
        user: inviter._id,
        deductedPoints: 10,
        type: 'referral',
        description: `Earned 10 points by inviting ${user.name}`
      });

      // ✅ Transaction log for referred user
      await PointTransactionHistory.create({
        user: user._id,
        deductedPoints: 10,
        type: 'referral',
        description: `Earned 10 points for signing up using referral code of ${inviter.name}`
      });
    }

    const token = generateToken(user);

    // 🔄 Populate referredBy for response
    const populatedUser = await User.findById(user._id)
      .populate('referredBy', 'name email referralCode');

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      data: populatedUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Signup failed', error: err.message });
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


// Test/Review phone numbers (App Access play store)
const reviewNumbers = ["1122334455", "9876543210"]; // <-- change to your reviewer numbers

// 📲 SEND OTP
const sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "Phone number not registered" });
    }

    let otp;
    if (reviewNumbers.includes(phoneNumber)) {
      // ✅ Review Mode - fixed OTP
      otp = "1234";
    } else {
      // ✅ Real OTP
      otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Send OTP via Fast2SMS
      await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "dlt",
          sender_id: "QUOTEV",
          message: "198140", // <-- replace with your approved DLT template ID
          variables_values: otp,
          numbers: phoneNumber,
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Save OTP with 1 min expiry
    const expiresAt = new Date(Date.now() + 60 * 1000);
    await OTPModel.create({ phone: phoneNumber, otp, expiresAt });

    res.status(200).json({
      success: true,
      message: reviewNumbers.includes(phoneNumber)
        ? "Review mode: OTP fixed to 1234"
        : "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ VERIFY OTP
const verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: "Phone number and OTP are required" });
    }

    // Find latest OTP
    const latestOtp = await OTPModel.findOne({ phone: phoneNumber }).sort({ createdAt: -1 });

    if (
      !latestOtp ||
      latestOtp.otp !== otp ||
      new Date(latestOtp.expiresAt) < new Date()
    ) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP valid → delete
    await OTPModel.deleteMany({ phone: phoneNumber });

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Daily login reward
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pointsAdded = false;

    const alreadyGiven = await PointTransactionHistory.findOne({
      user: user._id,
      type: "daily_login",
      createdAt: { $gte: today },
    });

    if (!alreadyGiven) {
      const points = 1;
      user.points = (user.points || 0) + points;
      await user.save();

      await PointTransactionHistory.create({
        user: user._id,
        deductedPoints: points, // earned points
        type: "daily_login",
        description: "Earned 1 Point for Daily Login",
      });

      pointsAdded = true;
    }

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userRole: user.userRole,
        points: user.points,
        pointsAddedToday: pointsAdded,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};







// // 📲 SEND MOCK OTP (Just simulate)
// const sendOTP = async (req, res) => {
//   const { phoneNumber } = req.body;

//   const user = await User.findOne({ phoneNumber });
//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: 'Phone number not registered'
//     });
//   }

//   // 👇 Always send same OTP
//   const otp = '1234';

//   // In production, send via SMS here
//   res.status(200).json({
//     success: true,
//     message: `OTP sent to ${phoneNumber}`,
//     otp // just for testing; in real remove this
//   });
// };


// // ✅ VERIFY OTP
// const verifyOTP = async (req, res) => {
//   const { phoneNumber, otp } = req.body;

//   try {
//     if (otp !== '1234') {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid OTP'
//       });
//     }

//     const user = await User.findOne({ phoneNumber });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // ✅ Check if already rewarded today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     let pointsAdded = false;

//     if (!user.lastRewardDate || user.lastRewardDate < today) {
//       // Add 1 point
//       user.points = (user.points || 0) + 1;
//       user.lastRewardDate = new Date();
//       pointsAdded = true;

//       // Save point transaction history
//       await PointTransactionHistory.create({
//         user: user._id,
//         deductedPoints: 1, // earned points
//         type: 'daily_login',
//         description: 'Earned 1 Point for Daily Login'
//       });
//     }

//     await user.save();

//     // Generate token
//     const token = generateToken(user);

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       data: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         phoneNumber: user.phoneNumber,
//         userRole: user.userRole,
//         points: user.points,
//         pointsAddedToday: pointsAdded
//       }
//     });

//   } catch (error) {
//     console.error('Error verifying OTP:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };




module.exports = {
  signupUser,
  loginByEmail,
  sendOTP,
  verifyOTP
};
