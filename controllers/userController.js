const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// 🔐 Token Generator
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, userRole: user.userRole },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};


// ✅ Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};


// ✅ Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};


// ✅ Update User by Admin
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, userRole, userImage } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(userRole && { userRole }),
        ...(userImage && { userImage }),
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

// ✅ Delete User
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

// ✅ Update Own Profile
// ✅ Update Own Profile (with FCM Token)
exports.updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phoneNumber, fcmToken } = req.body; // ⬅️ fcmToken लिया

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(fcmToken && { fcmToken }), // ⬅️ फील्ड में जोड़ा
    };

    if (req.file) {
      updateData.userImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};


// user leaderboard   

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find(
      { userRole: 'user' }, // ✅ Only include users with userRole 'user'
      'name userImage points referralCode'
    )
      .sort({ points: -1 }) // sort by points descending
      .lean();

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      userImage: user.userImage,
      points: user.points,
      referralCode: user.referralCode
    }));

    res.status(200).json({
      success: true,
      message: 'Leaderboard fetched successfully',
      data: leaderboard
    });
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
