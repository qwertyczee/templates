/* Drizzle + postgres-js connection and on-start table initialization */
const postgres = require("postgres");
const { drizzle } = require("drizzle-orm/postgres-js");
const { env } = require("./env");
const { users, sessions } = require("../models/schema");

if (!env.dbUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const sql = postgres(env.dbUrl, {
    ssl: { require: true, rejectUnauthorized: false },
    max: 1 // serverless-friendly
});

const db = drizzle(sql);

let initDone = false;

async function initDb() {
    if (initDone) return;
    initDone = true;

    // Create tables if not exists (simple bootstrap without migrations)
    await sql/* sql */`
        CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT,
        name TEXT,
        "imageUrl" TEXT,
        provider TEXT NOT NULL DEFAULT 'local',
        "providerId" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `;

    await sql/* sql */`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    await sql/* sql */`
        CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY,
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "userAgent" TEXT,
        ip TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "expiresAt" TIMESTAMPTZ NOT NULL
        );
    `;

    await sql/* sql */`
        CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions("userId");
    `;
}

/* initDb().catch((e) => {
    console.error("DB init error:", e);
}); */

module.exports = { db, sql, users, sessions };