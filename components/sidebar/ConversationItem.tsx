import type { Conversation } from '@/lib/types/chat'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const title = conversation.title || 'New Conversation'
  const lastMessageDate = new Date(conversation.last_message_at)
  const now = new Date()
  const diffInHours = (now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60)

  let timeDisplay = ''
  if (diffInHours < 1) {
    timeDisplay = 'Just now'
  } else if (diffInHours < 24) {
    timeDisplay = `${Math.floor(diffInHours)}h ago`
  } else if (diffInHours < 168) {
    timeDisplay = `${Math.floor(diffInHours / 24)}d ago`
  } else {
    timeDisplay = lastMessageDate.toLocaleDateString()
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'bg-dark-surface text-dark-text hover:bg-dark-border'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium truncate ${
              isActive ? 'text-white' : 'text-dark-text'
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm truncate ${
              isActive ? 'text-primary-200' : 'text-dark-text-secondary'
            }`}
          >
            {timeDisplay}
          </p>
        </div>
        <svg
          className={`w-5 h-5 flex-shrink-0 ml-2 ${
            isActive ? 'text-white' : 'text-dark-text-secondary'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  )
}
