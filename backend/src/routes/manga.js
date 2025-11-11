const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');

// Home
router.get('/', mangaController.home);

// Genre
router.get('/genre', mangaController.genre);

// Detail manga
router.get('/manga/:slug', mangaController.detail);

module.exports = router;
