import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { API_CONFIG } from '@/config/api'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { query, request_id, session_id } = body

    if (!query || !request_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Forward request to N8N webhook
    const n8nWebhookUrl = API_CONFIG.n8n.webhookUrl
    console.log('📤 Sending to N8N:', { query, user_id: user.id, request_id, session_id })

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        user_id: user.id,
        request_id,
        session_id: session_id || '',
      }),
    })

    if (!n8nResponse.ok) {
      console.error('❌ N8N error:', n8nResponse.status, n8nResponse.statusText)
      throw new Error(`N8N webhook error: ${n8nResponse.statusText}`)
    }

    // N8N returns a single JSON response, not a stream
    const n8nData = await n8nResponse.json()
    console.log('📥 N8N response:', n8nData)

    // Save conversation and messages to database
    // Trim session_id to remove any whitespace/newlines from N8N
    const finalSessionId = (n8nData.session_id || session_id || '').trim()

    if (finalSessionId) {
      try {
        // Create or update conversation
        const { error: convError } = await supabase
          .from('conversations')
          .upsert({
            session_id: finalSessionId,
            user_id: user.id,
            title: n8nData.title || 'New Conversation',
            last_message_at: new Date().toISOString(),
          })

        if (convError) {
          console.error('Error saving conversation:', convError)
        }

        // Save user message
        const { error: userMsgError } = await supabase
          .from('messages')
          .insert({
            session_id: finalSessionId,
            message: {
              content: query,
              type: 'human',
            },
            created_at: new Date().toISOString(),
          })

        if (userMsgError) {
          console.error('Error saving user message:', userMsgError)
        }

        // Save AI response
        if (n8nData.Output) {
          const { error: aiMsgError } = await supabase
            .from('messages')
            .insert({
              session_id: finalSessionId,
              message: {
                content: n8nData.Output,
                type: 'ai',
              },
              created_at: new Date().toISOString(),
            })

          if (aiMsgError) {
            console.error('Error saving AI message:', aiMsgError)
          }
        }

        console.log('✅ Messages saved to database')
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Continue even if database save fails
      }
    }

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
