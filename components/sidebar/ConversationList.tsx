'use client'

import { useEffect, useState } from 'react'
import ConversationItem from './ConversationItem'
import { fetchConversations } from '@/lib/api/chat-client-n8n'
import type { Conversation } from '@/lib/types/chat'

interface ConversationListProps {
  activeSessionId: string | null
  onSelectConversation: (sessionId: string) => void
  refreshTrigger?: number
}

export default function ConversationList({
  activeSessionId,
  onSelectConversation,
  refreshTrigger,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConversations()
  }, [refreshTrigger])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const data = await fetchConversations()
      console.log('📋 Loaded conversations:', data.length, 'conversations')
      setConversations(data)
      setError(null)
    } catch (err: any) {
      console.error('❌ Failed to load conversations:', err)
      setError('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={loadConversations}
          className="mt-2 text-sm underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-dark-text-secondary">
        <p>No conversations yet</p>
        <p className="text-sm mt-2">Start a new chat to begin!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.session_id}
          conversation={conversation}
          isActive={conversation.session_id === activeSessionId}
          onClick={() => onSelectConversation(conversation.session_id)}
        />
      ))}
    </div>
  )
}
