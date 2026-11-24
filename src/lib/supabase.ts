import { createClient } from '@supabase/supabase-js'
import { isNative } from './native'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — check your .env file')
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // PKCE is the modern flow and the only one that works inside a WebView
    // once OAuth/magic links are added for the native app.
    flowType: 'pkce',
    // The native shell loads from a bundled origin — never parse a session
    // from its URL; the browser build keeps detection enabled.
    detectSessionInUrl: !isNative,
  },
})
