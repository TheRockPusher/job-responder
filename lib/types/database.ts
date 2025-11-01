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
      conversations: {
        Row: {
          session_id: string
          user_id: string
          title: string | null
          created_at: string
          last_message_at: string
          is_archived: boolean
          metadata: Json
        }
        Insert: {
          session_id: string
          user_id: string
          title?: string | null
          created_at?: string
          last_message_at?: string
          is_archived?: boolean
          metadata?: Json
        }
        Update: {
          session_id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          last_message_at?: string
          is_archived?: boolean
          metadata?: Json
        }
      }
      messages: {
        Row: {
          id: number
          session_id: string
          message: {
            content: string
            type: 'human' | 'ai'
          }
          message_data: string | null
          created_at: string
        }
        Insert: {
          session_id: string
          message: {
            content: string
            type: 'human' | 'ai'
          }
          message_data?: string | null
          created_at?: string
        }
        Update: {
          session_id?: string
          message?: {
            content: string
            type: 'human' | 'ai'
          }
          message_data?: string | null
          created_at?: string
        }
      }
    }
  }
}
