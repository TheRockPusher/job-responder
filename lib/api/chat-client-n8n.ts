import { v4 as uuidv4 } from 'uuid'
import { AttachedFile } from '@/lib/types/chat'

interface N8NResponse {
  session_id?: string
  title?: string
  Output: string
}

export async function sendMessage(
  query: string,
  sessionId: string,
  files?: AttachedFile[]
): Promise<N8NResponse> {
  const requestId = uuidv4()

  console.log('📤 Sending message to N8N:', {
    query,
    sessionId,
    requestId,
    filesCount: files?.length || 0
  })

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      request_id: requestId,
      session_id: sessionId,
      files: files || [],
    }),
  })

  console.log('📡 Response status:', response.status, response.statusText)

  if (!response.ok) {
    const error = await response.json()
    console.error('❌ API error:', error)
    throw new Error(error.error || 'Failed to send message')
  }

  const data: N8NResponse = await response.json()
  console.log('📥 N8N response:', data)

  return data
}

export async function fetchConversations() {
  console.log('📋 Fetching conversations list...')
  const response = await fetch('/api/conversations')

  console.log('📡 Conversations response:', {
    status: response.status,
    ok: response.ok
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ Failed to fetch conversations:', errorData)
    throw new Error('Failed to fetch conversations')
  }

  const data = await response.json()
  console.log('📥 Fetched conversations:', data.conversations?.length || 0, 'items')
  return data.conversations
}

export async function fetchMessages(sessionId: string) {
  console.log('🔍 Fetching messages for session:', sessionId)

  const response = await fetch(`/api/conversations/${sessionId}/messages`)

  console.log('📡 Fetch messages response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ Failed to fetch messages:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    })
    throw new Error(`Failed to fetch messages: ${response.status} ${errorData.error || response.statusText}`)
  }

  const data = await response.json()
  console.log('📥 Fetched messages:', data.messages?.length || 0, 'messages')
  return data.messages
}
