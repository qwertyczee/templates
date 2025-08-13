const {
    pgTable,
    text,
    timestamp,
    uuid
} = require("drizzle-orm/pg-core");

// users table
const users = pgTable("users", {
    id: uuid("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("passwordHash"),
    name: text("name"),
    imageUrl: text("imageUrl"),
    provider: text("provider").notNull().default("local"),
    providerId: text("providerId"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
});

// sessions table
const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey(),
    userId: uuid("userId").notNull(),
    token: text("token").notNull(),
    userAgent: text("userAgent"),
    ipAddress: text("ipAddress"),
    deviceType: text("deviceType"),
    browser: text("browser"),
    os: text("os"),
    location: text("location"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "date" })
      .notNull()
});

module.exports = { users, sessions };