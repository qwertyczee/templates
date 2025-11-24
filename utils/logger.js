const winston = require('winston');

// Define log format with colors
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
        const requestInfo = requestId ? `[${requestId}] ` : '';
        const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level.toUpperCase()}: ${requestInfo}${message}${metaStr}`;
    })
);

// Create Winston logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        })
    ],
    exitOnError: false
});

// Enhanced logger with request context
logger.requestContext = (requestId) => {
    return {
        info: (message, meta = {}) => {
            logger.info(message, { requestId, ...meta });
        },
        error: (message, meta = {}) => {
            logger.error(message, { requestId, ...meta });
        },
        warn: (message, meta = {}) => {
            logger.warn(message, { requestId, ...meta });
        },
        debug: (message, meta = {}) => {
            logger.debug(message, { requestId, ...meta });
        }
    };
};

// Middleware to attach logger to request
const createLogFlushMiddleware = () => {
    return (req, res, next) => {
        const requestId = req.id || req.headers['x-request-id'] || 
            `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        req.requestId = requestId;
        req.log = logger.requestContext(requestId);
        next();
    };
};

// Handle unhandled exceptions
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, { 
        stack: error.stack,
        name: error.name
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { 
        reason: reason?.message || reason,
        stack: reason?.stack
    });
});

module.exports = {
    logger,
    logFlushMiddleware: createLogFlushMiddleware()
};