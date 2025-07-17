const multer = require('multer');
const path = require('path');
const fs = require('fs');

const videoPath = path.join(__dirname, '../uploads/quotes');
if (!fs.existsSync(videoPath)) fs.mkdirSync(videoPath, { recursive: true });

const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, videoPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `quote-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only video files are allowed!'));
};

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
});

module.exports = videoUpload;
