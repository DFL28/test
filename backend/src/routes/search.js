const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Search page (desktop)
router.get('/search', searchController.search);

// Search API (mobile AJAX)
router.get('/api/search', searchController.searchAPI);

module.exports = router;
