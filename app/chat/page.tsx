'use client'

import { useState } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import ChatInterface from '@/components/chat/ChatInterface'

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleNewChat = () => {
    setActiveSessionId(null)
    setIsSidebarOpen(false)
  }

  const handleSelectConversation = (sessionId: string) => {
    setActiveSessionId(sessionId)
    setIsSidebarOpen(false)
  }

  const handleSessionIdChange = (sessionId: string, title?: string) => {
    setActiveSessionId(sessionId)
    // Trigger conversation list refresh
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar
        activeSessionId={activeSessionId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        refreshTrigger={refreshTrigger}
      />
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden bg-dark-surface border-b border-dark-border p-4 flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-dark-text"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-dark-text">AI Chat</h1>
        </div>

        <ChatInterface
          sessionId={activeSessionId}
          onSessionIdChange={handleSessionIdChange}
        />
      </div>
    </div>
  )
}
