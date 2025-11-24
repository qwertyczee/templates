const { WorkOS } = require('@workos-inc/node');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientId = process.env.WORKOS_CLIENT_ID;
const jwtSecret = process.env.JWT_SECRET || 'default_secret_change_me';

const getAuthUrl = async (req, res) => {
  try {
    const url = workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId,
      redirectUri: process.env.WORKOS_REDIRECT_URI || 'http://localhost:8080/auth/callback',
    });
    res.json({ url });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ error: 'Failed to get auth URL' });
  }
};

const callback = async (req, res) => {
  const { code } = req.query;

  try {
    const { user } = await workos.userManagement.authenticateWithCode({
      clientId,
      code,
    });

    // Upsert user in Prisma
    const dbUser = await prisma.user.upsert({
      where: { workosId: user.id },
      update: {
        email: user.email,
        updatedAt: new Date(),
      },
      create: {
        workosId: user.id,
        email: user.email,
      },
    });

    // Create JWT
    const token = jwt.sign(
      { userId: dbUser.id, workosId: dbUser.workosId, email: dbUser.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const me = async (req, res) => {
  // User is already attached by middleware
  res.json({ user: req.user });
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

module.exports = {
  getAuthUrl,
  callback,
  me,
  logout,
};