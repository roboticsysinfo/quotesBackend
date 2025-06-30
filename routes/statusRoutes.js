const express = require('express');
const router = express.Router();
const { uploadStatus, getAllStatuses, deleteStatus } = require('../controllers/statusController');
const upload  = require("../middleware/upload")

router.post('/upload-status',  upload.single('image'), uploadStatus);

router.get('/get-all-status', getAllStatuses);

router.delete('/delete/status/:id',  deleteStatus);

module.exports = router;
