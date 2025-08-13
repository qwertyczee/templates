const posthog = require('../config/posthog');
const { logger } = require('../utils/logger');

const posthogMiddleware = (req, res, next) => {
    res.on('finish', async () => {
        try {
            await posthog.flush();
        } catch (error) {
            logger.error('Failed to flush PostHog events:', error);
        }
    });

    next();
};

module.exports = posthogMiddleware;