import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'
import { SafetyPlanSchema } from '../validators/index.js'

export async function getSafetyPlan(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId

  const plan = await prisma.safetyPlan.findUnique({
    where: { userId },
    include: {
      trustedContacts: true,
    },
  })

  res.json({ plan })
}

export async function upsertSafetyPlan(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const data = SafetyPlanSchema.parse(req.body)

  const plan = await prisma.safetyPlan.upsert({
    where: { userId },
    create: {
      userId,
      warningSigns: data.warningSigns,
      copingStrategies: data.copingStrategies,
      safeEnvironments: data.safeEnvironments,
      professionalContacts: data.professionalContacts,
      trustedContacts: {
        create: data.trustedContacts.map((c) => ({
          name: c.name,
          relationship: c.relationship,
          phoneNumber: c.phoneNumber,
        })),
      },
    },
    update: {
      warningSigns: data.warningSigns,
      copingStrategies: data.copingStrategies,
      safeEnvironments: data.safeEnvironments,
      professionalContacts: data.professionalContacts,
    },
    include: {
      trustedContacts: true,
    },
  })

  res.json({ plan })
}

export async function getCrisisResources(_req: AuthenticatedRequest, res: Response) {
  res.json({
    hotlines: [
      {
        region: 'Global / USA',
        name: '988 Suicide & Crisis Lifeline',
        number: '988',
        available: '24/7 Free & Confidential',
      },
      {
        region: 'India',
        name: 'KIRAN Mental Health Helpline',
        number: '1800-599-0019',
        available: '24/7 Support in 13 Indian Languages',
      },
      {
        region: 'Chennai / Tamil Nadu',
        name: 'Sneha India Helpline',
        number: '044-24640050',
        available: '24/7 Emotional Support in Tamil & English',
      },
    ],
  })
}
