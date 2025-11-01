'use client'

import { useState } from 'react'
import ConversationList from './ConversationList'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  activeSessionId: string | null
  onSelectConversation: (sessionId: string) => void
  onNewChat: () => void
  isOpen: boolean
  onToggle: () => void
  refreshTrigger: number
}

export default function Sidebar({
  activeSessionId,
  onSelectConversation,
  onNewChat,
  isOpen,
  onToggle,
  refreshTrigger,
}: SidebarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-dark-surface border-r border-dark-border flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark-text">Conversations</h2>
            <button
              onClick={onToggle}
              className="lg:hidden text-dark-text-secondary hover:text-dark-text"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={onNewChat}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Chat
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-4">
          <ConversationList
            activeSessionId={activeSessionId}
            onSelectConversation={onSelectConversation}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-dark-text-secondary hover:text-dark-text hover:bg-dark-bg rounded-lg transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
