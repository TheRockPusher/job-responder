'use client'

import { useState, useEffect, useCallback } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { sendMessage, fetchMessages } from '@/lib/api/chat-client-n8n'
import type { Message } from '@/lib/types/chat'

interface ChatInterfaceProps {
  sessionId: string | null
  onSessionIdChange: (sessionId: string, title?: string) => void
}

export default function ChatInterface({
  sessionId,
  onSessionIdChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load messages when session changes
  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId)
    } else {
      setMessages([])
    }
  }, [sessionId])

  const loadMessages = async (id: string) => {
    try {
      const dbMessages = await fetchMessages(id)
      const formattedMessages: Message[] = dbMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.message.content,
        type: msg.message.type,
        timestamp: msg.created_at,
      }))
      setMessages(formattedMessages)
    } catch (err: any) {
      console.error('Failed to load messages:', err)
      // If conversation not found (404), just start with empty messages
      // This happens when database tables aren't set up yet
      if (err.message === 'Failed to fetch messages') {
        setMessages([])
      } else {
        setError('Failed to load conversation history')
      }
    }
  }

  const handleSendMessage = useCallback(
    async (content: string) => {
      setIsLoading(true)
      setError(null)

      // Add user message immediately
      const userMessage: Message = {
        content,
        type: 'human',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Prepare AI message placeholder
      const aiMessageIndex = messages.length + 1
      let aiContent = ''

      try {
        console.log('🎯 Sending message:', content)

        // Send message to N8N (single response, not streaming)
        const response = await sendMessage(content, sessionId || '')

        console.log('✅ Received response:', response)

        // Add AI response message
        const aiMessage: Message = {
          content: response.Output || 'No response from AI',
          type: 'ai',
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, aiMessage])

        // Update session ID and title if this was a new conversation
        if (response.session_id) {
          onSessionIdChange(response.session_id, response.title)
        }
      } catch (err: any) {
        console.error('Chat error:', err)
        setError(err.message || 'Failed to send message')
        // Remove the user message if sending failed
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId, messages.length, onSessionIdChange]
  )

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 m-4 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}
