import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserRole } from '@/types/database'

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  id:               string
  role:             UserRole
  full_name:        string
  xp:               number
  aura_points:      number
  rank:             string
  selection_weight: number
}

interface XPEvent {
  xp_gained:  number
  aura_gained: number
  new_xp:     number
  new_rank:   string
  ranked_up:  boolean
  old_rank:   string
}

interface UserStore {
  profile:       UserProfile | null
  isLoading:     boolean
  lastXPEvent:   XPEvent | null

  // Actions
  setProfile:    (profile: UserProfile | null) => void
  setLoading:    (loading: boolean) => void
  applyXPEvent:  (event: XPEvent) => void
  clearXPEvent:  () => void
  reset:         () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile:     null,
      isLoading:   true,
      lastXPEvent: null,

      setProfile: (profile) => set({ profile, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),

      // Called after a successful award_xp RPC call to update local UI immediately
      applyXPEvent: (event) =>
        set((state) => ({
          lastXPEvent: event,
          profile: state.profile
            ? { ...state.profile, xp: event.new_xp, rank: event.new_rank }
            : null,
        })),

      clearXPEvent: () => set({ lastXPEvent: null }),

      reset: () => set({ profile: null, isLoading: false, lastXPEvent: null }),
    }),
    {
      name: 'gamification-user',
      storage: createJSONStorage(() => sessionStorage), // sessionStorage: cleared on tab close
      partialize: (state) => ({ profile: state.profile }), // Only persist profile, not loading state
    }
  )
)
