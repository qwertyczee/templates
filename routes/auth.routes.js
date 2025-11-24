const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authRequired } = require('../middlewares/auth.middleware');

// Email/Password
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Google
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// GitHub
router.get('/github', authController.githubAuth);
router.get('/github/callback', authController.githubCallback);

// User & Session
router.get('/me', authRequired, authController.me);
router.post('/logout', authController.logout);

module.exports = router;