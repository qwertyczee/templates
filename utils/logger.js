const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');
const { Axiom } = require('@axiomhq/js');
/* const { sendTemplatedEmail } = require('./email'); */

const axiom = new Axiom({
    token: process.env.AXIOM_TOKEN,
});
const axiom_dataset = process.env.AXIOM_DATASET;

// Store for batching logs per request
const requestLogs = new Map();

// Email notification settings
let lastErrorEmailTime = 0;
const errorEmailCooldown = 5 * 60 * 1000;

// Email validation function
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/* // Process and validate admin emails
const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS ?
    process.env.ADMIN_NOTIFICATION_EMAILS.split(',')
        .map(email => email.trim())
        .filter(email => email && isValidEmail(email)) :
    [];

// Log invalid emails for debugging
if (process.env.ADMIN_NOTIFICATION_EMAILS) {
    const allEmails = process.env.ADMIN_NOTIFICATION_EMAILS.split(',').map(email => email.trim());
    const invalidEmails = allEmails.filter(email => email && !isValidEmail(email));
    if (invalidEmails.length > 0) {
        console.warn('Invalid admin email addresses found and ignored:', invalidEmails);
    }
} */

// Custom Axiom transport for Winston
class AxiomTransport extends winston.Transport {
    constructor(options = {}) {
        super(options);
        this.name = 'axiom';
        this.dataset = axiom_dataset;
    }

    async log(info, callback) {
        const { timestamp, level, message, requestId, ...rest } = info;
        const meta = rest.metadata ?? rest;
        const logEntry = { timestamp, level, message, requestId, ...meta };
        try {
            await axiom.ingest(this.dataset, [logEntry]);
            await axiom.flush();
        } catch (err) {
            console.error('Axiom ingest error:', err);
        }
        if (callback) {
            setImmediate(callback);
        }
        return true;
    }
}

// Function to flush logs for a specific request
const flushRequestLogs = async (requestId) => {
    if (!requestLogs.has(requestId)) {
        return;
    }

    const logs = requestLogs.get(requestId);
    if (logs.length > 0) {
        try {
            await axiom.ingest(axiom_dataset, logs);
            await axiom.flush();
        } catch (error) {
            console.error('Failed to flush logs to Axiom:', error);
        }
    }
    
    // Clean up the request logs
    requestLogs.delete(requestId);
};

// Function to flush all pending logs (for global logs without request ID)
const flushAllLogs = async () => {
    const globalLogs = requestLogs.get('global');
    if (globalLogs && globalLogs.length > 0) {
        try {
            await axiom.ingest(axiom_dataset, globalLogs);
            await axiom.flush();
            requestLogs.delete('global');
        } catch (error) {
            console.error('Failed to flush global logs to Axiom:', error);
        }
    }
};

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
        const requestInfo = requestId ? `[${requestId}] ` : '';
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} ${level.toUpperCase()}: ${requestInfo}${message} ${metaStr}`;
    })
);

// Initialize transports array
const transports = [];

if (process.env.NODE_ENV === 'production') {
    transports.push(new AxiomTransport({
        format: logFormat
    }));
} else {
    transports.push(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            logFormat
        )
    }));
}

// Only add file transports in non-serverless environments
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
    // Ensure logs directory exists
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    // Configure file transport with rotation
    const fileRotateTransport = new DailyRotateFile({
        filename: path.join(logDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d', // Keep logs for 14 days
        maxSize: '20m',  // Rotate when file reaches 20MB
        zippedArchive: true,
        level: 'info'
    });

    // Configure error file transport with rotation
    const errorFileRotateTransport = new DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d', // Keep error logs for 30 days
        maxSize: '20m',
        zippedArchive: true,
        level: 'error'
    });

    // Add file transports
    transports.push(fileRotateTransport, errorFileRotateTransport);
}

// Create Winston logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports,
    // Don't exit on uncaught exceptions
    exitOnError: false
});

/**
 * Send error notification email
 */
/* const sendErrorNotification = async (message, meta = {}) => {
    if (adminEmails.length === 0) {
        console.warn('No valid admin emails configured for error notifications. Set ADMIN_NOTIFICATION_EMAILS environment variable.');
        return;
    }

    const now = Date.now();
    const timeSinceLastEmail = now - lastErrorEmailTime;
    
    // Check cooldown period
    if (timeSinceLastEmail < errorEmailCooldown) {
        return;
    }

    try {
        lastErrorEmailTime = now;

        const errorInfo = {
            timestamp: new Date().toISOString(),
            message,
            meta,
            stack: meta.stack || (new Error().stack),
            requestId: meta.requestId,
            userId: meta.userId,
            path: meta.path,
            serverInfo: {
                environment: process.env.NODE_ENV || 'unknown',
                timestamp: new Date().toISOString(),
                hostname: process.env.HOSTNAME || 'unknown'
            }
        };

        // Send notification to all admin emails
        const emailPromises = adminEmails.map(email =>
            sendTemplatedEmail({
                to: email,
                subject: `🚨 VerbalisAI Error Alert - ${message}`,
                template: 'system/error-notification',
                variables: {
                    totalErrors: 1,
                    errors: [errorInfo],
                    serverInfo: errorInfo.serverInfo
                }
            }).catch(err => {
                console.error(`Failed to send error notification to ${email}:`, err.message);
                return null;
            })
        );

        const results = await Promise.all(emailPromises);
        const successCount = results.filter(result => result !== null).length;
        
        // Use console.log to avoid infinite loop
        console.log(`Error notification email sent successfully to ${successCount}/${adminEmails.length} admin(s)`);

    } catch (emailError) {
        // Use console.error to avoid infinite loop
        console.error('Failed to send error notification email:', emailError.message);
    }
}; */

// Override logger.error to send email notifications
const originalError = logger.error.bind(logger);
logger.error = (message, meta = {}) => {
    // Call original error method first
    originalError(message, meta);
    
    /* // Send email notification (async, don't wait)
    sendErrorNotification(message, meta).catch(err => {
        console.error('Error in sendErrorNotification:', err.message);
    }); */
};

// Middleware to automatically flush logs when request ends
const createLogFlushMiddleware = () => {
    return (req, res, next) => {
        const requestId = req.id || req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        req.requestId = requestId;
        req.log = logger.requestContext(requestId);

        res.on('finish', () => {
            flushRequestLogs(requestId).catch(err => console.error(err));
        });
        next();
    };
};

// Enhanced logger with request context that uses the request ID from middleware
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

// In serverless environments, we don't want to exit the process
const shouldExitOnError = process.env.NODE_ENV !== 'production';

// Log unhandled exceptions and rejections
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, { 
        stack: error.stack,
        name: error.name
    });
    
    // Only exit in non-serverless environments
    if (shouldExitOnError) {
        // Give logger time to write log before exiting
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', { 
        reason,
        stack: reason.stack
    });
    
    // Only exit in non-serverless environments
    if (shouldExitOnError) {
        // Give logger time to write log before exiting
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
});

// Graceful shutdown - flush all remaining logs
const gracefulShutdown = async () => {
    // Flush all remaining request logs
    const flushPromises = Array.from(requestLogs.keys()).map(requestId => 
        flushRequestLogs(requestId)
    );
    await Promise.all(flushPromises);
    await flushAllLogs();
};

// Handle process termination
process.on('SIGTERM', async () => {
    await gracefulShutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await gracefulShutdown();
    process.exit(0);
});

module.exports = {
    logger,
    logFlushMiddleware: createLogFlushMiddleware(),
    flushRequestLogs,
    flushAllLogs,
    gracefulShutdown
};