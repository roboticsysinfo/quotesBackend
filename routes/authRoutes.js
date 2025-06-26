const express = require('express');
const router = express.Router();
const {
  signupUser,
  loginByEmail,
  sendOTP,
  verifyOTP
} = require('../controllers/authController');

router.post('/signup', signupUser);

router.post('/login/email', loginByEmail);

router.post('/login/send-otp', sendOTP);

router.post('/login/verify-otp', verifyOTP);

module.exports = router;
