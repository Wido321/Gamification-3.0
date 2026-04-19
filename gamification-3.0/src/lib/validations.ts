import { z } from 'zod'

// ─── Enums matching Supabase DB ──────────────────────────────────────────────

export const DifficultySchema = z.enum(['easy', 'normal', 'hard'])
export const PerformanceSchema = z.enum(['wrong', 'partial', 'correct', 'excellent'])
export const UserRoleSchema = z.enum(['teacher', 'student', 'dev'])

export type Difficulty = z.infer<typeof DifficultySchema>
export type Performance = z.infer<typeof PerformanceSchema>
export type UserRole = z.infer<typeof UserRoleSchema>

// ─── XP constants (mirrors SQL compute_xp function) ─────────────────────────

export const XP_BASE: Record<Difficulty, number> = {
  easy: 10,
  normal: 20,
  hard: 35,
}

export const XP_MULTIPLIER: Record<Performance, number> = {
  wrong: 0,
  partial: 0.5,
  correct: 1.0,
  excellent: 1.25,
}

export const RANK_THRESHOLDS = [
  { rank: 'Master',     xp: 500 },
  { rank: 'Expert',     xp: 350 },
  { rank: 'Scholar',    xp: 220 },
  { rank: 'Student',    xp: 120 },
  { rank: 'Apprentice', xp: 50  },
  { rank: 'Novice',     xp: 0   },
] as const

export function computeRank(xp: number): string {
  return RANK_THRESHOLDS.find((t) => xp >= t.xp)?.rank ?? 'Novice'
}

export function computeXP(difficulty: Difficulty, result: Performance): number {
  return Math.floor(XP_BASE[difficulty] * XP_MULTIPLIER[result])
}

// ─── Award XP Schema (Teacher-submitted evaluation) ─────────────────────────

export const AwardXPSchema = z.object({
  student_id:  z.string().uuid({ message: 'Invalid student ID' }),
  difficulty:  DifficultySchema,
  result:      PerformanceSchema,
  feedback:    z.string().max(1000).optional(),
  score:       z.number().int().min(0).max(100).optional(),
})

export type AwardXPInput = z.infer<typeof AwardXPSchema>

// ─── Dice Roll Schema ────────────────────────────────────────────────────────

export const DiceRollSchema = z.object({
  student_id:   z.string().uuid(),
  dice_result:  z.number().int().min(1).max(20),
  action_type:  z.string().min(1).max(100),
})

export type DiceRollInput = z.infer<typeof DiceRollSchema>

// ─── User Profile Update Schema (teachers only, limited fields) ───────────────

export const UpdateUserSchema = z.object({
  student_id: z.string().uuid(),
  full_name:  z.string().min(1).max(100).optional(),
  role:       UserRoleSchema.optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
