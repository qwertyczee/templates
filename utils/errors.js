/**
 * Base Application Error class
 * Extends the native Error class with additional properties
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Indicates if error is operational or programming
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 400 Bad Request - Invalid request parameters
 */
class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400);
    }
}

/**
 * 401 Unauthorized - Authentication failed
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

/**
 * 403 Forbidden - No permission
 */
class ForbiddenError extends AppError {
    constructor(message = 'Access to this resource is forbidden') {
        super(message, 403);
    }
}

/**
 * 404 Not Found - Resource not found
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

/**
 * 409 Conflict - Resource already exists
 */
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}

/**
 * 422 Unprocessable Entity - Validation error
 */
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 422);
    }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429);
    }
}

/**
 * 500 Internal Server Error - Generic server error
 */
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}

/**
 * 503 Service Unavailable - Server is currently unavailable
 */
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable') {
        super(message, 503);
    }
}

/**
 * Database error wrapper
 */
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500);
    }
}

/**
 * External API error wrapper
 */
class ExternalApiError extends AppError {
    constructor(message = 'External API request failed') {
        super(message, 500);
    }
}

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    RateLimitError,
    InternalServerError,
    ServiceUnavailableError,
    DatabaseError,
    ExternalApiError
}; 