'use server'

import { createClient } from '@/lib/supabase/server'
import { AwardXPSchema, DiceRollSchema, type AwardXPInput, type DiceRollInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

// ─── Type for server action responses ────────────────────────────────────────

type ActionResult<T = unknown> =
  | { success: true;  data: T;      error?: never }
  | { success: false; error: string; data?: never }

// ─── Guard: ensure the caller is a teacher or dev ────────────────────────────

async function assertTeacher(): Promise<{ id: string } | ActionResult<never>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized: not authenticated' }

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (error || !profile) return { success: false, error: 'Unauthorized: profile not found' }
  if (!['teacher', 'dev'].includes((profile as any).role)) {
    return { success: false, error: 'Forbidden: teacher role required' }
  }

  return { id: user.id }
}

// ─── Action: Award XP to a student (teacher only) ────────────────────────────

export async function awardXPAction(
  rawInput: AwardXPInput
): Promise<ActionResult<{
  xp_gained: number
  aura_gained: number
  new_xp: number
  new_rank: string
  ranked_up: boolean
  old_rank: string
}>> {
  // 1. Auth guard
  const caller = await assertTeacher()
  if ('error' in caller) return caller as ActionResult<never>

  // 2. Validate + sanitize input with Zod
  const parsed = AwardXPSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { student_id, difficulty, result, feedback, score } = parsed.data

  // 3. Call the secure server-side RPC (never a client-side UPDATE)
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .rpc('award_xp', {
      p_student_id: student_id,
      p_difficulty: difficulty,
      p_result:     result,
      p_feedback:   feedback ?? null,
      p_score:      score ?? 0,
    })

  if (error) {
    console.error('[awardXPAction] RPC error:', error)
    return { success: false, error: 'Failed to award XP. Please try again.' }
  }

  // 4. Revalidate pages that display student data
  revalidatePath('/dashboard')
  revalidatePath('/teacher')

  return { success: true, data: data as Parameters<typeof awardXPAction>[0] extends never ? never : typeof data }
}

// ─── Action: Record a dice roll (teacher only) ───────────────────────────────

export async function recordDiceRollAction(
  rawInput: DiceRollInput
): Promise<ActionResult<{ id: string }>> {
  const caller = await assertTeacher()
  if ('error' in caller) return caller as ActionResult<never>

  const parsed = DiceRollSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dice_history')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) {
    return { success: false, error: 'Failed to record dice roll.' }
  }

  revalidatePath('/teacher')
  return { success: true, data }
}

// ─── Action: Get all students (teacher only) ─────────────────────────────────

export async function getStudentsAction(): Promise<ActionResult<{
  id: string; full_name: string; xp: number; aura_points: number;
  rank: string; selection_weight: number; role: string
}[]>> {
  const caller = await assertTeacher()
  if ('error' in caller) return caller as ActionResult<never>

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, xp, aura_points, rank, selection_weight, role')
    .eq('role', 'student')
    .order('xp', { ascending: false })

  if (error) return { success: false, error: 'Failed to fetch students.' }
  return { success: true, data: data ?? [] }
}
