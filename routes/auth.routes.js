const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authRequired } = require('../middlewares/auth.middleware');

// Magic Link
router.post('/magic-link', authController.sendMagicLink);
router.post('/magic-link/verify', authController.verifyMagicLink);

// Token Refresh
router.post('/refresh', authController.refresh);

// Google
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// User & Session
router.get('/me', authRequired, authController.me);
router.post('/logout', authController.logout);

module.exports = router;