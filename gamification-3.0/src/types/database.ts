export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole        = 'teacher' | 'student' | 'dev'
export type DifficultyLevel = 'easy'    | 'normal'  | 'hard'
export type PerformanceResult = 'wrong' | 'partial' | 'correct' | 'excellent'

// ─── Table type helpers ───────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id:               string
          role:             UserRole
          full_name:        string
          xp:               number
          aura_points:      number
          rank:             string
          selection_weight: number
          created_at:       string
        }
        Insert: {
          id:               string
          role?:            UserRole
          full_name?:       string
          xp?:              number
          aura_points?:     number
          rank?:            string
          selection_weight?: number
          created_at?:      string
        }
        Update: {
          // NOTE: xp, aura_points, rank are intentionally excluded —
          // they can only be modified via the award_xp RPC.
          full_name?:       string
          selection_weight?: number
        }
      }
      responses: {
        Row: {
          id:               string
          student_id:       string
          difficulty:       DifficultyLevel
          result:           PerformanceResult
          evaluation_score: number
          xp_awarded:       number
          aura_awarded:     number
          feedback:         string | null
          created_at:       string
        }
        Insert: {
          id?:              string
          student_id:       string
          difficulty:       DifficultyLevel
          result:           PerformanceResult
          evaluation_score: number
          xp_awarded:       number
          aura_awarded?:    number
          feedback?:        string | null
          created_at?:      string
        }
        Update: never  // Responses are immutable audit logs
      }
      dice_history: {
        Row: {
          id:          string
          student_id:  string
          dice_result: number
          action_type: string
          created_at:  string
        }
        Insert: {
          id?:         string
          student_id:  string
          dice_result: number
          action_type: string
          created_at?: string
        }
        Update: never  // Dice history is an immutable audit log
      }
      missions: {
        Row: {
          id:           string
          title:        string
          description:  string | null
          reward_xp:    number
          requirements: Json | null
          is_active:    boolean
          expires_at:   string | null
        }
        Insert: {
          id?:          string
          title:        string
          description?: string | null
          reward_xp:    number
          requirements?: Json | null
          is_active?:   boolean
          expires_at?:  string | null
        }
        Update: {
          title?:        string
          description?:  string | null
          reward_xp?:    number
          requirements?: Json | null
          is_active?:    boolean
          expires_at?:   string | null
        }
      }
      inventory: {
        Row: {
          id:         string
          student_id: string
          item_id:    string
          quantity:   number
        }
        Insert: {
          id?:        string
          student_id: string
          item_id:    string
          quantity?:  number
        }
        Update: {
          quantity?: number
        }
      }
    }

    Functions: {
      award_xp: {
        Args: {
          p_student_id: string
          p_difficulty: DifficultyLevel
          p_result:     PerformanceResult
          p_feedback?:  string
          p_score?:     number
        }
        Returns: {
          response_id: string
          xp_gained:   number
          aura_gained: number
          new_xp:      number
          new_rank:    string
          ranked_up:   boolean
          old_rank:    string
        }
      }
      compute_xp: {
        Args: {
          p_difficulty: DifficultyLevel
          p_result:     PerformanceResult
        }
        Returns: number
      }
      compute_rank: {
        Args: { p_xp: number }
        Returns: string
      }
    }
  }
}

// ─── Convenience row types ────────────────────────────────────────────────────

export type UserRow       = Database['public']['Tables']['users']['Row']
export type ResponseRow   = Database['public']['Tables']['responses']['Row']
export type DiceHistoryRow= Database['public']['Tables']['dice_history']['Row']
export type MissionRow    = Database['public']['Tables']['missions']['Row']
export type InventoryRow  = Database['public']['Tables']['inventory']['Row']
export type AwardXPResult = Database['public']['Functions']['award_xp']['Returns']
