const posthog = require("../config/posthog");

function capture(event, distinctId, properties = {}) {
    if (!posthog) return;
    try {
        posthog.capture({
            distinctId: String(distinctId || "anonymous"),
            event,
            properties
        });
    } catch (_) {
        // ignore
    }
}

module.exports = { posthog, capture };