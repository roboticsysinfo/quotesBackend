const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  email: { type: String, required: true, unique: true, trim: true },

  password: { type: String, required: true, minlength: 12 },

  phoneNumber: { type: String, trim: true },

  userImage: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  },

  userRole: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  fcmToken: {
    type: String,
  },

  referralCode: {
    type: String,
    unique: true
  },

  referredBy: { type: String }, // Referral Code of inviter

  points: { type: Number, default: 0 },

  // 🆕 Tracking fields for stay & share limits
  lastRewardDate: { type: Date },
  lastReferralShareDate: { type: Date },
  todayReferralShareCount: { type: Number, default: 0 },
  referralShares: { type: Number, default: 0 },
  referralDownloads: { type: Number, default: 0 }



}, { timestamps: true });


// ✅ Generate unique 8-digit referral code starting with "QV"
const generateReferralCode = async () => {
  const code = `QV${Math.floor(100000 + Math.random() * 900000)}`; // QV + 6-digit number e.g., QV123456

  // Check for uniqueness
  const existingUser = await mongoose.models.User.findOne({ referralCode: code });
  if (existingUser) {
    // If already exists (very rare), try again recursively
    return await generateReferralCode();
  }

  return code;
};


// ✅ Hash password & generate referral code before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Only generate referralCode if not already set
  if (!this.referralCode) {
    this.referralCode = await generateReferralCode();
  }

  next();
});


// ✅ Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
