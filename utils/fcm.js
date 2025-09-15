const admin = require("firebase-admin");
const serviceAccount = require("../quotevaani-firebase-adminsdk-fbsvc-b83b7fc720.json");
const User = require("../models/userModel"); // Make sure you have User model

// Prevent multiple initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send Push Notification to multiple users
 * @param {Array} fcmToken - Array of Firebase device tokens
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {String|null} imageUrl - Optional image URL
 */
const sendNotification = async (fcmToken = [], title, body, imageUrl = null) => {
  if (!fcmToken.length) return { success: false, message: "No tokens provided" };

  // Prepare messages
  const messages = fcmToken.map(token => {
    const msg = {
      notification: { title, body },
      token,
    };

    if (imageUrl) {
      msg.android = { notification: { image: imageUrl } };
      msg.apns = {
        payload: { aps: { "mutable-content": 1 } },
        fcm_options: { image: imageUrl },
      };
    }

    return msg;
  });

  // Send batch
  const invalidTokens = [];
  try {
    const response = await admin.messaging().sendAll(messages, false); // false = don't dry run
    console.log("✅ Notifications sent:", response.successCount);

    // Collect invalid tokens to remove from DB
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const err = resp.error;
        if (
          err.code === "messaging/registration-token-not-registered" ||
          err.code === "messaging/invalid-argument"
        ) {
          invalidTokens.push(fcmToken[idx]);
        } else {
          console.error(`❌ Failed for token ${fcmToken[idx]}:`, err.message);
        }
      }
    });

    // Remove invalid tokens from DB
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
