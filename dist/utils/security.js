import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
const BCRYPT_ROUNDS = 12;
export async function hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function generateToken(payload) {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: '7d',
    });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    }
    catch {
        return null;
    }
}
export function getSessionCookieOptions() {
    const isCrossSite = env.COOKIE_SECURE; // true in production (Render+Vercel), false in local dev
    return {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: isCrossSite ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: env.COOKIE_DOMAIN,
        path: '/',
    };
}
