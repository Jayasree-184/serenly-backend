import { z } from 'zod'

// Auth Validators
export const RegisterSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(50),
  preferredLanguage: z.enum(['en', 'ta']).default('en'),
})

export const LoginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Mood Entry Validators
export const MoodEntrySchema = z.object({
  moodLevel: z.enum(['VERY_LOW', 'LOW', 'OKAY', 'GOOD', 'GREAT']),
  moodScore: z.number().int().min(1).max(100),
  emotionTags: z.array(z.string()).default([]),
  energyLevel: z.number().int().min(0).max(100).default(50),
  sleepQuality: z.string().optional(),
  contextTags: z.array(z.string()).default([]),
  note: z.string().max(1000).optional(),
})

// Journal Entry Validators
export const JournalEntrySchema = z.object({
  title: z.string().max(150).optional(),
  content: z.string().min(1, 'Journal content cannot be empty'),
  prompt: z.string().max(200).optional(),
  tags: z.array(z.string()).default([]),
})

// Goal Validators
export const GoalSchema = z.object({
  text: z.string().min(1, 'Goal text cannot be empty').max(200),
})

export const UpdateGoalSchema = z.object({
  text: z.string().max(200).optional(),
  isCompleted: z.boolean().optional(),
})

// Medication Validators
export const MedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required').max(100),
  dose: z.string().max(50).optional(),
  timeOfDay: z.string().min(1, 'Time is required'),
  frequency: z.string().default('daily'),
  instructions: z.string().max(200).optional(),
})

// Community Post Validators
export const CommunityPostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(1000),
})

export const CommunityReportSchema = z.object({
  postId: z.string().uuid(),
  reason: z.string().min(3).max(500),
})

// Safety Plan Validators
export const SafetyPlanSchema = z.object({
  warningSigns: z.array(z.string()).default([]),
  copingStrategies: z.array(z.string()).default([]),
  safeEnvironments: z.array(z.string()).default([]),
  trustedContacts: z
    .array(
      z.object({
        name: z.string().min(1),
        relationship: z.string().optional(),
        phoneNumber: z.string().min(1),
      })
    )
    .default([]),
  professionalContacts: z.array(z.string()).default([]),
})
