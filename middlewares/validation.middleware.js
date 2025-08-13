const { ZodError } = require('zod');
const { logger } = require('../utils/logger');

const validate = (schema) => (req, res, next) => {
    try {
        // Validate request parts if they exist in the schema
        if (schema.shape && schema.shape.params) {
            req.params = schema.shape.params.parse(req.params);
        }
        if (schema.shape && schema.shape.body) {
            req.body = schema.shape.body.parse(req.body);
        }
        if (schema.shape && schema.shape.query) {
            req.query = schema.shape.query.parse(req.query);
        }
        if (schema.shape && schema.shape.headers) {
            req.headers = schema.shape.headers.parse(req.headers);
        }
        
        // For simple schemas without shape property, validate the whole request object
        if (!schema.shape) {
            schema.parse(req);
        }
        
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            logger.warn('Validation Error:', { errors: error.errors, path: req.path });
            // Format Zod errors for a user-friendly response
            const formattedErrors = Array.isArray(error.errors)
                ? error.errors.reduce((acc, currentError) => {
                    const path = Array.isArray(currentError.path)
                        ? currentError.path.join('.')
                        : String(currentError.path || '');
                    acc[path] = currentError.message || 'Invalid value';
                    return acc;
                }, {})
                : { _: 'Invalid input data' };

            return res.status(400).json({
                status: 'error',
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data provided.',
                errors: formattedErrors,
            });
        }
        // Forward other errors
        next(error);
    }
};

module.exports = validate; 