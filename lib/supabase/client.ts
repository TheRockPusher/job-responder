import { createBrowserClient } from '@supabase/ssr'
import { API_CONFIG } from '@/config/api'

export function createClient() {
  return createBrowserClient(
    API_CONFIG.supabase.url,
    API_CONFIG.supabase.anonKey
  )
}
