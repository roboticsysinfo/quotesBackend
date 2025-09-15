const admin = require("firebase-admin");
const serviceAccount = require("../quotevaani-firebase-adminsdk-fbsvc-b83b7fc720.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (fcmToken, title, body) => {
  const message = {
    notification: { title, body },
    token: fcmToken,
  };

  await admin.messaging().send(message);
};