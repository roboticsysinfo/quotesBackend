// services/push.service.js
const admin = require("firebase-admin");
const serviceAccount = require("../quotevaani-firebase-adminsdk-fbsvc-b83b7fc720.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendNotification = async (fcmToken, title, body, imageUrl = null) => {
  try {
    if (!fcmToken) {
      console.warn("⚠️ Skipping notification: Empty fcmToken");
      return;
    }

    const message = {
      notification: { title, body },
      token: fcmToken,
      android: {},
      apns: {},
    };

    if (imageUrl) {
      message.android.notification = { image: imageUrl };
      message.apns = {
        payload: { aps: { "mutable-content": 1 } },
        fcm_options: { image: imageUrl },
      };
    }

    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending notification:", error.code, error.message);

    // अगर token invalid है तो user DB से delete कर सकते हो
    if (error.code === "messaging/invalid-argument" || error.code === "messaging/registration-token-not-registered") {
      console.warn("⚠️ Invalid FCM Token:", fcmToken);
      // 👉 यहां DB से इस token को हटा सकते हो
    }
  }
};

module.exports = sendNotification;
