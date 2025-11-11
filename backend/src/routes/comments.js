const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { requireAuth, requireAuthAPI } = require('../middlewares/authMiddleware');

// Post comment (harus login)
router.post('/manga/:slug/comments', requireAuth, commentController.postComment);

// Delete comment (admin only)
router.post('/comments/:id/delete', requireAuthAPI, commentController.deleteComment);

module.exports = router;
