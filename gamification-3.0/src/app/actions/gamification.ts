'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Action: Get the current user's own profile ───────────────────────────────

export type ProfileResponse = {
  success: boolean;
  error?: string;
  data?: any;
}

export async function getMyProfileAction(): Promise<ProfileResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, xp, aura_points, rank, role, selection_weight, created_at')
    .eq('id', user.id)
    .single()

  if (error || !data) return { success: false, error: 'Profile not found' }
  return { success: true, data }
}

// ─── Action: Get the student's own response history ──────────────────────────

export async function getMyResponsesAction(): Promise<ProfileResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('responses')
    .select('id, difficulty, result, evaluation_score, xp_awarded, aura_awarded, feedback, created_at')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { success: false, error: 'Failed to fetch history.' }
  return { success: true, data: data ?? [] }
}

// ─── Action: Get the student's inventory ────────────────────────────────────

export async function getMyInventoryAction(): Promise<ProfileResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('inventory')
    .select('id, item_id, quantity')
    .eq('student_id', user.id)

  if (error) return { success: false, error: 'Failed to fetch inventory.' }
  return { success: true, data: data ?? [] }
}

// ─── Action: Get all active missions ─────────────────────────────────────────

export async function getActiveMissionsAction(): Promise<ProfileResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('missions')
    .select('id, title, description, reward_xp, requirements')
    .eq('is_active', true)
    .order('reward_xp', { ascending: false })

  if (error) return { success: false, error: 'Failed to fetch missions.' }
  return { success: true, data: data ?? [] }
}

// ─── Action: Get the Leaderboard ──────────────────────────────────────────────

export async function getLeaderboardAction(): Promise<ProfileResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  // Fetch only students, ordered by XP descending
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, xp, aura_points, rank')
    .eq('role', 'student')
    .order('xp', { ascending: false })
    .limit(100)

  if (error) return { success: false, error: 'Failed to fetch leaderboard.' }
  return { success: true, data: data ?? [] }
}

// ─── Action: Sign out ────────────────────────────────────────────────────────

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
