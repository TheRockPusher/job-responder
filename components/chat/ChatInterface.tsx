'use client'

import { useState, useEffect, useCallback } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { sendMessage, fetchMessages } from '@/lib/api/chat-client-n8n'
import type { Message, AttachedFile, FileMetadata } from '@/lib/types/chat'

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
  const [isNewConversation, setIsNewConversation] = useState(false)

  // Load messages when session changes
  useEffect(() => {
    if (sessionId) {
      // Only load from database if we're switching to an existing conversation
      // Don't reload if this is a conversation we just created
      if (!isNewConversation) {
        loadMessages(sessionId)
      } else {
        // Reset the flag after we've skipped the initial load
        setIsNewConversation(false)
      }
    } else {
      setMessages([])
      setIsNewConversation(false)
    }
  }, [sessionId, isNewConversation])

  const loadMessages = async (id: string) => {
    try {
      const dbMessages = await fetchMessages(id)
      const formattedMessages: Message[] = dbMessages.map((msg: any) => {
        // Parse file metadata from message_data if present
        let files: FileMetadata[] | undefined = undefined
        if (msg.message_data) {
          try {
            const parsedData = typeof msg.message_data === 'string'
              ? JSON.parse(msg.message_data)
              : msg.message_data
            files = parsedData.files
          } catch (e) {
            console.error('Failed to parse message_data:', e)
          }
        }

        return {
          id: msg.id,
          content: msg.message.content,
          type: msg.message.type,
          timestamp: msg.created_at,
          files,
        }
      })
      setMessages(formattedMessages)
      setError(null)
    } catch (err: any) {
      console.error('Failed to load messages:', err)
      // Don't clear existing messages on error - just show error state
      // This prevents messages from disappearing if there's a temporary network issue
      setError('Failed to load conversation history. Showing cached messages.')
    }
  }

  const handleSendMessage = useCallback(
    async (content: string, files?: AttachedFile[]) => {
      setIsLoading(true)
      setError(null)

      // Prepare file metadata for display
      const fileMetadata: FileMetadata[] | undefined = files?.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
      }))

      // Add user message immediately
      const userMessage: Message = {
        content,
        type: 'human',
        timestamp: new Date().toISOString(),
        files: fileMetadata,
      }
      setMessages((prev) => [...prev, userMessage])

      // Prepare AI message placeholder
      const aiMessageIndex = messages.length + 1
      let aiContent = ''

      try {
        console.log('🎯 Sending message:', content, 'with', files?.length || 0, 'files')

        // Send message to N8N (single response, not streaming)
        const response = await sendMessage(content, sessionId || '', files)

        console.log('✅ Received response:', response)

        // Add AI response message
        const aiMessage: Message = {
          content: response.Output || 'No response from AI',
          type: 'ai',
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, aiMessage])

        // Update session ID and title ONLY if this was actually a NEW conversation
        // (i.e., we didn't have a sessionId before sending the message)
        if (response.session_id && response.session_id.trim()) {
          const returnedSessionId = response.session_id.trim()

          // Check if this is actually a new conversation
          if (!sessionId || sessionId === '') {
            // This WAS a new conversation (we started with no sessionId)
            console.log('🔄 New conversation created:', returnedSessionId)
            setIsNewConversation(true)
            onSessionIdChange(returnedSessionId, response.title)
          } else if (sessionId.trim() === returnedSessionId) {
            // Continuing existing conversation - don't trigger refresh
            console.log('✅ Continuing existing conversation:', returnedSessionId)
            // No need to call onSessionIdChange - we're already in this conversation
          } else {
            // Session ID changed unexpectedly - this shouldn't happen
            console.warn('⚠️ Session ID mismatch:', {
              current: sessionId,
              returned: returnedSessionId
            })
            setIsNewConversation(true)
            onSessionIdChange(returnedSessionId, response.title)
          }
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
