const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  updateOwnProfile,
  uploadUserImage,
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

router.put('/admin/update-my-admin/:id', adminOnly, updateUserByAdmin);
router.delete('/delete/user/:id', adminOnly, deleteUser);

router.put('/update/user/profile', upload.single('userImage'), protect, updateOwnProfile);


module.exports = router;
