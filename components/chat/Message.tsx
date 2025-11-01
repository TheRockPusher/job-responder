import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageProps {
  content: string
  type: 'human' | 'ai'
  timestamp?: string
  isStreaming?: boolean
}

export default function Message({ content, type, timestamp, isStreaming }: MessageProps) {
  const isHuman = type === 'human'

  return (
    <div className={`flex ${isHuman ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isHuman
            ? 'bg-primary-600 text-white'
            : 'bg-dark-surface text-dark-text border border-dark-border'
        }`}
      >
        {isHuman ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
        {timestamp && (
          <p
            className={`text-xs mt-2 ${
              isHuman ? 'text-primary-200' : 'text-dark-text-secondary'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
        {isStreaming && (
          <div className="flex items-center gap-1 mt-2">
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
        )}
      </div>
    </div>
  )
}
