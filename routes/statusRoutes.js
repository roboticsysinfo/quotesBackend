const express = require('express');
const router = express.Router();
const { uploadStatus, getAllStatuses, deleteStatus } = require('../controllers/statusController');
const upload  = require("../middleware/upload");
const { adminOnly } = require('../middleware/authMiddleware');

router.post('/upload-status', adminOnly, upload.single('image'), uploadStatus);

router.get('/get-all-status', getAllStatuses);

router.delete('/delete/status/:id', adminOnly,  deleteStatus);

module.exports = router;
