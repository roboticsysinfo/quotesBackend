const admin = require("firebase-admin");
const serviceAccount = require("../quotevaani-firebase-adminsdk-fbsvc-b83b7fc720.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (fcmToken, title, body, imageUrl = null) => {
  const message = {
    notification: { title, body },
    token: fcmToken,
    android: {},
    apns: {},
  };

  if (imageUrl) {
    message.android.notification = { image: imageUrl };
    message.apns = {
      payload: {
        aps: {
          "mutable-content": 1,
        },
      },
      fcm_options: {
        image: imageUrl,
      },
    };
  }

  await admin.messaging().send(message);
};

module.exports = sendNotification;