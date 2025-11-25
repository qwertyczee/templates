const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/db');
const axios = require('axios');
const { env } = require('../config/env');
const { sendEmail } = require('../utils/email');
const { logger } = require('../utils/logger');

const ACCESS_TOKEN_EXPIRY = '60s';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 1000; // 60 seconds

// Helper to create tokens and set cookies
const createTokensAndSetCookies = (res, user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    env.jwtSecret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email, type: 'refresh' },
    env.jwtSecret,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    path: '/auth',
  });

  return { accessToken, refreshToken };
};

// Send Magic Link
const sendMagicLink = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + env.magicLinkExpiryMinutes * 60 * 1000);

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: { email },
      });
    }

    // Create magic link record
    await prisma.magicLink.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Build magic link URL
    const magicLinkUrl = `${env.frontendUrl}/auth/verify?token=${token}`;

    // Send email
    await sendEmail({
      to: email,
      subject: 'Your Magic Login Link',
      text: `Click the following link to log in: ${magicLinkUrl}\n\nThis link expires in ${env.magicLinkExpiryMinutes} minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome!</h2>
          <p>Click the button below to log in to your account:</p>
          <a href="${magicLinkUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Log In
          </a>
          <p style="color: #666; font-size: 14px;">This link expires in ${env.magicLinkExpiryMinutes} minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this link, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'Magic link sent to your email' });
  } catch (error) {
    logger.error('Send magic link error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to send magic link' });
  }
};

// Verify Magic Link
const verifyMagicLink = async (req, res) => {
  const { token } = req.body;

  try {
    // Find the magic link with user
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!magicLink) {
      return res.status(400).json({ error: 'Invalid magic link' });
    }

    if (new Date() > magicLink.expiresAt) {
      // Delete expired token
      await prisma.magicLink.deleteMany({ where: { id: magicLink.id } });
      return res.status(400).json({ error: 'Magic link expired' });
    }

    const user = magicLink.user;

    // Delete the used magic link
    await prisma.magicLink.deleteMany({ where: { id: magicLink.id } });

    createTokensAndSetCookies(res, user);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    logger.error('Verify magic link error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to verify magic link' });
  }
};

// Refresh Token
const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, env.jwtSecret);
    if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Rotate tokens (optional: keep refresh token if valid, but here we rotate both for security)
    // Actually, usually we rotate refresh token too to detect theft.
    createTokensAndSetCookies(res, user);
    
    res.json({ message: 'Refreshed' });
  } catch (error) {
    logger.error('Refresh error:', { error: error.message, stack: error.stack });
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Google Auth
const googleAuth = (req, res) => {
  const redirectUri = env.googleRedirectUri;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
  res.json({ url });
};

const googleCallback = async (req, res) => {
  const { code } = req.query;
  const redirectUri = env.googleRedirectUri;

  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: { googleId: profile.id },
      create: {
        email: profile.email,
        googleId: profile.id,
      },
    });

    createTokensAndSetCookies(res, user);
    res.redirect(env.frontendDashboardUrl);
  } catch (error) {
    logger.error('Google callback error:', { error: error.message, stack: error.stack });
    res.redirect(`${env.frontendUrl}/login?error=google_auth_failed`);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/auth' });
  res.json({ message: 'Logged out' });
};

module.exports = {
  sendMagicLink,
  verifyMagicLink,
  refresh,
  googleAuth,
  googleCallback,
  me,
  logout,
};