import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'
import {
  hashPassword,
  verifyPassword,
  generateToken,
  getSessionCookieOptions,
} from '../utils/security.js'
import { env } from '../config/env.js'
import { RegisterSchema, LoginSchema } from '../validators/index.js'

export async function register(req: AuthenticatedRequest, res: Response) {
  const data = RegisterSchema.parse(req.body)

  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  })

  if (existing) {
    res.status(409).json({
      error: 'AccountExists',
      message: 'An account with this email already exists. Please sign in.',
    })
    return
  }

  const passwordHash = await hashPassword(data.password)
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      displayName: data.displayName,
      preferredLanguage: data.preferredLanguage,
    },
  })

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  res.cookie(env.SESSION_COOKIE_NAME, token, getSessionCookieOptions())

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      preferredLanguage: user.preferredLanguage,
    },
  })
}

export async function login(req: AuthenticatedRequest, res: Response) {
  const data = LoginSchema.parse(req.body)

  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  })

  if (!user) {
    res.status(401).json({
      error: 'InvalidCredentials',
      message: 'Incorrect email or password.',
    })
    return
  }

  const isValid = await verifyPassword(data.password, user.passwordHash)
  if (!isValid) {
    res.status(401).json({
      error: 'InvalidCredentials',
      message: 'Incorrect email or password.',
    })
    return
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  res.cookie(env.SESSION_COOKIE_NAME, token, getSessionCookieOptions())

  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      preferredLanguage: user.preferredLanguage,
    },
  })
}

export async function logout(_req: AuthenticatedRequest, res: Response) {
  res.clearCookie(env.SESSION_COOKIE_NAME, {
    path: '/',
    domain: env.COOKIE_DOMAIN,
  })
  res.json({ message: 'Signed out peacefully.' })
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      preferredLanguage: true,
      createdAt: true,
    },
  })

  if (!user) {
    res.status(404).json({ error: 'UserNotFound' })
    return
  }

  res.json({ user })
}
