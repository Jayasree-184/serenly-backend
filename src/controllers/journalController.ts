import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'
import { JournalEntrySchema } from '../validators/index.js'

export async function getJournals(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const limit = Math.min(Number(req.query.limit) || 20, 50)

  // Omit full body from summaries to protect bandwidth & privacy
  const journals = await prisma.journalEntry.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      prompt: true,
      tags: true,
      wordCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  res.json({ journals })
}

export async function getJournalById(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const id = String(req.params.id)

  const entry = await prisma.journalEntry.findUnique({
    where: { id },
  })

  // Critical security barrier: User A cannot read User B's journal
  if (!entry || entry.userId !== userId) {
    res.status(404).json({
      error: 'NotFound',
      message: 'Journal entry not found in your sanctuary.',
    })
    return
  }

  res.json({ entry })
}

export async function createJournal(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const data = JournalEntrySchema.parse(req.body)

  const wordCount = data.content.trim().split(/\s+/).length

  const entry = await prisma.journalEntry.create({
    data: {
      userId,
      title: data.title || 'Gentle Reflection',
      content: data.content,
      prompt: data.prompt,
      tags: data.tags,
      wordCount,
    },
  })

  res.status(201).json({ entry })
}

export async function updateJournal(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const id = String(req.params.id)
  const data = JournalEntrySchema.parse(req.body)

  const existing = await prisma.journalEntry.findUnique({
    where: { id },
  })

  if (!existing || existing.userId !== userId) {
    res.status(404).json({
      error: 'NotFound',
      message: 'Journal entry not found in your sanctuary.',
    })
    return
  }

  const wordCount = data.content.trim().split(/\s+/).length

  const updated = await prisma.journalEntry.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      prompt: data.prompt,
      tags: data.tags,
      wordCount,
    },
  })

  res.json({ entry: updated })
}

export async function deleteJournal(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const id = String(req.params.id)

  const existing = await prisma.journalEntry.findUnique({
    where: { id },
  })

  if (!existing || existing.userId !== userId) {
    res.status(404).json({
      error: 'NotFound',
      message: 'Journal entry not found in your sanctuary.',
    })
    return
  }

  await prisma.journalEntry.delete({
    where: { id },
  })

  res.json({ message: 'Journal entry erased gently.' })
}
