'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import FileAttachment from './FileAttachment'
import type { AttachedFile, FileWithStatus } from '@/lib/types/chat'

interface MessageInputProps {
  onSend: (message: string, files?: AttachedFile[]) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState('')
  const [filesWithStatus, setFilesWithStatus] = useState<FileWithStatus[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check if we have any content to send (text or files)
    const hasText = input.trim().length > 0
    const hasReadyFiles = filesWithStatus.some(f => f.status === 'ready')

    if (!hasText && !hasReadyFiles) {
      return
    }

    // Check if any files are still processing
    const isProcessing = filesWithStatus.some(f => f.status === 'processing')
    if (isProcessing) {
      alert('Please wait for files to finish processing')
      return
    }

    // Get only successfully processed files
    const attachedFiles = filesWithStatus
      .filter(f => f.status === 'ready' && f.processed)
      .map(f => f.processed!)

    if (!disabled) {
      onSend(input.trim() || 'Attached files', attachedFiles.length > 0 ? attachedFiles : undefined)
      setInput('')
      setFilesWithStatus([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  // Check if send button should be enabled
  const canSend = (input.trim().length > 0 || filesWithStatus.some(f => f.status === 'ready')) &&
                  !disabled &&
                  !filesWithStatus.some(f => f.status === 'processing')

  return (
    <form onSubmit={handleSubmit} className="border-t border-dark-border bg-dark-surface p-4">
      {/* File Attachment Zone */}
      <div className="mb-3">
        <FileAttachment
          onFilesChange={setFilesWithStatus}
          disabled={disabled}
        />
      </div>

      {/* Text Input and Send Button */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={disabled}
          className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none min-h-[52px] max-h-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          Send
        </button>
      </div>
      <p className="text-xs text-dark-text-secondary mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  )
}
