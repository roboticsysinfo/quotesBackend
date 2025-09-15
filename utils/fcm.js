const admin = require("firebase-admin");
const serviceAccount = require("../quotevaani-firebase-adminsdk-fbsvc-b83b7fc720.json");

// Prevent multiple initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send Push Notification
 * @param {String} fcmToken - Firebase device token
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {String|null} imageUrl - Optional image URL
 */
const sendNotification = async (fcmToken, title, body, imageUrl = null) => {
  try {
    const message = {
      notification: { title, body },
      token: fcmToken,
    };

    if (imageUrl) {
      message.android = { notification: { image: imageUrl } };
      message.apns = {
        payload: { aps: { "mutable-content": 1 } },
        fcm_options: { image: imageUrl },
      };
    }

    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
    return { success: true, response };
  } catch (err) {
    console.error("❌ Failed to notify:", fcmToken, err.message);

    // Handle invalid/expired tokens
    if (
      err.errorInfo &&
      (err.errorInfo.code === "messaging/invalid-argument" ||
        err.errorInfo.code === "messaging/registration-token-not-registered")
    ) {
      console.log("🗑️ Removing invalid FCM token:", fcmToken);

      // 👉 यहां आप अपने DB से token remove/update कर सकते हो
      // Example (अगर आपके पास User model है):
      // await User.updateOne({ fcmToken }, { $unset: { fcmToken: "" } });
    }

    return { success: false, error: err.message };
  }
};

module.exports = sendNotification;
