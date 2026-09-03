import type { Request, Response, NextFunction } from 'express'

const SENSITIVE_FIELDS = new Set([
  'content',
  'note',
  'body',
  'password',
  'warningSigns',
  'copingStrategies',
  'instructions',
])

export function privacyLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  // Hook into response completion
  res.on('finish', () => {
    const duration = Date.now() - start
    // Safe diagnostic log omitting sensitive payload bodies
    console.log(
      `[SERENLY] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    )
  })

  next()
}

export function sanitizeLoggingPayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const copy: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key)) {
      copy[key] = '[REDACTED_FOR_PRIVACY]'
    } else {
      copy[key] = value
    }
  }
  return copy
}
