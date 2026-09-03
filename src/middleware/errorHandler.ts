import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function globalErrorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Handle Zod validation errors gently
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Some information was incomplete or formatted incorrectly.',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    })
    return
  }

  // Handle Unauthorized / Forbidden
  if (err.status === 403 || err.statusCode === 403) {
    res.status(403).json({
      error: 'AccessDenied',
      message: 'This record belongs to another sanctuary and cannot be viewed.',
    })
    return
  }

  // Handle Generic / Database Errors safely without exposing internals
  console.error('[SERENLY_INTERNAL_ERROR]', err.message || err)

  res.status(err.status || err.statusCode || 500).json({
    error: 'InternalError',
    message: "Something didn't save. Please try again gently.",
  })
}
