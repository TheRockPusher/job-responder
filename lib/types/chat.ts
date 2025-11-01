export interface Message {
  id?: number
  content: string
  type: 'human' | 'ai'
  timestamp: string
  isStreaming?: boolean
}

export interface Conversation {
  session_id: string
  user_id: string
  title: string | null
  created_at: string
  last_message_at: string
  is_archived: boolean
  messageCount?: number
}

export interface ChatRequest {
  query: string
  user_id: string
  request_id: string
  session_id: string
}

export interface StreamEvent {
  text?: string
  session_id?: string
  conversation_title?: string
}
