export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'teacher' | 'student' | 'dev'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: UserRole
          full_name: string
          xp: number
          rank: string
          selection_weight: number
          created_at: string
        }
        Insert: {
          id?: string
          role: UserRole
          full_name: string
          xp?: number
          rank?: string
          selection_weight?: number
          created_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string
          xp?: number
          rank?: string
          selection_weight?: number
          created_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          student_id: string
          evaluation_score: number
          xp_awarded: number
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          evaluation_score: number
          xp_awarded: number
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          evaluation_score?: number
          xp_awarded?: number
          feedback?: string | null
          created_at?: string
        }
      }
      dice_history: {
        Row: {
          id: string
          student_id: string
          dice_result: number
          action_type: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          dice_result: number
          action_type: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          dice_result?: number
          action_type?: string
          created_at?: string
        }
      }
      missions: {
        Row: {
          id: string
          title: string
          description: string | null
          reward_xp: number
          requirements: Json | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          reward_xp: number
          requirements?: Json | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          reward_xp?: number
          requirements?: Json | null
        }
      }
      inventory: {
        Row: {
          id: string
          student_id: string
          item_id: string
          quantity: number
        }
        Insert: {
          id?: string
          student_id: string
          item_id: string
          quantity?: number
        }
        Update: {
          id?: string
          student_id?: string
          item_id?: string
          quantity?: number
        }
      }
    }
  }
}
