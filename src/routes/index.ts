import { Router } from 'express'
import { register, login, logout, getMe } from '../controllers/authController.js'
import { getMoods, createMood, getMoodSummary } from '../controllers/moodController.js'
import {
  getJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
} from '../controllers/journalController.js'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goalsController.js'
import {
  getMedications,
  createMedication,
  deleteMedication,
} from '../controllers/medicationController.js'
import {
  getPosts,
  createPost,
  deletePost,
  reportPost,
} from '../controllers/communityController.js'
import {
  getSafetyPlan,
  upsertSafetyPlan,
  getCrisisResources,
} from '../controllers/safetyController.js'
import { importLegacyLocalStorage } from '../controllers/migrationController.js'
import { requireAuth } from '../middleware/auth.js'

export const apiRouter = Router()

// Health Check
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'healthy', app: 'Serenly Sanctuary API', version: '2.0.0' })
})

// Authentication
apiRouter.post('/auth/register', register)
apiRouter.post('/auth/login', login)
apiRouter.post('/auth/logout', logout)
apiRouter.get('/auth/me', requireAuth, getMe)

// Mood Tracking
apiRouter.get('/moods', requireAuth, getMoods)
apiRouter.post('/moods', requireAuth, createMood)
apiRouter.get('/moods/summary', requireAuth, getMoodSummary)

// Private Journals (Owner Protected)
apiRouter.get('/journals', requireAuth, getJournals)
apiRouter.get('/journals/:id', requireAuth, getJournalById)
apiRouter.post('/journals', requireAuth, createJournal)
apiRouter.put('/journals/:id', requireAuth, updateJournal)
apiRouter.delete('/journals/:id', requireAuth, deleteJournal)

// Gentle Goals
apiRouter.get('/goals', requireAuth, getGoals)
apiRouter.post('/goals', requireAuth, createGoal)
apiRouter.patch('/goals/:id', requireAuth, updateGoal)
apiRouter.delete('/goals/:id', requireAuth, deleteGoal)

// Medication Reminders
apiRouter.get('/medications', requireAuth, getMedications)
apiRouter.post('/medications', requireAuth, createMedication)
apiRouter.delete('/medications/:id', requireAuth, deleteMedication)

// Supportive Community
apiRouter.get('/community/posts', getPosts)
apiRouter.post('/community/posts', requireAuth, createPost)
apiRouter.delete('/community/posts/:id', requireAuth, deletePost)
apiRouter.post('/community/reports', requireAuth, reportPost)

// Safety Anchor & Crisis
apiRouter.get('/safety/crisis-resources', getCrisisResources)
apiRouter.get('/safety/plan', requireAuth, getSafetyPlan)
apiRouter.put('/safety/plan', requireAuth, upsertSafetyPlan)

// Local Storage Importer
apiRouter.post('/migration/import-local', requireAuth, importLegacyLocalStorage)
