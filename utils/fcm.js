const admin = require("firebase-admin");
const serviceAccount = require("../quotevaani-firebase-adminsdk-fbsvc-b83b7fc720.json");
const User = require("../models/userModel");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send Push Notification to one or multiple users individually
 * @param {string|string[]} fcmToken - Single token or array of tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string|null} imageUrl - Optional image URL
 */
const sendNotification = async (fcmToken, title, body, imageUrl = null) => {
  const tokens = Array.isArray(fcmToken) ? fcmToken : [fcmToken];
  if (!tokens.length) return { success: false, message: "No tokens provided" };

  const invalidTokens = [];

  for (const token of tokens) {
    const message = { notification: { title, body }, token };

    if (imageUrl) {
      message.android = { notification: { image: imageUrl } };
      message.apns = {
        payload: { aps: { "mutable-content": 1 } },
        fcm_options: { image: imageUrl },
      };
    }

    try {
      await admin.messaging().send(message);
      console.log(`✅ Notification sent to token: ${token}`);
    } catch (err) {
      if (
        err.code === "messaging/registration-token-not-registered" ||
        err.code === "messaging/invalid-argument"
      ) {
        invalidTokens.push(token);
      } else {
        console.error(`❌ Failed for token ${token}:`, err.message);
      }
    }
  }

  if (invalidTokens.length) {
    console.log("🗑️ Removing invalid tokens:", invalidTokens);
    await User.updateMany(
      { fcmToken: { $in: invalidTokens } },
      { $unset: { fcmToken: "" } }
    );
  }

  return { success: true, invalidTokens };
};

module.exports = sendNotification;
