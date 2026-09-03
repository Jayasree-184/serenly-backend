const SENSITIVE_FIELDS = new Set([
    'content',
    'note',
    'body',
    'password',
    'warningSigns',
    'copingStrategies',
    'instructions',
]);
export function privacyLogger(req, res, next) {
    const start = Date.now();
    // Hook into response completion
    res.on('finish', () => {
        const duration = Date.now() - start;
        // Safe diagnostic log omitting sensitive payload bodies
        console.log(`[SERENLY] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
}
export function sanitizeLoggingPayload(obj) {
    const copy = {};
    for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_FIELDS.has(key)) {
            copy[key] = '[REDACTED_FOR_PRIVACY]';
        }
        else {
            copy[key] = value;
        }
    }
    return copy;
}
