const admin = require("firebase-admin");
const serviceAccount = require("../quotevaani-firebase-adminsdk-fbsvc-b83b7fc720.json");
const User = require("../models/userModel");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send Push Notification to one or multiple users
 * @param {string|string[]} fcmToken - Single token or array of tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string|null} imageUrl - Optional image URL
 */
const sendNotification = async (fcmToken, title, body, imageUrl = null) => {
  const tokens = Array.isArray(fcmToken) ? fcmToken : [fcmToken];
  if (!tokens.length) return { success: false, message: "No tokens provided" };

  const messages = tokens.map(token => {
    const msg = { notification: { title, body }, token };
    if (imageUrl) {
      msg.android = { notification: { image: imageUrl } };
      msg.apns = {
        payload: { aps: { "mutable-content": 1 } },
        fcm_options: { image: imageUrl },
      };
    }
    return msg;
  });

  const invalidTokens = [];
  try {
    const response = await admin.messaging().sendAll(messages, false);
    console.log("✅ Notifications sent:", response.successCount);

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const err = resp.error;
        if (
          err.code === "messaging/registration-token-not-registered" ||
          err.code === "messaging/invalid-argument"
        ) {
          invalidTokens.push(tokens[idx]);
        } else {
          console.error(`❌ Failed for token ${tokens[idx]}:`, err.message);
        }
      }
    });

    if (invalidTokens.length) {
      console.log("🗑️ Removing invalid tokens:", invalidTokens);
      await User.updateMany(
        { fcmToken: { $in: invalidTokens } },
        { $unset: { fcmToken: "" } }
      );
    }

    return { success: true, response, invalidTokens };
  } catch (err) {
    console.error("❌ Batch notification error:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = sendNotification;
