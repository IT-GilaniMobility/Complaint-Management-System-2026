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
      users: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          role: 'Admin' | 'Lead Agent' | 'Agent' | 'Staff'
          avatar_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          role?: 'Admin' | 'Lead Agent' | 'Agent' | 'Staff'
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          role?: 'Admin' | 'Lead Agent' | 'Agent' | 'Staff'
          avatar_url?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          sla_hours: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          sla_hours: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          sla_hours?: number
        }
      }
      complaints: {
        Row: {
          id: string
          complaint_number: string
          created_at: string
          updated_at: string
          subject: string
          description: string
          status: 'Unassigned' | 'In Progress' | 'Resolved' | 'Closed'
          priority: 'Urgent' | 'High' | 'Medium' | 'Low'
          category_id: string
          reporter_id: string
          assigned_to_id: string | null
          due_date: string
          resolved_at: string | null
          customer_name: string | null
          customer_email: string | null
          customer_phone: string | null
          attachments: Json | null
        }
        Insert: {
          id?: string
          complaint_number?: string
          created_at?: string
          updated_at?: string
          subject: string
          description: string
          status?: 'Unassigned' | 'In Progress' | 'Resolved' | 'Closed'
          priority?: 'Urgent' | 'High' | 'Medium' | 'Low'
          category_id: string
          reporter_id: string
          assigned_to_id?: string | null
          due_date?: string
          resolved_at?: string | null
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          attachments?: Json | null
        }
        Update: {
          id?: string
          complaint_number?: string
          created_at?: string
          updated_at?: string
          subject?: string
          description?: string
          status?: 'Unassigned' | 'In Progress' | 'Resolved' | 'Closed'
          priority?: 'Urgent' | 'High' | 'Medium' | 'Low'
          category_id?: string
          reporter_id?: string
          assigned_to_id?: string | null
          due_date?: string
          resolved_at?: string | null
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          attachments?: Json | null
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          complaint_id: string
          user_id: string
          content: string
          is_internal: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          complaint_id: string
          user_id: string
          content: string
          is_internal?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          complaint_id?: string
          user_id?: string
          content?: string
          is_internal?: boolean
        }
      }
      activities: {
        Row: {
          id: string
          created_at: string
          complaint_id: string
          user_id: string
          action: string
          details: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          complaint_id: string
          user_id: string
          action: string
          details?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          complaint_id?: string
          user_id?: string
          action?: string
          details?: Json | null
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
  }
}
