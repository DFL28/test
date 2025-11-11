const express = require('express');
const router = express.Router();
const readerController = require('../controllers/readerController');

// Reader page
router.get('/manga/:slug/chapter/:chapterNumber', readerController.read);

module.exports = router;
