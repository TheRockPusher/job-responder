'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import FilePreview from './FilePreview'
import { FileWithStatus } from '@/lib/types/chat'
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES,
  processFile,
} from '@/lib/utils/file-processor'

interface FileAttachmentProps {
  onFilesChange: (files: FileWithStatus[]) => void
  disabled?: boolean
}

export default function FileAttachment({
  onFilesChange,
  disabled = false,
}: FileAttachmentProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([])

  // Process files and extract text
  const processFiles = useCallback(
    async (newFiles: File[]) => {
      const filesWithStatus: FileWithStatus[] = newFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        status: 'pending' as const,
      }))

      // Add files immediately with pending status
      setFiles((prev) => {
        const updatedFiles = [...prev, ...filesWithStatus]
        // Use setTimeout to avoid setState during render
        setTimeout(() => onFilesChange(updatedFiles), 0)
        return updatedFiles
      })

      // Process each file
      for (const fileWithStatus of filesWithStatus) {
        try {
          // Update to processing status
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithStatus.id ? { ...f, status: 'processing' as const } : f
            )
          )

          // Extract text content
          const processed = await processFile(fileWithStatus.file)

          // Update to ready status
          setFiles((prev) => {
            const updated = prev.map((f) =>
              f.id === fileWithStatus.id
                ? { ...f, status: 'ready' as const, processed }
                : f
            )
            // Use setTimeout to avoid setState during render
            setTimeout(() => onFilesChange(updated), 0)
            return updated
          })
        } catch (error: any) {
          console.error('Error processing file:', error)

          // Update to error status
          setFiles((prev) => {
            const updated = prev.map((f) =>
              f.id === fileWithStatus.id
                ? { ...f, status: 'error' as const, error: error.message }
                : f
            )
            // Use setTimeout to avoid setState during render
            setTimeout(() => onFilesChange(updated), 0)
            return updated
          })
        }
      }
    },
    [onFilesChange]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((rejection) => {
          const errorMessages = rejection.errors
            .map((e: any) => e.message)
            .join(', ')
          return `${rejection.file.name}: ${errorMessages}`
        })
        console.error('Rejected files:', errors)
        alert(`Some files were rejected:\n${errors.join('\n')}`)
      }

      // Check if adding these files would exceed max files
      if (files.length + acceptedFiles.length > MAX_FILES) {
        alert(`Maximum ${MAX_FILES} files allowed`)
        return
      }

      // Process accepted files
      if (acceptedFiles.length > 0) {
        processFiles(acceptedFiles)
      }
    },
    [files.length, processFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES - files.length,
    multiple: true,
    disabled,
  })

  const removeFile = useCallback(
    (fileId: string) => {
      const updatedFiles = files.filter((f) => f.id !== fileId)
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
    },
    [files, onFilesChange]
  )

  return (
    <div className="space-y-2">
      {/* Dropzone */}
      {files.length < MAX_FILES && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500 bg-dark-bg-secondary'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-sm text-gray-300">
              {isDragActive ? (
                <p>Drop files here...</p>
              ) : (
                <>
                  <p>
                    <span className="font-medium text-blue-400">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, TXT, CSV, JSON, MD, DOC, DOCX (max {MAX_FILE_SIZE / 1024 / 1024}MB each)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Preview List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileWithStatus) => (
            <FilePreview
              key={fileWithStatus.id}
              fileWithStatus={fileWithStatus}
              onRemove={() => removeFile(fileWithStatus.id)}
            />
          ))}
        </div>
      )}

      {/* File count indicator */}
      {files.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          {files.length} / {MAX_FILES} files attached
        </div>
      )}
    </div>
  )
}
