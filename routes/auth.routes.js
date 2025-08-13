const express = require("express");
const authController = require("../controllers/auth.controller");
const { googleCallback, googleStart, googleVerify,
    login, register, logout,
    me, refresh
} = authController;
const { authRequired } = require("../middlewares/auth.middleware");

const router = express.Router();
const validate = require("../middlewares/validation.middleware");
const { registerSchema, loginSchema, refreshSchema, googleVerifySchema } = require("../validations/auth.validation");

// Email/password
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Token operations
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);

// Current user
router.get("/me", authRequired, me);

// Google OAuth (Auth Code + PKCE)
router.get("/google", googleStart);
router.get("/google/callback", googleCallback);

// Google One Tap / ID token verification
router.post("/google/verify", validate(googleVerifySchema), googleVerify);

// Password reset and 2FA
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-code", authController.verifyCode);

// Sessions
router.get("/sessions", authRequired, authController.getLoginSessions);
router.delete("/sessions/:sessionId", authRequired, authController.revokeSession);
router.delete("/sessions", authRequired, authController.revokeAllSessions);

module.exports = router;