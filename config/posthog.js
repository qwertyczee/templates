const { PostHog } = require('posthog-node');
const { logger } = require('../utils/logger');
const { env } = require("./env");

// Only initialize PostHog if API key is available
let posthog = null;

if (env.posthogApiKey) {
    try {
        posthog = new PostHog(
            env.posthogApiKey,
            {
                host: env.posthogHost,
                // Add error handling and validation
                flushAt: 20, // Flush after 20 events
                flushInterval: 10000, // Flush every 10 seconds
                requestTimeout: 10000, // 10 second timeout
                // Disable in development to avoid noise
                disabled: env.nodeEnv === 'development' && !env.posthogForceEnable
            }
        );
        
        // Add error handler
        posthog.on('error', (error) => {
            logger.warn('PostHog error:', { error: error.message, stack: error.stack });
        });
        
    } catch (error) {
        logger.error('Failed to initialize PostHog:', error);
        posthog = null;
    }
} else {
    logger.warn('PostHog API key not found, analytics disabled');
}

// Create a safe wrapper that validates data before sending
const safePostHog = {
    capture: (event) => {
        if (!posthog) return;
        
        // Validate required fields
        if (!event || !event.distinctId) {
            logger.warn('PostHog: Invalid event data - missing distinctId', { event });
            return;
        }
        
        // Ensure distinctId is a string
        if (typeof event.distinctId !== 'string') {
            event.distinctId = String(event.distinctId);
        }
        
        // Validate event name
        if (!event.event || typeof event.event !== 'string') {
            logger.warn('PostHog: Invalid event data - missing or invalid event name', { event });
            return;
        }
        
        try {
            posthog.capture(event);
        } catch (error) {
            logger.warn('PostHog capture error:', { error: error.message, event });
        }
    },
    
    identify: (distinctId, properties) => {
        if (!posthog) return;
        
        if (!distinctId || typeof distinctId !== 'string') {
            logger.warn('PostHog: Invalid identify data - missing or invalid distinctId', { distinctId });
            return;
        }
        
        try {
            posthog.identify(distinctId, properties);
        } catch (error) {
            logger.warn('PostHog identify error:', { error: error.message, distinctId });
        }
    },
    
    flush: async () => {
        if (!posthog) return Promise.resolve();
        
        try {
            await posthog.flush();
        } catch (error) {
            logger.warn('PostHog flush error:', { error: error.message });
            // Don't throw the error, just log it
        }
    }
};

module.exports = safePostHog;