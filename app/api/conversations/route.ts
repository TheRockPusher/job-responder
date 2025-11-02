import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's conversations
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false })

    if (error) {
      throw error
    }

    // Trim session_ids to remove trailing newlines from N8N
    const cleanedConversations = conversations?.map(conv => ({
      ...conv,
      session_id: conv.session_id.trim()
    })) || []

    console.log('📋 Returning', cleanedConversations.length, 'conversations (session_ids trimmed)')

    return NextResponse.json({ conversations: cleanedConversations })
  } catch (error: any) {
    console.error('Conversations API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
