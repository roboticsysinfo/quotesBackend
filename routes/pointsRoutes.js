const express = require("express");
const router = express.Router();
const {
  rewardDailyStayPointsUser,
  incrementReferralShareUser,
  getUserReferralDetails
} = require("../controllers/pointsController");
const { protect } = require("../middleware/authMiddleware"); // ensure JWT protection


// 🟦 Daily 10 min stay reward
router.post("/daily-stay", protect, rewardDailyStayPointsUser);

// 🟧 Referral share count & points
router.post("/refer-share", protect, incrementReferralShareUser);

// 📋 Referral details of a user
router.get("/referral-details/:id", protect, getUserReferralDetails);


module.exports = router;
