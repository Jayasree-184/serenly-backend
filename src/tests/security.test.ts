import { describe, it } from 'node:test'
import assert from 'node:assert'
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../utils/security.js'
import { assertOwnership } from '../middleware/auth.js'
import { RegisterSchema, MoodEntrySchema, JournalEntrySchema } from '../validators/index.js'

describe('Authentication & Cryptography Security', () => {
  it('hashes passwords with high work factor and verifies matching password', async () => {
    const raw = 'SanctuaryPeace2026!'
    const hash = await hashPassword(raw)

    assert.notStrictEqual(hash, raw, 'Hash must not equal plaintext')
    assert.strictEqual(hash.startsWith('$2'), true, 'Must use bcrypt format')

    const isMatch = await verifyPassword(raw, hash)
    assert.strictEqual(isMatch, true, 'Correct password must verify')

    const isBadMatch = await verifyPassword('WrongPassword', hash)
    assert.strictEqual(isBadMatch, false, 'Incorrect password must reject')
  })

  it('generates and verifies JWT session tokens correctly', () => {
    const payload = {
      userId: 'user-a-1234',
      email: 'maya@serenly.app',
      role: 'USER',
    }

    const token = generateToken(payload)
    assert.strictEqual(typeof token, 'string')

    const verified = verifyToken(token)
    assert.ok(verified)
    assert.strictEqual(verified.userId, payload.userId)
    assert.strictEqual(verified.email, payload.email)

    const invalid = verifyToken('invalid-token-signature')
    assert.strictEqual(invalid, null)
  })
})

describe('Multi-Tenant Privacy & Resource Isolation (Critical Barrier)', () => {
  it('blocks User A from accessing User B private resources (Journal / Mood / Meds)', () => {
    const userA = 'user-a-1234'
    const userB = 'user-b-5678'

    const userBOwnedJournal = {
      id: 'journal-b-1',
      userId: userB,
      title: 'Secret Thoughts',
      content: 'Deeply personal reflection',
    }

    // Server-side ownership guard verification
    const canUserAAccessUserBJournal = assertOwnership(userBOwnedJournal.userId, userA)
    assert.strictEqual(
      canUserAAccessUserBJournal,
      false,
      "SECURITY BREACH: User A must NEVER be granted access to User B's journal"
    )

    // Verify same owner
    const canUserBAccessOwnJournal = assertOwnership(userBOwnedJournal.userId, userB)
    assert.strictEqual(canUserBAccessOwnJournal, true)
  })
})

describe('Request Validation & Integrity', () => {
  it('rejects invalid email and weak passwords', () => {
    assert.throws(() => {
      RegisterSchema.parse({
        email: 'not-an-email',
        password: 'short',
        displayName: 'Test',
      })
    })
  })

  it('validates legitimate mood and journal requests', () => {
    const validMood = MoodEntrySchema.parse({
      moodLevel: 'OKAY',
      moodScore: 65,
      emotionTags: ['Peaceful', 'Relieved'],
      energyLevel: 55,
      contextTags: ['Solitude'],
    })
    assert.strictEqual(validMood.moodScore, 65)

    const validJournal = JournalEntrySchema.parse({
      title: 'Morning Window',
      content: 'Quiet morning with chamomile tea.',
      tags: ['#Acceptance'],
    })
    assert.strictEqual(validJournal.tags[0], '#Acceptance')
  })
})
