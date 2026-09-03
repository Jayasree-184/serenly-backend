import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'

export async function importLegacyLocalStorage(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const { journals = [], moods = [], goals = [], meds = [] } = req.body

  let importedJournals = 0
  let importedMoods = 0
  let importedGoals = 0
  let importedMeds = 0

  // 1. Batch import journals
  if (Array.isArray(journals) && journals.length > 0) {
    for (const j of journals) {
      if (j.text) {
        await prisma.journalEntry.create({
          data: {
            userId,
            title: 'Imported Reflection',
            content: j.text,
            createdAt: j.ts ? new Date(j.ts) : new Date(),
            wordCount: j.text.split(/\s+/).length,
          },
        })
        importedJournals++
      }
    }
  }

  // 2. Batch import moods
  if (Array.isArray(moods) && moods.length > 0) {
    for (const m of moods) {
      const score = Number(m.score) || 50
      let moodLevel: 'VERY_LOW' | 'LOW' | 'OKAY' | 'GOOD' | 'GREAT' = 'OKAY'
      if (score <= 25) moodLevel = 'VERY_LOW'
      else if (score <= 45) moodLevel = 'LOW'
      else if (score <= 65) moodLevel = 'OKAY'
      else if (score <= 80) moodLevel = 'GOOD'
      else moodLevel = 'GREAT'

      await prisma.moodEntry.create({
        data: {
          userId,
          moodLevel,
          moodScore: score,
          energyLevel: 50,
          note: m.note || null,
          createdAt: m.ts ? new Date(m.ts) : new Date(),
        },
      })
      importedMoods++
    }
  }

  // 3. Batch import goals
  if (Array.isArray(goals) && goals.length > 0) {
    for (const g of goals) {
      if (g.text) {
        await prisma.goal.create({
          data: {
            userId,
            text: g.text,
            isCompleted: Boolean(g.done),
          },
        })
        importedGoals++
      }
    }
  }

  // 4. Batch import meds
  if (Array.isArray(meds) && meds.length > 0) {
    for (const med of meds) {
      if (med.name) {
        await prisma.medication.create({
          data: {
            userId,
            name: med.name,
            timeOfDay: med.time || '08:00',
          },
        })
        importedMeds++
      }
    }
  }

  res.json({
    message: 'Legacy records imported safely.',
    imported: {
      journals: importedJournals,
      moods: importedMoods,
      goals: importedGoals,
      medications: importedMeds,
    },
  })
}
