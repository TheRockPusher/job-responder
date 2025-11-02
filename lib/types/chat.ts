export interface Message {
  id?: number
  content: string
  type: 'human' | 'ai'
  timestamp: string
  isStreaming?: boolean
  files?: FileMetadata[]
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
  files?: AttachedFile[]
}

export interface StreamEvent {
  text?: string
  session_id?: string
  conversation_title?: string
}

export interface AttachedFile {
  name: string
  type: string
  size: number
  content: string
  encoding: 'text'
}

export interface FileMetadata {
  name: string
  type: string
  size: number
}

export type FileProcessingStatus = 'pending' | 'processing' | 'ready' | 'error'

export interface FileWithStatus {
  id: string
  file: File
  status: FileProcessingStatus
  error?: string
  processed?: AttachedFile
}
