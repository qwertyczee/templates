const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProd: (process.env.NODE_ENV || "development") === "production",
    port: Number(process.env.PORT || 8080),

    dbUrl: process.env.DATABASE_URL,

    jwtSecret: process.env.JWT_SECRET || "default_secret_change_me",

    // Magic Link
    magicLinkExpiryMinutes: Number(process.env.MAGIC_LINK_EXPIRY_MINUTES || 60),

    // Google OAuth
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,

    // Frontend
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    frontendDashboardUrl: process.env.FRONTEND_DASHBOARD_URL || "http://localhost:3000/dashboard",
    corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),

    // PostHog
    posthogApiKey: process.env.POSTHOG_API_KEY,
    posthogHost: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
    posthogForceEnable: process.env.POSTHOG_FORCE_ENABLE || false,

    // Email (Resend)
    resendApiKey: process.env.RESEND_API_KEY,
    emailFromName: process.env.EMAIL_FROM_NAME || "Your App Name",
    emailFromAddress: process.env.EMAIL_FROM_ADDRESS || "no-reply@yourdomain.com",
    supportEmail: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
};

module.exports = { env };