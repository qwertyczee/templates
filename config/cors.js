const { env } = require("./env");

const whitelist = new Set([
    env.frontendUrl,
    ...env.corsOrigins.map((o) => o.trim())
]);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow non-browser clients
        if (whitelist.has(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

module.exports = { corsOptions };