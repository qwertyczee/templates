const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProd: (process.env.NODE_ENV || "development") === "production",
    port: Number(process.env.PORT || 8080),

    dbUrl: process.env.DATABASE_URL,

    workosClientId: process.env.WORKOS_CLIENT_ID,
    workosApiKey: process.env.WORKOS_API_KEY,

    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    googleRedirectFrontendUrl: process.env.GOOGLE_REDIRECT_FRONTEND_URL,

    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),

    posthogApiKey: process.env.POSTHOG_API_KEY,
    posthogHost: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
    posthogForceEnable: process.env.POSTHOG_FORCE_ENABLE || false,

    jwtSecret: process.env.JWT_SECRET || "default_secret_change_me",

    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubRedirectUri: process.env.GITHUB_REDIRECT_URI,

    resendApiKey: process.env.RESEND_API_KEY,
    emailFromName: process.env.EMAIL_FROM_NAME || "Your App Name",
    emailFromAddress: process.env.EMAIL_FROM_ADDRESS || "no-reply@yourdomain.com",
    supportEmail: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
    unsubscribeUrl: process.env.UNSUBSCRIBE_URL || "https://yourdomain.com/unsubscribe"
};

module.exports = { env };