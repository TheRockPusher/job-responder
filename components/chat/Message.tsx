import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { FileMetadata } from '@/lib/types/chat'

interface MessageProps {
  content: string
  type: 'human' | 'ai'
  timestamp?: string
  isStreaming?: boolean
  files?: FileMetadata[]
}

export default function Message({ content, type, timestamp, isStreaming, files }: MessageProps) {
  const isHuman = type === 'human'

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get file icon
  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('msword')) return '📝'
    if (type.includes('text') || type.includes('plain')) return '📃'
    if (type.includes('json')) return '{ }'
    if (type.includes('csv')) return '📊'
    return '📎'
  }

  return (
    <div className={`flex ${isHuman ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isHuman
            ? 'bg-primary-600 text-white'
            : 'bg-dark-surface text-dark-text border border-dark-border'
        }`}
      >
        {/* File Attachments */}
        {files && files.length > 0 && (
          <div className="mb-3 space-y-1">
            {files.map((file, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-xs p-2 rounded ${
                  isHuman
                    ? 'bg-primary-700/50'
                    : 'bg-dark-bg/50 border border-dark-border'
                }`}
              >
                <span className="text-base">{getFileIcon(file.type)}</span>
                <span className="flex-1 truncate font-medium">{file.name}</span>
                <span className={`text-xs ${isHuman ? 'text-primary-200' : 'text-gray-500'}`}>
                  {formatFileSize(file.size)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Message Content */}
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
