import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { CookieOptions } from 'express'
import { env } from '../config/env.js'

const BCRYPT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function getSessionCookieOptions(): CookieOptions {
  const isCrossSite = env.COOKIE_SECURE // true in production (Render+Vercel), false in local dev
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: isCrossSite ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: env.COOKIE_DOMAIN,
    path: '/',
  }
}
