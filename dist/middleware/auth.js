import { env } from '../config/env.js';
import { verifyToken } from '../utils/security.js';
export function requireAuth(req, res, next) {
    // Read from HTTP-only cookie first, fallback to Authorization header
    const token = req.cookies?.[env.SESSION_COOKIE_NAME] ||
        req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
        res.status(401).json({
            error: 'AuthenticationRequired',
            message: 'Your session has expired. Please sign in to access your sanctuary.',
        });
        return;
    }
    const payload = verifyToken(token);
    if (!payload) {
        res.status(401).json({
            error: 'InvalidSession',
            message: 'Your session is invalid or has expired. Please sign in again.',
        });
        return;
    }
    req.user = payload;
    next();
}
export function assertOwnership(resourceUserId, currentUserId) {
    return resourceUserId === currentUserId;
}
