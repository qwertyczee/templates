const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const axios = require('axios');
const { env } = require('../config/env');

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
    path: '/auth', // Only send refresh token to auth routes (specifically /refresh)
  });

  return { accessToken, refreshToken };
};

// Email/Password Register
const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    createTokensAndSetCookies(res, user);
    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Email/Password Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    createTokensAndSetCookies(res, user);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
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
    console.error('Refresh error:', error);
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
    res.redirect(env.frontendUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${env.frontendUrl}/login?error=google_auth_failed`);
  }
};

// GitHub Auth
const githubAuth = (req, res) => {
  const redirectUri = env.githubRedirectUri;
  const url = `https://github.com/login/oauth/authorize?client_id=${env.githubClientId}&redirect_uri=${redirectUri}&scope=user:email`;
  res.json({ url });
};

const githubCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { data } = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
    }, {
      headers: { Accept: 'application/json' }
    });

    if (data.error) throw new Error(data.error_description);

    const { data: profile } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    let email = profile.email;
    if (!email) {
      const { data: emails } = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      email = emails.find(e => e.primary && e.verified)?.email;
    }

    if (!email) throw new Error('No verified email found');

    const user = await prisma.user.upsert({
      where: { email },
      update: { githubId: String(profile.id) },
      create: {
        email,
        githubId: String(profile.id),
      },
    });

    createTokensAndSetCookies(res, user);
    res.redirect(env.frontendUrl);
  } catch (error) {
    console.error('GitHub callback error:', error);
    res.redirect(`${env.frontendUrl}/login?error=github_auth_failed`);
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
  register,
  login,
  refresh,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  me,
  logout,
};