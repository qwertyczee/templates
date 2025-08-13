const { ZodError } = require('zod');
const { logger } = require('../utils/logger');
const errors = require('../utils/errors');

/**
 * Global error handling middleware.
 * Catches errors from previous middleware/routes and sends formatted response.
 */
function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || err.status || 500;
    let code = err.code || 'UNKNOWN_ERROR';
    let message = err.message || 'An unexpected error occurred.';
    let validationErrors = err.errors;

    // If error is one of our custom errors
    if (err instanceof errors.AppError) {
        statusCode = err.statusCode;
        code = err.constructor.name.toUpperCase();
        message = err.message;
    }
    // Handle Zod Validation Errors
    else if (err instanceof ZodError) {
        statusCode = 422;
        code = errors.ValidationError.name.toUpperCase();
        message = 'Invalid input data provided.';
        validationErrors = err.errors.reduce((acc, currentError) => {
            const path = currentError.path.join('.');
            acc[path] = currentError.message;
            return acc;
        }, {});
        logger?.warn('Validation Error', { path: req.originalUrl, method: req.method, errors: validationErrors });
    }
    // JWT Errors
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
        message = err.name === 'TokenExpiredError' ? 'Token has expired.' : 'Invalid token.';
        validationErrors = undefined;
        logger?.warn(`JWT Error: ${code}`, { path: req.originalUrl, message: err.message });
    }
    // Not Found errors
    else if (statusCode === 404) {
        err = new errors.NotFoundError(err.message);
        statusCode = err.statusCode;
        code = err.constructor.name.toUpperCase();
        message = err.message;
    }
    // Unhandled Errors
    else {
        logger?.error(`Unhandled Error: ${code}`, {
            path: req.originalUrl,
            method: req.method,
            message: err.message,
            stack: err.stack
        });
        if (process.env.NODE_ENV !== 'development') {
            err = new errors.InternalServerError();
            message = err.message;
        }
        if (statusCode === 200) statusCode = 500;
    }

    if (res.headersSent) {
        logger?.error('Error handler called after headers were sent.', { path: req.originalUrl, error: message });
        return next(err);
    }

    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        code,
        message,
        ...(validationErrors && { errors: validationErrors }),
        ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack })
    });
}

function notFoundHandler(req, res) {
    const message = `Route not found: ${req.method} ${req.originalUrl}`;
    const code = 'ROUTE_NOT_FOUND';
    logger?.warn(`404 Not Found: ${message}`);
    res.status(404).json({
        status: 'fail',
        code,
        message
    });
}

module.exports = { errorHandler, notFoundHandler };