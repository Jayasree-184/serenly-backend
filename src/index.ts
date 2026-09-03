import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { privacyLogger } from './middleware/privacyLogger.js'
import { globalErrorHandler } from './middleware/errorHandler.js'

const app = express()

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed by client Vite dev & prod headers
    crossOriginEmbedderPolicy: false,
  })
)

// CORS Configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Request Limits & Parsing
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())

// Rate Limiting (Gentle protective threshold)
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Taking too many actions quickly. Please pause and take a gentle breath.',
  },
})
app.use('/api', generalLimiter)

// Privacy-Preserving Logger
app.use(privacyLogger)

// Main API Router
app.use('/api/v1', apiRouter)

// Global Error Handler
app.use(globalErrorHandler)

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`🌿 Serenly Sanctuary API active on http://localhost:${env.PORT}`)
  })
}

export default app
