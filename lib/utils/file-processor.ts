/**
 * File processing utilities for extracting text from various file types.
 *
 * Supports:
 * - PDF files (pdfjs-dist)
 * - Word documents (.doc, .docx) via mammoth
 * - Plain text files (.txt, .csv, .json, .md)
 *
 * Note: This module should only be used on the client side due to pdf.js dependencies.
 */

import mammoth from 'mammoth'

// Lazy load pdf.js to avoid SSR issues
let pdfjsLib: any = null

async function getPdfJs() {
  if (!pdfjsLib && typeof window !== 'undefined') {
    // Use the standard build
    pdfjsLib = await import('pdfjs-dist')

    // Use the worker file from the public directory
    // This is the most reliable approach for Next.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'
  }
  return pdfjsLib
}

// File validation constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_FILES = 5
export const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB total

export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'text/markdown': ['.md'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export interface ProcessedFile {
  name: string
  type: string
  size: number
  content: string
  encoding: 'text'
}

/**
 * Validates a file against allowed types and size limits.
 *
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    }
  }

  // Check file type
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
  const isValidType = Object.entries(ALLOWED_FILE_TYPES).some(
    ([mimeType, extensions]) =>
      file.type === mimeType && extensions.includes(extension)
  )

  if (!isValidType) {
    return {
      valid: false,
      error: 'File type not supported',
    }
  }

  return { valid: true }
}

/**
 * Validates multiple files against count and total size limits.
 *
 * @param files - Array of files to validate
 * @returns Validation result with error message if invalid
 */
export function validateFiles(files: File[]): FileValidationResult {
  if (files.length > MAX_FILES) {
    return {
      valid: false,
      error: `Maximum ${MAX_FILES} files allowed`,
    }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  if (totalSize > MAX_TOTAL_SIZE) {
    return {
      valid: false,
      error: `Total file size exceeds ${MAX_TOTAL_SIZE / 1024 / 1024}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Reads a plain text file and returns its content.
 *
 * @param file - Text file to read
 * @returns Promise resolving to file content as string
 */
export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const text = event.target?.result as string
      resolve(text || '')
    }

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`))
    }

    reader.readAsText(file)
  })
}

/**
 * Extracts text content from a PDF file.
 *
 * @param file - PDF file to process
 * @returns Promise resolving to extracted text content
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjs = await getPdfJs()
    if (!pdfjs) {
      throw new Error('PDF.js is not available (client-side only)')
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

    let fullText = ''

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')

      fullText += pageText + '\n\n'
    }

    return fullText.trim()
  } catch (error: any) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`)
  }
}

/**
 * Extracts text content from a Word document (.doc or .docx).
 *
 * @param file - Word document file to process
 * @returns Promise resolving to extracted text content
 */
export async function extractTextFromWord(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })

    if (result.messages && result.messages.length > 0) {
      console.warn('Mammoth conversion warnings:', result.messages)
    }

    return result.value || ''
  } catch (error: any) {
    throw new Error(`Failed to extract text from Word document: ${error.message}`)
  }
}

/**
 * Processes a file and extracts its text content based on file type.
 *
 * @param file - File to process
 * @returns Promise resolving to ProcessedFile object
 */
export async function processFile(file: File): Promise<ProcessedFile> {
  // Validate file first
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  let content: string

  // Extract content based on file type
  if (file.type === 'application/pdf') {
    content = await extractTextFromPDF(file)
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword'
  ) {
    content = await extractTextFromWord(file)
  } else {
    // Plain text files
    content = await readTextFile(file)
  }

  return {
    name: file.name,
    type: file.type,
    size: file.size,
    content,
    encoding: 'text',
  }
}

/**
 * Processes multiple files concurrently.
 *
 * @param files - Array of files to process
 * @returns Promise resolving to array of ProcessedFile objects
 */
export async function processFiles(files: File[]): Promise<ProcessedFile[]> {
  // Validate files
  const validation = validateFiles(files)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Process all files concurrently
  const processedFiles = await Promise.all(
    files.map((file) => processFile(file))
  )

  return processedFiles
}
