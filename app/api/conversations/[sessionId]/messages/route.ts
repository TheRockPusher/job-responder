import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('🔒 Auth error in messages API:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params
    // Trim the session_id to handle trailing newlines from N8N
    const cleanSessionId = sessionId.trim()

    console.log('🔍 Fetching messages for session:', {
      sessionId,
      cleanSessionId,
      sessionIdLength: sessionId.length,
      cleanLength: cleanSessionId.length,
      hadWhitespace: sessionId !== cleanSessionId,
      userId: user.id
    })

    // Try to find conversation with trimmed session_id
    // We use .or() to match either the exact session_id OR one with a trailing newline
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id, session_id')
      .or(`session_id.eq.${cleanSessionId},session_id.eq.${cleanSessionId}\n`)
      .maybeSingle()

    if (convError) {
      console.error('❌ Conversation lookup error:', {
        error: convError,
        sessionId,
        code: convError.code,
        message: convError.message
      })
    }

    if (!conversation) {
      console.warn('⚠️ Conversation not found:', {
        sessionId,
        userId: user.id
      })
    }

    if (convError || !conversation || conversation.user_id !== user.id) {
      return NextResponse.json({
        error: 'Conversation not found',
        details: convError?.message || 'No conversation or wrong user'
      }, { status: 404 })
    }

    // Fetch messages using the actual session_id from the database
    // (which might have a newline)
    const actualSessionId = conversation.session_id
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', actualSessionId)
      .order('created_at', { ascending: true })

    if (msgError) {
      console.error('❌ Messages fetch error:', msgError)
      throw msgError
    }

    console.log('✅ Successfully fetched', messages?.length || 0, 'messages for session:', actualSessionId)

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Messages API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
