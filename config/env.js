const bool = (v, d = false) => {
    if (v === undefined) return d;
    return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
};

const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProd: (process.env.NODE_ENV || "development") === "production",
    port: Number(process.env.PORT || 8080),
  
    dbUrl: process.env.DATABASE_URL,
  
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:8080/auth/google/callback",
    googleRedirectFrontendUrl: process.env.GOOGLE_REDIRECT_FRONTEND_URL || "http://localhost:3000",
  
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),
  
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    cookieSecure: bool(process.env.COOKIE_SECURE, false),
    cookieSameSite: process.env.COOKIE_SAMESITE || "lax",
  
    axiomToken: process.env.AXIOM_TOKEN,
    axiomDataset: process.env.AXIOM_DATASET || "logs-backend",
  
    posthogApiKey: process.env.POSTHOG_API_KEY,
    posthogHost: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
    posthogForceEnable: process.env.POSTHOG_FORCE_ENABLE || false,

    resendApiKey: process.env.RESEND_API_KEY,
    emailFromName: process.env.EMAIL_FROM_NAME || "Your App Name",
    emailFromAddress: process.env.EMAIL_FROM_ADDRESS || "no-reply@yourdomain.com",
    supportEmail: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
    unsubscribeUrl: process.env.UNSUBSCRIBE_URL || "https://yourdomain.com/unsubscribe"
};

module.exports = { env };