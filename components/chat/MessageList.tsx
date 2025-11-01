'use client'

import { useEffect, useRef } from 'react'
import Message from './Message'
import type { Message as MessageType } from '@/lib/types/chat'

interface MessageListProps {
  messages: MessageType[]
  isLoading?: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-dark-text-secondary">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-lg">Start a conversation</p>
            <p className="text-sm mt-2">Ask me anything!</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <Message
              key={message.id || index}
              content={message.content}
              type={message.type}
              timestamp={message.timestamp}
              isStreaming={message.isStreaming}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-dark-surface border border-dark-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
