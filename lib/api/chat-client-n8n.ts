import { v4 as uuidv4 } from 'uuid'

interface N8NResponse {
  session_id?: string
  title?: string
  Output: string
}

export async function sendMessage(
  query: string,
  sessionId: string
): Promise<N8NResponse> {
  const requestId = uuidv4()

  console.log('📤 Sending message to N8N:', { query, sessionId, requestId })

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      request_id: requestId,
      session_id: sessionId,
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
  const response = await fetch('/api/conversations')
  if (!response.ok) {
    throw new Error('Failed to fetch conversations')
  }
  const data = await response.json()
  return data.conversations
}

export async function fetchMessages(sessionId: string) {
  const response = await fetch(`/api/conversations/${sessionId}/messages`)
  if (!response.ok) {
    throw new Error('Failed to fetch messages')
  }
  const data = await response.json()
  return data.messages
}
