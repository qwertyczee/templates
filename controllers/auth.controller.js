const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const { eq, and } = require("drizzle-orm");

const { env } = require("../config/env");
const { db, users, sessions } = require("../config/db");
const {
  hashPassword,
  verifyPassword,
  randomId,
  base64url,
  sha256
} = require("../utils/crypto");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require("../utils/jwt");
const { capture } = require("../utils/posthog");

const oauthClient = new OAuth2Client(env.googleClientId);

const cookieOptions = (days = 7) => {
    const maxAge = days * 24 * 60 * 60 * 1000;
    const opts = {
        httpOnly: true,
        secure: env.cookieSecure || env.isProd,
        sameSite: env.cookieSameSite,
        path: "/",
        maxAge
    };
    if (env.cookieDomain && env.cookieDomain.trim() !== "") {
        opts.domain = env.cookieDomain;
    }
    return opts;
}

const setRefreshCookie = (res, token) => {
    res.cookie("rt", token, cookieOptions(7));
}

const clearRefreshCookie = (res) => {
    const opts = {
        httpOnly: true,
        secure: env.cookieSecure || env.isProd,
        sameSite: env.cookieSameSite,
        path: "/"
    };
    if (env.cookieDomain && env.cookieDomain.trim() !== "") {
        opts.domain = env.cookieDomain;
    }
    res.clearCookie("rt", opts);
}

const createSession = async (userId, req, jti) => {
    const sessionId = uuidv4();
    const expiresAt = new Date(
        Date.now() +
        parseTtlMs(env.refreshTokenTtl || "7d")
    );
    await db.insert(sessions).values({
        id: sessionId,
        userId,
        token: jti,
        userAgent: req.headers["user-agent"] || "",
        ipAddress: (req.headers["x-forwarded-for"] || "").toString().split(",")[0] || "",
        deviceType: req.device?.type || null,
        browser: req.useragent?.browser || null,
        os: req.useragent?.os || null,
        location: req.location || null,
        createdAt: new Date(),
        expiresAt
    });
    return sessionId;
}

const parseTtlMs = (ttl) => {
    // simple "15m", "7d", "1h" parser
    const m = String(ttl).match(/^(\d+)(ms|s|m|h|d)$/i);
    if (!m) return 15 * 60 * 1000;
    const n = Number(m[1]);
    const u = m[2].toLowerCase();
    const map = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return n * map[u];
}

const issueTokens = async (user, req) => {
    const jti = uuidv4();
    const sessionId = await createSession(user.id, req, jti);
    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email
    });
    const refreshToken = signRefreshToken({
        sub: user.id,
        sid: sessionId,
        jti
    });
    return { accessToken, refreshToken, sessionId };
}

const sanitizeUser = (u) => {
    return {
        id: u.id,
        email: u.email,
        name: u.name,
        imageUrl: u.imageUrl,
        provider: u.provider,
        providerId: u.providerId,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
    };
}

const findUserByEmail = async (email) => {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0] || null;
}

const register = async (req, res) => {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({
        error: { message: "Email and password are required" }
        });
    }

    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
        return res.status(409).json({
        error: { message: "User with this email already exists" }
        });
    }

    const pwd = await hashPassword(password);
    const id = uuidv4();
    const now = new Date();

    await db.insert(users).values({
        id,
        email: email.toLowerCase(),
        passwordHash: pwd,
        name: name || null,
        provider: "local",
        createdAt: now,
        updatedAt: now
    });

    const user = await findUserByEmail(email.toLowerCase());
    const { accessToken, refreshToken } = await issueTokens(user, req);
    setRefreshCookie(res, refreshToken);

    capture("auth.register", user.id, { email: user.email, provider: "local" });
    req.log.info("user_registered", { userId: user.id });

    return res.status(201).json({
        user: sanitizeUser(user),
        tokens: { accessToken }
    });
}

const login = async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res
        .status(400)
        .json({ error: { message: "Email and password are required" } });
    }

    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
        return res.status(401).json({ error: { message: "Invalid login credentials" } });
    }
    if (user.provider !== "local") {
        return res.status(400).json({
        error: { message: "Account is registered via Google, please use Google" }
        });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: { message: "Invalid login credentials" } });
    }

    const { accessToken, refreshToken } = await issueTokens(user, req);
    setRefreshCookie(res, refreshToken);

    capture("auth.login", user.id, { email: user.email, provider: "local" });
    req.log.info("user_logged_in", { userId: user.id });

    {
        const opts = {
            httpOnly: true,
            secure: env.cookieSecure || env.isProd,
            sameSite: env.cookieSameSite,
            path: "/",
            maxAge: 15 * 60 * 1000 // 15 minutes for access token
        };
        if (env.cookieDomain && env.cookieDomain.trim() !== "") {
            opts.domain = env.cookieDomain;
        }
        res.cookie("at", accessToken, opts);
    }

    return res.redirect(env.googleRedirectFrontendUrl);
}

const refresh = async (req, res) => {
    const token = req.cookies?.rt || req.body?.refreshToken;
    if (!token) {
        return res.status(401).json({ error: { message: "Refresh token is missing" } });
    }

    let payload;
    try {
        payload = verifyRefreshToken(token);
    } catch (_e) {
        return res.status(401).json({ error: { message: "Invalid token" } });
    }

    // Validate session
    const sid = payload.sid;
    const sessionRows = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sid));
    const session = sessionRows[0];
    if (!session) {
        return res.status(401).json({ error: { message: "Session does not exist" } });
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
        await db.delete(sessions).where(eq(sessions.id, sid));
        return res.status(401).json({ error: { message: "Session expired" } });
    }

    // Rotate session
    await db.delete(sessions).where(eq(sessions.id, sid));

    // Re-issue tokens
    const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.sub));
    const user = userRows[0];
    if (!user) {
        return res.status(401).json({ error: { message: "User not found" } });
    }

    const { accessToken, refreshToken } = await issueTokens(user, req);
    setRefreshCookie(res, refreshToken);

    {
        const opts = {
            httpOnly: true,
            secure: env.cookieSecure || env.isProd,
            sameSite: env.cookieSameSite,
            path: "/",
            maxAge: 15 * 60 * 1000
        };
        if (env.cookieDomain && env.cookieDomain.trim() !== "") {
            opts.domain = env.cookieDomain;
        }
        res.cookie("at", accessToken, opts);
    }

    req.log.info("token_refreshed", { userId: user.id });

    return res.redirect(env.googleRedirectFrontendUrl);
}

const logout = async (req, res) => {
    const token = req.cookies?.rt || req.body?.refreshToken;
    if (token) {
        try {
            const p = verifyRefreshToken(token);
            // Delete session by jti from the token
            await db.delete(sessions).where(eq(sessions.token, p.jti));
        } catch (_e) {
            // ignore invalid
        }
    }
    clearRefreshCookie(res);
    {
        const opts = {
            httpOnly: true,
            secure: env.cookieSecure || env.isProd,
            sameSite: env.cookieSameSite,
            path: "/"
        };
        if (env.cookieDomain && env.cookieDomain.trim() !== "") {
            opts.domain = env.cookieDomain;
        }
        res.clearCookie("at", opts);
    }
    // Force expire access token cookie
    {
        const opts = {
            httpOnly: true,
            secure: env.cookieSecure || env.isProd,
            sameSite: env.cookieSameSite,
            path: "/",
            expires: new Date(0)
        };
        if (env.cookieDomain && env.cookieDomain.trim() !== "") {
            opts.domain = env.cookieDomain;
        }
        res.cookie("at", "", opts);
    }
    req.log.info("user_logged_out", {});
    return res.redirect(env.googleRedirectFrontendUrl);
}

const me = async (req, res) => {
    const rows = await db.select().from(users).where(eq(users.id, req.user.id));
    const user = rows[0];
    if (!user) {
        return res.status(404).json({ error: { message: "User not found" } });
    }
    return res.json({ user: sanitizeUser(user) });
}

/* Google OAuth - Auth Code Flow + PKCE */
const googleStart = async (req, res) => {
    const state = randomId(16);
    const codeVerifier = base64url(randomId(32));
    const codeChallenge = base64url(sha256(codeVerifier));

    // Store verifier+state in short-lived cookies
    res.cookie("g_state", state, {
        httpOnly: true,
        secure: env.cookieSecure || env.isProd,
        sameSite: "lax",
        path: "/auth/google/callback",
        maxAge: 10 * 60 * 1000
    });
    res.cookie("g_verifier", codeVerifier, {
        httpOnly: true,
        secure: env.cookieSecure || env.isProd,
        sameSite: "lax",
        path: "/auth/google/callback",
        maxAge: 10 * 60 * 1000
    });

    const params = new URLSearchParams({
        response_type: "code",
        client_id: env.googleClientId,
        redirect_uri: env.googleRedirectUri,
        scope: "openid email profile",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        access_type: "offline",
        prompt: "consent"
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.redirect(url);
}

const googleCallback = async (req, res) => {
    const { code, state } = req.query;
    const cookieState = req.cookies?.g_state;
    const codeVerifier = req.cookies?.g_verifier;

    if (!code || !state || !cookieState || !codeVerifier || state !== cookieState) {
        return res.status(400).send("Invalid OAuth state/verifier");
    }

    // Exchange code for tokens
    const tokenRes = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
        code,
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_uri: env.googleRedirectUri,
        grant_type: "authorization_code",
        code_verifier: codeVerifier
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { id_token: idToken, access_token: googleAccessToken } = tokenRes.data;

    let ticket;
    try {
        ticket = await oauthClient.verifyIdToken({
        idToken,
        audience: env.googleClientId
        });
    } catch (_e) {
        return res.status(400).send("Failed to verify Google ID token");
    }

    const payload = ticket.getPayload();
    const email = payload.email?.toLowerCase();
    const sub = payload.sub;
    const name = payload.name || "";
    const picture = payload.picture || null;

    if (!email) {
        return res.status(400).send("Email was not returned by Google");
    }

    let user = await findUserByEmail(email);
    const now = new Date();

    if (!user) {
        const id = uuidv4();
        await db.insert(users).values({
        id,
        email,
        passwordHash: null,
        name,
        imageUrl: picture,
        provider: "google",
        providerId: sub,
        createdAt: now,
        updatedAt: now
        });
        user = await findUserByEmail(email);
    } else if (user.provider !== "google") {
        // Link existing local account to Google
        await db
        .update(users)
        .set({
            provider: "google",
            providerId: sub,
            imageUrl: user.imageUrl || picture,
            name: user.name || name,
            updatedAt: now
        })
        .where(eq(users.id, user.id));
        user = await findUserByEmail(email);
    }

    const { accessToken, refreshToken } = await issueTokens(user, req);
    setRefreshCookie(res, refreshToken);

    capture("auth.login", user.id, {
        email: user.email,
        provider: "google"
    });
    req.log.info("user_google_login", { userId: user.id });

    {
        const opts = {
            httpOnly: true,
            secure: env.cookieSecure || env.isProd,
            sameSite: env.cookieSameSite,
            path: "/",
            maxAge: 15 * 60 * 1000 // 15 minutes for access token
        };
        if (env.cookieDomain && env.cookieDomain.trim() !== "") {
            opts.domain = env.cookieDomain;
        }
        res.cookie("at", accessToken, opts);
    }

    // Clear temporary Google PKCE cookies
    res.clearCookie("g_state", { path: "/auth/google/callback" });
    res.clearCookie("g_verifier", { path: "/auth/google/callback" });

    return res.redirect(env.googleRedirectFrontendUrl);
}

/* Google One Tap / ID token verification endpoint */
const googleVerify = async (req, res) => {
    const { idToken } = req.body || {};
    if (!idToken) {
        return res.status(400).json({ error: { message: "idToken is missing" } });
    }

    let ticket;
    try {
        ticket = await oauthClient.verifyIdToken({
        idToken,
        audience: env.googleClientId
        });
    } catch (_e) {
        return res.status(400).json({ error: { message: "Invalid idToken" } });
    }

    const payload = ticket.getPayload();
    const email = payload.email?.toLowerCase();
    const sub = payload.sub;
    const name = payload.name || "";
    const picture = payload.picture || null;

    if (!email) {
        return res.status(400).json({ error: { message: "Email was not returned" } });
    }

    let user = await findUserByEmail(email);
    const now = new Date();

    if (!user) {
        const id = uuidv4();
        await db.insert(users).values({
        id,
        email,
        passwordHash: null,
        name,
        imageUrl: picture,
        provider: "google",
        providerId: sub,
        createdAt: now,
        updatedAt: now
        });
        user = await findUserByEmail(email);
    } else if (user.provider !== "google") {
        await db
        .update(users)
        .set({
            provider: "google",
            providerId: sub,
            imageUrl: user.imageUrl || picture,
            name: user.name || name,
            updatedAt: now
        })
        .where(eq(users.id, user.id));
        user = await findUserByEmail(email);
    }

    const { accessToken, refreshToken } = await issueTokens(user, req);
    setRefreshCookie(res, refreshToken);

    capture("auth.login", user.id, {
        email: user.email,
        provider: "google"
    });
    req.log.info("user_google_verify_login", { userId: user.id });

    return res.json({
        user: sanitizeUser(user),
        tokens: { accessToken }
    });
}

const forgotPassword = async (req, res) => {
    const { email } = req.body || {};
    if (!email) {
        return res.status(400).json({ error: { message: "Email is required" } });
    }
    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
        return res.status(200).json({ message: "If the email is registered, a reset link has been sent" }); // do not reveal existence
    }

    const resetCode = randomId(6);
    // Store resetCode in DB or send via email (not implemented here fully)
    await db.update(users)
        .set({ resetCode, updatedAt: new Date() })
        .where(eq(users.id, user.id));

    // Here you would send the email
    req.log.info("password_reset_requested", { userId: user.id });

    return res.status(200).json({ message: "If the email is registered, a reset link has been sent" });
}

const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body || {};
    if (!email || !code || !newPassword) {
        return res.status(400).json({ error: { message: "Email, code, and new password are required" } });
    }
    const user = await findUserByEmail(email.toLowerCase());
    if (!user || user.resetCode !== code) {
        return res.status(400).json({ error: { message: "Invalid code" } });
    }
    const pwd = await hashPassword(newPassword);
    await db.update(users)
        .set({ passwordHash: pwd, resetCode: null, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    req.log.info("password_reset_success", { userId: user.id });
    return res.status(200).json({ message: "Password has been successfully changed" });
}

const verifyCode = async (req, res) => {
    const { code } = req.body || {};
    if (!code) {
        return res.status(400).json({ error: { message: "Code is required" } });
    }
    // This example just echoes success, in real 2FA you'd verify against stored secret
    if (code === "123456") {
        return res.status(200).json({ message: "Code verified" });
    }
    return res.status(400).json({ error: { message: "Invalid code" } });
}

const getLoginSessions = async (req, res) => {
    const rows = await db.select().from(sessions).where(eq(sessions.userId, req.user.id));
    return res.json({ sessions: rows });
}

const revokeSession = async (req, res) => {
    const { sessionId } = req.params;
    await db.delete(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, req.user.id)));
    return res.status(200).json({ message: "Session removed" });
}

const revokeAllSessions = async (req, res) => {
    await db.delete(sessions).where(eq(sessions.userId, req.user.id));
    return res.status(200).json({ message: "All sessions removed" });
}

module.exports = {
    register,
    login,
    refresh,
    logout,
    me,
    googleStart,
    googleCallback,
    googleVerify,
    forgotPassword,
    resetPassword,
    verifyCode,
    getLoginSessions,
    revokeSession,
    revokeAllSessions
};