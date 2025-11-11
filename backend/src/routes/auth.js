const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup
router.get('/signup', authController.showSignup);
router.post('/signup', authController.signup);

// Login
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

// Forgot password
router.get('/forgot', authController.showForgot);
router.post('/forgot', authController.forgotPassword);

// Reset password
router.get('/reset/:token', authController.showReset);
router.post('/reset/:token', authController.resetPassword);

module.exports = router;
