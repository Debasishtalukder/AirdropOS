export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          chain: string | null
          stage: string | null
          status: string | null
          potential_value: string | null
          website_url: string | null
          twitter_url: string | null
          discord_url: string | null
          color_tag: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          chain?: string | null
          stage?: string | null
          status?: string | null
          potential_value?: string | null
          website_url?: string | null
          twitter_url?: string | null
          discord_url?: string | null
          color_tag?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          chain?: string | null
          stage?: string | null
          status?: string | null
          potential_value?: string | null
          website_url?: string | null
          twitter_url?: string | null
          discord_url?: string | null
          color_tag?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          description: string | null
          status: string | null
          priority: string | null
          is_recurring: boolean | null
          recurrence_type: string | null
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          is_recurring?: boolean | null
          recurrence_type?: string | null
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          is_recurring?: boolean | null
          recurrence_type?: string | null
          due_date?: string | null
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          url: string
          type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          url: string
          type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          title?: string
          url?: string
          type?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
