// utils/multer.js
const multer = require('multer');

const storage = multer.memoryStorage(); // store in memory before sending to ImageKit

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only image/video allowed.'));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
