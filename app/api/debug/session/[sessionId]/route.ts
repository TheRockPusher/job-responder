import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DEBUG ENDPOINT - Remove in production!
 *
 * Check a specific session_id and see what's in the database
 * GET /api/debug/session/[sessionId]
 */
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    console.log('🔧 DEBUG: Checking session:', {
      sessionId,
      sessionId_length: sessionId.length,
      sessionId_trimmed: sessionId.trim(),
      sessionId_has_whitespace: sessionId !== sessionId.trim(),
      userId: user.id
    })

    // Try exact match
    const { data: exactMatch, error: exactError } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle()

    // Try trimmed match
    const { data: trimmedMatch, error: trimmedError } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId.trim())
      .maybeSingle()

    // Try to find similar session_ids
    const { data: similarSessions, error: similarError } = await supabase
      .from('conversations')
      .select('session_id, user_id, title')
      .ilike('session_id', `%${sessionId.trim()}%`)

    // Get messages for this session_id (both exact and trimmed)
    const { data: exactMessages, error: exactMsgError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)

    const { data: trimmedMessages, error: trimmedMsgError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId.trim())

    return NextResponse.json({
      session_id_requested: sessionId,
      session_id_details: {
        length: sessionId.length,
        trimmed: sessionId.trim(),
        has_whitespace: sessionId !== sessionId.trim(),
        char_codes: Array.from(sessionId).map(c => c.charCodeAt(0))
      },
      exact_match: {
        found: !!exactMatch,
        conversation: exactMatch,
        error: exactError?.message,
        belongs_to_user: exactMatch?.user_id === user.id
      },
      trimmed_match: {
        found: !!trimmedMatch,
        conversation: trimmedMatch,
        error: trimmedError?.message,
        belongs_to_user: trimmedMatch?.user_id === user.id
      },
      similar_sessions: {
        found: (similarSessions?.length || 0) > 0,
        count: similarSessions?.length || 0,
        sessions: similarSessions?.map(s => ({
          session_id: s.session_id,
          session_id_length: s.session_id?.length,
          matches_user: s.user_id === user.id,
          title: s.title
        })),
        error: similarError?.message
      },
      messages: {
        exact_match: {
          count: exactMessages?.length || 0,
          error: exactMsgError?.message
        },
        trimmed_match: {
          count: trimmedMessages?.length || 0,
          error: trimmedMsgError?.message
        }
      },
      current_user: user.id
    })
  } catch (error: any) {
    console.error('🔧 DEBUG Session API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
