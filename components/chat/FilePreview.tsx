'use client'

import { FileWithStatus } from '@/lib/types/chat'

interface FilePreviewProps {
  fileWithStatus: FileWithStatus
  onRemove: () => void
}

export default function FilePreview({
  fileWithStatus,
  onRemove,
}: FilePreviewProps) {
  const { file, status, error } = fileWithStatus

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get file icon based on file type
  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('msword')) return '📝'
    if (type.includes('text') || type.includes('plain')) return '📃'
    if (type.includes('json')) return '{ }'
    if (type.includes('csv')) return '📊'
    return '📎'
  }

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'bg-green-500/10 border-green-500/30 text-green-400'
      case 'processing':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400'
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400'
    }
  }

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return 'Ready'
      case 'processing':
        return 'Processing...'
      case 'error':
        return error || 'Error'
      default:
        return 'Pending'
    }
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor()} transition-colors`}
    >
      {/* File Icon */}
      <div className="text-2xl flex-shrink-0">{getFileIcon(file.type)}</div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {file.name}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {formatFileSize(file.size)} • {getStatusText()}
        </div>
      </div>

      {/* Loading Spinner */}
      {status === 'processing' && (
        <div className="flex-shrink-0">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        disabled={status === 'processing'}
        className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-red-500/10"
        aria-label="Remove file"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}
