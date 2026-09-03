import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'
import { GoalSchema, UpdateGoalSchema } from '../validators/index.js'

export async function getGoals(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })

  res.json({ goals })
}

export async function createGoal(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const data = GoalSchema.parse(req.body)

  const goal = await prisma.goal.create({
    data: {
      userId,
      text: data.text,
    },
  })

  res.status(201).json({ goal })
}

export async function updateGoal(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const id = String(req.params.id)
  const data = UpdateGoalSchema.parse(req.body)

  const existing = await prisma.goal.findUnique({
    where: { id },
  })

  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'NotFound', message: 'Goal not found.' })
    return
  }

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      text: data.text,
      isCompleted: data.isCompleted,
      completedAt: data.isCompleted ? new Date() : null,
    },
  })

  res.json({ goal })
}

export async function deleteGoal(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const id = String(req.params.id)

  const existing = await prisma.goal.findUnique({
    where: { id },
  })

  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: 'NotFound', message: 'Goal not found.' })
    return
  }

  await prisma.goal.delete({ where: { id } })
  res.json({ message: 'Goal removed.' })
}
