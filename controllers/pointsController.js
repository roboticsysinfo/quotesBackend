const User = require("../models/userModel");
const PointTransactionHistory = require("../models/PointTransactionsHistory");

// Daily 15 min stay reward points for User
const rewardDailyStayPointsUser = async (req, res) => {

  const userId = req.user.id; // from auth middleware

  try {

    const user = await User.findById(userId);
    const today = new Date().toDateString();

    if (user.lastRewardDate?.toDateString() === today) {
      return res.status(400).json({ message: "Already rewarded today" });
    }

    const rewardPoints = 2;
    user.points += rewardPoints;
    user.lastRewardDate = new Date();
    await user.save();

    await PointTransactionHistory.create({
      user: user._id,
      deductedPoints: rewardPoints,
      type: "daily_stay",
      description: "Daily 10-min stay reward"
    });

    res.json({ message: `${rewardPoints} points rewarded`, points: user.points });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const incrementReferralShareUser = async (req, res) => {
  try {
    const { userId } = req.body; // or use req.user.id
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toDateString();
    const lastShareDate = user.lastReferralShareDate
      ? new Date(user.lastReferralShareDate).toDateString()
      : null;

    if (lastShareDate === today) {
      if (user.todayReferralShareCount >= 3) {
        return res.status(200).json({ message: "Daily share limit reached. Try again tomorrow." });
      }
      user.todayReferralShareCount += 1;
    } else {
      user.todayReferralShareCount = 1;
      user.lastReferralShareDate = new Date();
    }

    user.referralShares += 1;
    user.points += 1;
    await user.save();

    await PointTransactionHistory.create({
      user: user._id,
      deductedPoints: 1,
      type: "daily_share",
      description: "Points awarded for sharing referral code"
    });

    res.status(200).json({
      message: "Referral share counted & points added",
      points: user.points,
      todayShareCount: user.todayReferralShareCount
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const getUserReferralDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const referredUsersRaw = await User.find({ referredBy: user.referralCode })
      .select("name referralCode createdAt")
      .lean();

    const referredUsers = referredUsersRaw.map(u => ({
      name: u.name,
      referralCode: u.referralCode,
      createdAt: u.createdAt,
      createdAtFormatted: new Date(u.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    }));

    res.status(200).json({
      referralCode: user.referralCode,
      referralShares: user.referralShares,
      referralDownloads: user.referralDownloads,
      referredUsers
    });
  } catch (error) {
    console.error("Error fetching referral details:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports={
    getUserReferralDetails,
    incrementReferralShareUser,
    rewardDailyStayPointsUser
}