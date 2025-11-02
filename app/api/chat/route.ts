import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { API_CONFIG } from '@/config/api'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user
    const accessToken = session.access_token

    // Parse request body
    const body = await request.json()
    const { query, request_id, session_id, files } = body

    if (!query || !request_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate files if present
    if (files && Array.isArray(files)) {
      // Server-side validation
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      const MAX_FILES = 5
      const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB

      if (files.length > MAX_FILES) {
        return NextResponse.json(
          { error: `Maximum ${MAX_FILES} files allowed` },
          { status: 400 }
        )
      }

      // Validate each file
      for (const file of files) {
        if (!file.name || !file.type || !file.size || !file.content) {
          return NextResponse.json(
            { error: 'Invalid file format' },
            { status: 400 }
          )
        }

        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File ${file.name} exceeds size limit` },
            { status: 400 }
          )
        }
      }

      // Validate total size
      const totalSize = files.reduce((sum: number, f: any) => sum + f.size, 0)
      if (totalSize > MAX_TOTAL_SIZE) {
        return NextResponse.json(
          { error: 'Total file size exceeds limit' },
          { status: 400 }
        )
      }
    }

    // Forward request to N8N webhook
    const n8nWebhookUrl = API_CONFIG.n8n.webhookUrl
    console.log('📤 Sending to N8N:', {
      query,
      user_id: user.id,
      request_id,
      session_id,
      filesCount: files?.length || 0
    })

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query,
        user_id: user.id,
        request_id,
        session_id: session_id || '',
        files: files || [],
      }),
    })

    if (!n8nResponse.ok) {
      console.error('❌ N8N error:', n8nResponse.status, n8nResponse.statusText)
      throw new Error(`N8N webhook error: ${n8nResponse.statusText}`)
    }

    // N8N returns a single JSON response, not a stream
    const n8nData = await n8nResponse.json()
    console.log('📥 N8N response:', n8nData)

    // N8N handles all database operations (conversations and messages)
    // No database operations needed here - just return the response

    // Trim session_id to remove any whitespace/newlines from N8N
    const finalSessionId = (n8nData.session_id || session_id || '').trim()

    console.log('✅ N8N handled database operations')

    // Return the response with trimmed session_id
    return NextResponse.json({
      ...n8nData,
      session_id: finalSessionId, // Use the trimmed version
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
