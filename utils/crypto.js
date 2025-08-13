const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
    if (!hash) return false;
    return bcrypt.compare(password, hash);
}

function randomId(length = 32) {
    return crypto.randomBytes(length).toString("hex");
}

function base64url(buffer) {
    return Buffer.from(buffer)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function sha256(input) {
    return crypto.createHash("sha256").update(input).digest();
}

module.exports = {
    hashPassword,
    verifyPassword,
    randomId,
    base64url,
    sha256
};