import dotenv from 'dotenv'

dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'serenly-sanctuary-fallback-secret-key-32-chars',
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || 'serenly_session',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
  AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
}
