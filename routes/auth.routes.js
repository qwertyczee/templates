const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authRequired } = require('../middlewares/auth.middleware');

router.get('/login', authController.getAuthUrl);
router.get('/callback', authController.callback);
router.get('/me', authRequired, authController.me);
router.post('/logout', authController.logout);

module.exports = router;