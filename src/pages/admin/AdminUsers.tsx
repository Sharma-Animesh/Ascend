import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { Flame, Search, ShieldCheck, ShieldOff, Users, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../store/auth'
import type { CharacterProfile, Profile } from '../../lib/types'
import { rankById } from '../../lib/game'
import { SystemPanel } from '../../components/system/SystemPanel'
import { GlowButton } from '../../components/system/GlowButton'
import { InlineLoader } from '../../components/system/Loader'
import { EmptyState } from '../../components/system/EmptyState'

const easeOut = [0.22, 1, 0.36, 1] as const

interface HunterRow {
  profile: Profile
  character: CharacterProfile | null
}

export default function AdminUsers() {
  const { session } = useAuth()
  const myId = session?.user.id

  const [rows, setRows] = useState<HunterRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  /** id of the user whose role change is awaiting confirmation */
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [workingId, setWorkingId] = useState<string | null>(null)

  const load = async () => {
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (pErr) {
      setError('The System could not load the Ascendant registry.')
      return
    }
    const list = (profiles as Profile[] | null) ?? []
    let characters: CharacterProfile[] = []
    if (list.length > 0) {
      const { data: chars, error: cErr } = await supabase
        .from('character_profiles')
        .select('*')
        .in(
          'user_id',
          list.map((p) => p.id),
        )
      if (cErr) {
        setError('The System could not load Ascendant character data.')
        return
      }
      characters = (chars as CharacterProfile[] | null) ?? []
    }
    setError(null)
    setRows(
      list.map((p) => ({
        profile: p,
        character: characters.find((c) => c.user_id === p.id) ?? null,
      })),
    )
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    if (!rows) return null
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => (r.profile.display_name ?? '').toLowerCase().includes(q))
  }, [rows, search])

  const applyRole = async (id: string, newRole: 'admin' | 'user') => {
    setWorkingId(id)
    const { error: err } = await supabase.rpc('admin_set_role', { target_user: id, new_role: newRole })
    if (err) {
      setError('Role change was rejected by the System. Try again.')
    } else {
      setError(null)
      await load()
    }
    setWorkingId(null)
    setPendingId(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        <h1 className="flex items-center gap-2.5 font-display text-base font-bold tracking-[0.28em] text-gold uppercase text-glow-gold sm:text-lg">
          <Users size={20} className="shrink-0" />
          Ascendant Registry
        </h1>
        <p className="mt-1 text-sm text-mute">Every Ascendant on record, and who holds administrator authority.</p>
      </motion.header>

      {error && (
        <p className="rounded-md border border-danger/40 bg-red-950/30 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut, delay: 0.06 }}
        className="relative"
      >
        <Search size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mute" />
        <input
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search Ascendants by name…"
          className="sys-input pl-10"
          aria-label="Search Ascendants by name"
        />
      </motion.div>

      {/* List */}
      <SystemPanel
        title="Ascendants"
        icon={<Users size={14} className="text-gold" />}
        action={
          filtered && (
            <span className="font-display text-[0.6rem] tracking-[0.2em] text-mute uppercase">
              {filtered.length} shown
            </span>
          )
        }
      >
        {filtered === null && !error ? (
          <InlineLoader label="Scanning registry" />
        ) : !filtered || filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={30} />}
            title="No Ascendants found"
            hint={search ? 'No Ascendant matches that name.' : 'New Ascendants will appear here as they ascend.'}
          />
        ) : (
          <ul className="divide-y divide-line/50">
            {filtered.map(({ profile, character }, i) => {
              const isAdmin = profile.role === 'admin'
              const isSelf = profile.id === myId
              const rank = character ? rankById(character.rank) : null
              const pending = pendingId === profile.id
              const working = workingId === profile.id

              return (
                <motion.li
                  key={profile.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: easeOut, delay: Math.min(i, 12) * 0.04 }}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-display text-xs font-bold ${
                      isAdmin ? 'border-gold/50 bg-gold/10 text-gold' : 'border-line bg-abyss text-glow-soft'
                    }`}
                  >
                    {(profile.display_name ?? 'A').slice(0, 1).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-ink">
                        {profile.display_name ?? 'Unnamed Ascendant'}
                      </span>
                      {isAdmin && (
                        <span className="shrink-0 rounded-full border border-gold/50 bg-gold/10 px-2 py-px font-display text-[0.52rem] font-bold tracking-[0.2em] text-gold uppercase">
                          Admin
                        </span>
                      )}
                      {isSelf && (
                        <span className="shrink-0 rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-px font-display text-[0.52rem] font-bold tracking-[0.2em] text-sky-300 uppercase">
                          You
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.7rem] text-mute">
                      {character ? (
                        <>
                          <span className="font-display font-bold tracking-[0.12em] text-glow-soft">
                            LV.{character.level}
                          </span>
                          {rank && (
                            <span
                              className="rounded-full border px-1.5 py-px font-display text-[0.54rem] font-bold tracking-[0.16em] uppercase"
                              style={{ borderColor: `${rank.color}66`, color: rank.color }}
                            >
                              {rank.label}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5 text-orange-300">
                            <Flame size={11} />
                            {character.streak}
                          </span>
                        </>
                      ) : (
                        <span>Unascended</span>
                      )}
                      <span className="text-mute/50">·</span>
                      <span>
                        Joined{' '}
                        {new Date(profile.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Role actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    {isAdmin && isSelf ? (
                      <span
                        title="You cannot revoke your own administrator authority — ask another admin."
                        className="cursor-not-allowed"
                      >
                        <GlowButton variant="ghost" size="sm" disabled icon={<ShieldOff size={14} />}>
                          Demote
                        </GlowButton>
                      </span>
                    ) : pending ? (
                      <>
                        <GlowButton
                          variant={isAdmin ? 'danger' : 'gold'}
                          size="sm"
                          loading={working}
                          onClick={() => void applyRole(profile.id, isAdmin ? 'user' : 'admin')}
                        >
                          Confirm {isAdmin ? 'Demote' : 'Promote'}
                        </GlowButton>
                        <button
                          type="button"
                          aria-label="Cancel role change"
                          onClick={() => setPendingId(null)}
                          className="flex h-11 w-11 items-center justify-center rounded-md text-mute transition hover:bg-abyss hover:text-ink"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <GlowButton
                        variant="ghost"
                        size="sm"
                        icon={isAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        onClick={() => setPendingId(profile.id)}
                      >
                        {isAdmin ? 'Demote' : 'Promote'}
                      </GlowButton>
                    )}
                  </div>
                </motion.li>
              )
            })}
          </ul>
        )}
        <p className="mt-3 border-t border-line/50 pt-3 text-[0.7rem] text-mute/80">
          Promoting grants full System administration authority. Your own admin role cannot be revoked from this
          console — another administrator must do it.
        </p>
      </SystemPanel>
    </div>
  )
}
