import { create } from 'zustand'
import type { UserRole } from '@/types/database'

interface UserProfile {
  id: string
  role: UserRole
  full_name: string
  xp: number
  rank: string
  selection_weight: number
}

interface UserStore {
  profile: UserProfile | null
  isLoading: boolean
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  updateXP: (xp: number, rank: string) => void
  reset: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  isLoading: true,

  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),

  updateXP: (xp, rank) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, xp, rank } : null,
    })),

  reset: () => set({ profile: null, isLoading: false }),
}))
