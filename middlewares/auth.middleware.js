const { verifyAccessToken } = require("../utils/jwt");

function authRequired(req, res, next) {
    let token = null;

    // If not found in header, try to get it from cookies
    if (!token && req.cookies?.at) {
        token = req.cookies.at;
    }

    if (!token) {
        return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            email: payload.email
        };
        return next();
    } catch (_e) {
        return res.status(401).json({ error: { message: "Invalid token" } });
    }
}

module.exports = { authRequired };