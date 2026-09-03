import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'
import { MoodEntrySchema } from '../validators/index.js'

export async function getMoods(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const limit = Math.min(Number(req.query.limit) || 20, 100)

  const moods = await prisma.moodEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  res.json({ moods })
}

export async function createMood(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const data = MoodEntrySchema.parse(req.body)

  const entry = await prisma.moodEntry.create({
    data: {
      userId,
      moodLevel: data.moodLevel,
      moodScore: data.moodScore,
      emotionTags: data.emotionTags,
      energyLevel: data.energyLevel,
      sleepQuality: data.sleepQuality,
      contextTags: data.contextTags,
      note: data.note,
    },
  })

  res.status(201).json({ entry })
}

export async function getMoodSummary(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentMoods = await prisma.moodEntry.findMany({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: 'asc' },
  })

  const checkInsThisWeek = recentMoods.length

  res.json({
    checkInsThisWeek,
    recentMoods,
    weeklyArc: recentMoods.map((m) => ({
      score: m.moodScore,
      date: m.createdAt.toISOString().split('T')[0],
    })),
  })
}
