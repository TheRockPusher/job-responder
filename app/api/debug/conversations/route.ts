import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DEBUG ENDPOINT - Remove in production!
 *
 * This endpoint bypasses RLS to show what's actually in the database
 * GET /api/debug/conversations?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔧 DEBUG: Checking database for user:', user.id)

    // Check what's in conversations table (respecting RLS)
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)

    console.log('🔧 DEBUG: Conversations query result:', {
      count: conversations?.length || 0,
      error: convError,
      conversations: conversations?.map(c => ({
        session_id: c.session_id,
        session_id_length: c.session_id?.length,
        user_id: c.user_id,
        title: c.title,
        created_at: c.created_at
      }))
    })

    // Check what's in messages table
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(10)

    console.log('🔧 DEBUG: Messages query result:', {
      count: messages?.length || 0,
      error: msgError,
      messages: messages?.map(m => ({
        id: m.id,
        session_id: m.session_id,
        session_id_length: m.session_id?.length,
        type: m.message?.type,
        created_at: m.created_at
      }))
    })

    // Get ALL conversations (bypassing user filter to see what exists)
    const { data: allConversations, error: allConvError } = await supabase
      .from('conversations')
      .select('session_id, user_id, title')
      .limit(20)

    console.log('🔧 DEBUG: All conversations in DB:', {
      count: allConversations?.length || 0,
      error: allConvError,
      all: allConversations?.map(c => ({
        session_id: c.session_id,
        session_id_trimmed: c.session_id?.trim(),
        user_id: c.user_id,
        matches_current_user: c.user_id === user.id,
        title: c.title
      }))
    })

    return NextResponse.json({
      current_user: user.id,
      your_conversations: conversations || [],
      your_messages_sample: messages || [],
      all_conversations_in_db: allConversations || [],
      diagnostics: {
        has_conversations: (conversations?.length || 0) > 0,
        has_messages: (messages?.length || 0) > 0,
        conv_error: convError?.message,
        msg_error: msgError?.message,
        all_conv_error: allConvError?.message
      }
    })
  } catch (error: any) {
    console.error('🔧 DEBUG API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
