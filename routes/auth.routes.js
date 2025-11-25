const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const {
  sendMagicLinkSchema,
  verifyMagicLinkSchema,
  refreshSchema,
  googleCallbackSchema,
  logoutSchema
} = require('../validations/auth.validation');

// Magic Link
router.post('/magic-link', validate(sendMagicLinkSchema), authController.sendMagicLink);
router.post('/magic-link/verify', validate(verifyMagicLinkSchema), authController.verifyMagicLink);

// Token Refresh
router.post('/refresh', validate(refreshSchema), authController.refresh);

// Google
router.get('/google', authController.googleAuth);
router.get('/google/callback', validate(googleCallbackSchema), authController.googleCallback);

// User & Session
router.get('/me', authRequired, authController.me);
router.post('/logout', validate(logoutSchema), authController.logout);

module.exports = router;