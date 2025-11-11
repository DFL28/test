const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireAdmin, requireAdminAPI } = require('../middlewares/adminMiddleware');

// Admin dashboard
router.get('/admin', requireAuth, requireAdmin, adminController.dashboard);

// Add manga
router.post('/admin/manga/add', requireAuth, requireAdminAPI, adminController.addManga);

// Ban/unban user
router.post('/admin/users/:id/ban', requireAuth, requireAdminAPI, adminController.banUser);
router.post('/admin/users/:id/unban', requireAuth, requireAdminAPI, adminController.unbanUser);

module.exports = router;
