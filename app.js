require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { corsOptions } = require("./config/cors");
const requestId = require("./middlewares/requestId");
const { logger, logFlushMiddleware } = require('./utils/logger');
const posthogMiddleware = require("./middlewares/posthog.middleware")
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth.routes");

// Init express
const app = express();
app.set("trust proxy", 1);

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(requestId);
/* app.use(logFlushMiddleware);
app.use(posthogMiddleware); */

// Health
app.get("/health", (req, res) => {
  req.log.info("health_check", { status: "ok" });
  return res.json({ ok: true, ts: Date.now() });
});

// Routes
app.use("/auth", authRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

// Local dev server
if (process.env.NODE_ENV === "development") {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    logger.info(`Server listening on http://localhost:${port}`);
  });
}