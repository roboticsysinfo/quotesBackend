const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  updateOwnProfile,
  getLeaderboard,
  getUserPointHistory,
} = require('../controllers/userController');
const { admin, protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// ✅ Routes

router.get('/all-users', getAllUsers);


router.get('/user/by-userid/:id', protect, getUserById);


router.put('/admin/update-my-admin/:id', protect, adminOnly, updateUserByAdmin);


router.delete('/delete/user/:id', protect, adminOnly, deleteUser);


router.put('/update/user/profile', upload.single('userImage'), protect, updateOwnProfile);


// GET /api/users/leaderboard
router.get('/get/leaderboard', protect, getLeaderboard);

// GET /api/users/poinst transaction history
router.get('/user/points-transactions-history/:id', protect, getUserPointHistory);


module.exports = router;
