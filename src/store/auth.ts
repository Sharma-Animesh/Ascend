import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { CharacterProfile, Profile } from '../lib/types'

interface AuthState {
  session: Session | null
  profile: Profile | null
  character: CharacterProfile | null
  /** true until the initial session + profile fetch settles */
  loading: boolean
  init: () => Promise<void>
  loadUserData: () => Promise<void>
  refreshCharacter: () => Promise<void>
  signOut: () => Promise<void>
  setProfile: (p: Profile) => void
  setCharacter: (c: CharacterProfile) => void
}

let initialized = false

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  character: null,
  loading: true,

  init: async () => {
    if (initialized) return
    initialized = true
    const {
      data: { session },
    } = await supabase.auth.getSession()
    set({ session })
    supabase.auth.onAuthStateChange((_event, s) => {
      const hadUser = !!get().session?.user
      set({ session: s })
      if (s?.user && !hadUser) void get().loadUserData()
      if (!s?.user) set({ profile: null, character: null })
    })
    if (session?.user) await get().loadUserData()
    set({ loading: false })
  },

  loadUserData: async () => {
    const userId = get().session?.user.id
    if (!userId) return
    const [{ data: profile }, { data: character }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('character_profiles').select('*').eq('user_id', userId).maybeSingle(),
    ])
    set({
      profile: (profile as Profile) ?? null,
      character: (character as CharacterProfile) ?? null,
    })
  },

  refreshCharacter: async () => {
    const userId = get().session?.user.id
    if (!userId) return
    const { data } = await supabase.from('character_profiles').select('*').eq('user_id', userId).maybeSingle()
    if (data) set({ character: data as CharacterProfile })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ profile: null, character: null, session: null })
  },

  setProfile: (p) => set({ profile: p }),
  setCharacter: (c) => set({ character: c }),
}))
