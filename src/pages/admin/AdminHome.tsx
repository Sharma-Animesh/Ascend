import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Dumbbell, Megaphone, ScrollText, ShieldCheck, Swords, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { CharacterProfile, Profile } from '../../lib/types'
import { rankById } from '../../lib/game'
import { SystemPanel } from '../../components/system/SystemPanel'
import { InlineLoader } from '../../components/system/Loader'
import { EmptyState } from '../../components/system/EmptyState'

interface Kpis {
  hunters: number
  workouts: number
  questsCompleted: number
  exercises: number
}

interface RecentHunter {
  profile: Profile
  character: CharacterProfile | null
}

const QUICK_LINKS = [
  {
    to: '/app/admin/exercises',
    label: 'Exercise Library',
    desc: 'Forge, edit and publish training content',
    icon: Dumbbell,
  },
  {
    to: '/app/admin/users',
    label: 'Ascendant Registry',
    desc: 'Review Ascendants and manage admin roles',
    icon: Users,
  },
  {
    to: '/app/admin/announcements',
    label: 'System Broadcasts',
    desc: 'Publish announcements to every dashboard',
    icon: Megaphone,
  },
]

const easeOut = [0.22, 1, 0.36, 1] as const

export default function AdminHome() {
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [recent, setRecent] = useState<RecentHunter[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [huntersRes, workoutsRes, questsRes, exercisesRes, profilesRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('workout_logs').select('*', { count: 'exact', head: true }),
          supabase.from('quests').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('exercises').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(8),
        ])

        const firstError =
          huntersRes.error ?? workoutsRes.error ?? questsRes.error ?? exercisesRes.error ?? profilesRes.error
        if (firstError) throw firstError

        const profiles = (profilesRes.data as Profile[] | null) ?? []
        let characters: CharacterProfile[] = []
        if (profiles.length > 0) {
          const { data: chars, error: charErr } = await supabase
            .from('character_profiles')
            .select('*')
            .in(
              'user_id',
              profiles.map((p) => p.id),
            )
          if (charErr) throw charErr
          characters = (chars as CharacterProfile[] | null) ?? []
        }

        if (cancelled) return
        setKpis({
          hunters: huntersRes.count ?? 0,
          workouts: workoutsRes.count ?? 0,
          questsCompleted: questsRes.count ?? 0,
          exercises: exercisesRes.count ?? 0,
        })
        setRecent(
          profiles.map((p) => ({
            profile: p,
            character: characters.find((c) => c.user_id === p.id) ?? null,
          })),
        )
      } catch {
        if (!cancelled) setError('The System could not retrieve administration data. Try again shortly.')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const tiles = [
    { label: 'Total Ascendants', value: kpis?.hunters, icon: Users },
    { label: 'Workouts Logged', value: kpis?.workouts, icon: Swords },
    { label: 'Quests Completed', value: kpis?.questsCompleted, icon: ScrollText },
    { label: 'Exercises', value: kpis?.exercises, icon: Dumbbell },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        <h1 className="flex items-center gap-2.5 font-display text-base font-bold tracking-[0.28em] text-gold uppercase text-glow-gold sm:text-lg">
          <ShieldCheck size={20} className="shrink-0" />
          System Administration
        </h1>
        <p className="mt-1 text-sm text-mute">Command console — the System answers to you here, Administrator.</p>
      </motion.header>

      {error && (
        <p className="rounded-md border border-danger/40 bg-red-950/30 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut, delay: 0.05 + i * 0.06 }}
            className="glass clip-system relative overflow-hidden rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-gold/80">
              <t.icon size={16} />
              <span className="font-display text-[0.58rem] font-bold tracking-[0.22em] uppercase">{t.label}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              {t.value === undefined ? <span className="text-mute/50">—</span> : t.value.toLocaleString()}
            </p>
            <div className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-gold/10 blur-2xl" />
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <SystemPanel title="Administration Modules" icon={<ShieldCheck size={14} className="text-gold" />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((l, i) => (
            <motion.div
              key={l.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: easeOut, delay: 0.1 + i * 0.07 }}
            >
              <Link
                to={l.to}
                className="group flex min-h-[64px] items-center gap-3 rounded-md border border-line/70 bg-abyss/60 p-3.5 transition-all hover:border-gold/50 hover:bg-gold/5 hover:shadow-[0_0_16px_rgba(251,191,36,0.15)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gold/30 bg-gold/10 text-gold">
                  <l.icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[0.68rem] font-bold tracking-[0.18em] text-ink uppercase">
                    {l.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-mute">{l.desc}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-mute transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
              </Link>
            </motion.div>
          ))}
        </div>
      </SystemPanel>

      {/* Recent ascendants */}
      <SystemPanel title="Recently Ascended" icon={<Users size={14} className="text-gold" />}>
        {recent === null && !error ? (
          <InlineLoader label="Scanning registry" />
        ) : !recent || recent.length === 0 ? (
          <EmptyState
            icon={<Users size={30} />}
            title="No Ascendants yet"
            hint="New Ascendants will appear here as soon as they ascend."
          />
        ) : (
          <ul className="divide-y divide-line/50">
            {recent.map(({ profile, character }, i) => {
              const rank = character ? rankById(character.rank) : null
              return (
                <motion.li
                  key={profile.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: easeOut, delay: 0.12 + i * 0.05 }}
                  className="flex min-h-[56px] items-center gap-3 py-2.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-abyss font-display text-xs font-bold text-glow-soft">
                    {(profile.display_name ?? 'A').slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-ink">
                        {profile.display_name ?? 'Unnamed Ascendant'}
                      </span>
                      {profile.role === 'admin' && (
                        <span className="shrink-0 rounded-full border border-gold/50 bg-gold/10 px-2 py-px font-display text-[0.52rem] font-bold tracking-[0.2em] text-gold uppercase">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[0.7rem] text-mute">
                      Joined{' '}
                      {new Date(profile.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {character && (
                      <span className="font-display text-[0.66rem] font-bold tracking-[0.15em] text-glow-soft">
                        LV.{character.level}
                      </span>
                    )}
                    {rank ? (
                      <span
                        className="rounded-full border px-2 py-0.5 font-display text-[0.56rem] font-bold tracking-[0.18em] uppercase"
                        style={{ borderColor: `${rank.color}66`, color: rank.color }}
                      >
                        {rank.label}
                      </span>
                    ) : (
                      <span className="rounded-full border border-line px-2 py-0.5 font-display text-[0.56rem] font-bold tracking-[0.18em] text-mute uppercase">
                        Unascended
                      </span>
                    )}
                  </div>
                </motion.li>
              )
            })}
          </ul>
        )}
      </SystemPanel>
    </div>
  )
}
