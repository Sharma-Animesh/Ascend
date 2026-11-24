import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  LineChart,
  Megaphone,
  Sparkles,
  Swords,
  Target,
  TreePine,
  Utensils,
  X,
  Zap,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Announcement, Quest, QuestType } from '../lib/types'
import { archetypeById, classById, rankById } from '../lib/game'
import { ensureDailyQuests } from '../lib/quests'
import { effectiveStreak, groveState } from '../lib/streak'
import { useAuth } from '../store/auth'
import { SystemPanel } from '../components/system/SystemPanel'
import { XPBar } from '../components/system/XPBar'
import { InlineLoader } from '../components/system/Loader'
import { EmptyState } from '../components/system/EmptyState'
import { Emblem } from '../components/system/Emblem'

const SEEN_KEY = 'ascend_seen_announcements'

function loadSeen(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

const TYPE_BADGE: Record<QuestType, { label: string; cls: string }> = {
  daily: { label: 'Daily', cls: 'border-sky-400/50 bg-sky-500/10 text-sky-300' },
  weekly: { label: 'Weekly', cls: 'border-violet-400/50 bg-violet-500/10 text-violet-300' },
  boss: { label: 'Boss', cls: 'border-red-400/50 bg-red-500/10 text-red-300' },
  trial: { label: 'Trial', cls: 'border-amber-400/50 bg-amber-500/10 text-amber-300' },
}

const QUICK_LINKS = [
  { to: '/app/goals', label: 'Goals', icon: Target, desc: 'Set your targets' },
  { to: '/app/progress', label: 'Progress', icon: LineChart, desc: 'Track the climb' },
  { to: '/app/nutrition', label: 'Fuel', icon: Utensils, desc: 'Log your intake' },
]

const easeOut = [0.22, 1, 0.36, 1] as const

export default function Dashboard() {
  const { profile, character } = useAuth()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<string[]>(loadSeen)

  const [quests, setQuests] = useState<Quest[]>([])
  const [questsLoading, setQuestsLoading] = useState(true)
  const [questsError, setQuestsError] = useState<string | null>(null)
  const [hasExercises, setHasExercises] = useState(true)

  const [activeDays, setActiveDays] = useState<Set<string>>(new Set())

  const userId = character?.user_id

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
      if (!cancelled && data) setAnnouncements(data as Announcement[])
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    void (async () => {
      setQuestsLoading(true)
      setQuestsError(null)
      try {
        const char = useAuth.getState().character
        if (!char) return
        const { data: assessments } = await supabase
          .from('assessments')
          .select('equipment')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
        const equipment: string[] = assessments?.[0]?.equipment ?? []
        const todays = await ensureDailyQuests(char, equipment)
        if (cancelled) return
        setQuests(todays)
        if (todays.length === 0) {
          const { count } = await supabase
            .from('exercises')
            .select('id', { count: 'exact', head: true })
            .eq('published', true)
          if (!cancelled) setHasExercises((count ?? 0) > 0)
        }
      } catch {
        if (!cancelled) setQuestsError('The System failed to retrieve today’s directives. Try again shortly.')
      } finally {
        if (!cancelled) setQuestsLoading(false)
      }
    })()

    void (async () => {
      const from = new Date()
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      const { data } = await supabase
        .from('workout_logs')
        .select('logged_at')
        .eq('user_id', userId)
        .gte('logged_at', from.toISOString())
      if (!cancelled && data) {
        setActiveDays(new Set(data.map((r: { logged_at: string }) => r.logged_at.slice(0, 10))))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  const dismiss = (id: string) => {
    const next = [...new Set([...dismissed, id])]
    setDismissed(next)
    localStorage.setItem(SEEN_KEY, JSON.stringify(next))
  }

  const visibleAnnouncements = announcements.filter((a) => !dismissed.includes(a.id))

  const week = useMemo(() => {
    const days: Array<{ key: string; initial: string; isToday: boolean }> = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        key: d.toISOString().slice(0, 10),
        initial: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
        isToday: i === 0,
      })
    }
    return days
  }, [])

  const hasGap = week.some((d) => !d.isToday && !activeDays.has(d.key))

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const cls = classById(character?.class ?? null)
  const arch = archetypeById(character?.archetype ?? null)
  const rank = character ? rankById(character.rank) : null

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ---------- Header ---------- */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <p className="font-display text-[0.6rem] font-bold tracking-[0.35em] text-mute uppercase">{today}</p>
        <h1 className="mt-1 font-display text-xl font-black tracking-[0.08em] text-ink uppercase sm:text-2xl">
          Welcome back, Ascendant{' '}
          <span className="text-glow-soft text-glow">{profile?.display_name ?? ''}</span>
        </h1>
        <p className="mt-1 text-sm text-mute">The System has logged your return. Today’s directives await.</p>
      </motion.header>

      {/* ---------- Announcements ---------- */}
      {visibleAnnouncements.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: easeOut }}
          className="glow-border relative flex items-start gap-3 rounded-lg bg-sky-500/[0.07] p-3.5 sm:p-4"
        >
          <Megaphone size={18} className="mt-0.5 shrink-0 text-sky-300" style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.7))' }} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[0.72rem] font-bold tracking-[0.22em] text-sky-200 uppercase">
              {a.title}
            </p>
            {a.body && <p className="mt-0.5 text-sm text-glow-soft/90">{a.body}</p>}
          </div>
          <button
            onClick={() => dismiss(a.id)}
            aria-label="Dismiss announcement"
            className="-m-2 shrink-0 rounded p-2.5 text-mute transition hover:text-ink"
          >
            <X size={16} />
          </button>
        </motion.div>
      ))}

      {/* ---------- Character panel ---------- */}
      {character && (
        <SystemPanel title="Ascendant Status" icon={<Sparkles size={13} />}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-4">
              <Emblem id={arch?.id ?? cls?.id ?? 'blade'} size={64} active />
              <div>
                <p className="font-display text-base font-black tracking-[0.12em] text-ink uppercase">
                  {cls?.name ?? 'Unclassed'}
                </p>
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-mute uppercase">
                  {arch ? `${arch.name} Path` : 'Path undecided'}
                </p>
                <div className="mt-1.5 flex items-center gap-2.5">
                  {rank && (
                    <span
                      className="rounded-full border px-2.5 py-0.5 font-display text-[0.6rem] font-bold tracking-[0.2em]"
                      style={{
                        borderColor: `${rank.color}66`,
                        color: rank.color,
                        boxShadow: `0 0 10px ${rank.color}33`,
                      }}
                    >
                      {rank.label}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[0.75rem] font-bold text-orange-300">
                    <Flame size={13} style={{ filter: 'drop-shadow(0 0 5px rgba(251,146,60,0.8))' }} />
                    {effectiveStreak(character)} day{effectiveStreak(character) === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <XPBar xp={character.xp} />
              {character.unspent_points > 0 && (
                <Link
                  to="/app/stats"
                  className="animate-pulse-glow mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[0.72rem] font-bold tracking-[0.16em] text-gold uppercase transition hover:bg-amber-500/20"
                >
                  <Zap size={14} />
                  You have {character.unspent_points} unallocated stat point{character.unspent_points === 1 ? '' : 's'}
                  <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </SystemPanel>
      )}

      {/* ---------- Streak Grove ---------- */}
      {character &&
        (() => {
          const grove = groveState(character)
          const tint =
            grove.health === 'healthy' ? '#4ade80' : grove.health === 'thirsty' ? '#fbbf24' : '#8ba3c7'
          return (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <Link
                to="/app/grove"
                className="glass clip-system group flex min-h-[44px] items-center gap-3 rounded-lg px-3.5 py-3 transition-all hover:border-emerald-400/40 hover:shadow-[0_0_16px_rgba(74,222,128,0.15)] sm:px-4"
              >
                <TreePine
                  size={20}
                  className="shrink-0"
                  style={{ color: tint, filter: `drop-shadow(0 0 6px ${tint}99)` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[0.72rem] font-bold tracking-[0.16em] text-ink uppercase">
                    {effectiveStreak(character)} day streak · {grove.stageName}
                  </p>
                  <p className="truncate text-[0.7rem] text-mute">
                    {grove.nextMilestone
                      ? `Next: ${grove.nextMilestone.label} at day ${grove.nextMilestone.at}`
                      : 'The grove stands complete.'}
                  </p>
                </div>
                <span className="shrink-0 font-display text-[0.6rem] font-bold tracking-[0.2em] text-sky-300 uppercase transition group-hover:text-sky-200">
                  View grove
                </span>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-mute transition group-hover:translate-x-0.5 group-hover:text-sky-300"
                />
              </Link>
            </motion.div>
          )
        })()}

      {/* ---------- Today's quests ---------- */}
      <SystemPanel title="Today’s Quests" icon={<Swords size={13} />}>
        {questsLoading ? (
          <InlineLoader label="Receiving directives" />
        ) : questsError ? (
          <p className="py-4 text-center text-sm text-danger">{questsError}</p>
        ) : quests.length === 0 ? (
          hasExercises ? (
            <EmptyState
              icon={<Swords size={30} />}
              title="No directives today"
              hint="The System could not assemble a quest from the current library and your equipment. Explore the Library to train freely."
              action={
                <Link to="/app/exercises" className="text-[0.75rem] font-bold tracking-[0.2em] text-sky-300 uppercase hover:text-sky-200">
                  Open the Library →
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={<Dumbbell size={30} />}
              title="The library is empty"
              hint="No exercises exist in the System archive yet. Once training data is forged, your daily quests will appear here."
            />
          )
        ) : (
          <div className="space-y-3">
            {quests.map((q, i) => {
              const total = q.objectives.length
              const done = q.objectives.filter((o) => o.done).length
              const completed = q.status === 'completed'
              const badge = TYPE_BADGE[q.type]
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.08, ease: easeOut }}
                >
                  <Link
                    to={`/app/quests/${q.id}`}
                    className={`clip-system group block rounded-lg border p-3.5 transition-all sm:p-4 ${
                      completed
                        ? 'border-line/50 bg-abyss/40 opacity-60'
                        : 'border-line bg-abyss/70 hover:border-sky-400/50 hover:shadow-[0_0_18px_rgba(56,189,248,0.15)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-sm border px-1.5 py-0.5 font-display text-[0.55rem] font-bold tracking-[0.25em] uppercase ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                          {completed && (
                            <span className="flex items-center gap-1 font-display text-[0.58rem] font-bold tracking-[0.25em] text-success uppercase">
                              <CheckCircle2 size={12} /> Cleared
                            </span>
                          )}
                        </div>
                        <p
                          className={`mt-1.5 font-display text-[0.85rem] font-bold tracking-[0.1em] uppercase ${
                            completed ? 'text-mute line-through decoration-mute/40' : 'text-ink group-hover:text-sky-200'
                          }`}
                        >
                          {q.title}
                        </p>
                        {q.description && <p className="mt-0.5 line-clamp-2 text-[0.82rem] text-mute">{q.description}</p>}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`font-display text-[0.8rem] font-black tracking-[0.1em] ${completed ? 'text-mute' : 'text-gold text-glow-gold'}`}>
                          +{q.xp_reward} XP
                        </p>
                        <ChevronRight size={16} className="mt-1 ml-auto text-mute transition group-hover:translate-x-0.5 group-hover:text-sky-300" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full border border-line/60 bg-void">
                        <motion.div
                          className={`h-full rounded-full ${completed ? 'bg-success/60' : 'bg-gradient-to-r from-sky-400 to-cyan-300'}`}
                          style={completed ? undefined : { boxShadow: '0 0 8px rgba(56,189,248,0.6)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${total ? (done / total) * 100 : 0}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: easeOut }}
                        />
                      </div>
                      <span className="text-[0.68rem] font-bold tracking-[0.15em] text-mute uppercase">
                        {done}/{total}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </SystemPanel>

      {/* ---------- Last 7 days ---------- */}
      <SystemPanel title="Activity — Last 7 Days" icon={<Flame size={13} />}>
        <div className="flex items-center justify-between gap-1 sm:justify-start sm:gap-4">
          {week.map((d, i) => {
            const active = activeDays.has(d.key)
            return (
              <motion.div
                key={d.key}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.1 + i * 0.05, ease: easeOut }}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={`block h-4 w-4 rounded-full border transition sm:h-5 sm:w-5 ${
                    active ? 'border-sky-300/80 bg-sky-400' : 'border-line bg-abyss'
                  } ${d.isToday && !active ? 'border-sky-400/50' : ''}`}
                  style={active ? { boxShadow: '0 0 12px rgba(56,189,248,0.8)' } : undefined}
                />
                <span className={`text-[0.62rem] font-bold tracking-widest ${d.isToday ? 'text-sky-300' : 'text-mute'}`}>
                  {d.initial}
                </span>
              </motion.div>
            )
          })}
        </div>
        {hasGap && <p className="mt-3 text-[0.8rem] text-mute italic">Recovery days are part of the climb.</p>}
      </SystemPanel>

      {/* ---------- Quick links ---------- */}
      <div className="grid grid-cols-3 gap-3">
        {QUICK_LINKS.map(({ to, label, icon: Icon, desc }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: easeOut }}
          >
            <Link
              to={to}
              className="glass clip-system flex min-h-[44px] flex-col items-center gap-1.5 rounded-lg p-3 text-center transition-all hover:border-sky-400/40 hover:shadow-[0_0_16px_rgba(56,189,248,0.15)] sm:p-4"
            >
              <Icon size={20} className="text-sky-300" style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.5))' }} />
              <span className="font-display text-[0.66rem] font-bold tracking-[0.2em] text-ink uppercase">{label}</span>
              <span className="hidden text-[0.68rem] text-mute sm:block">{desc}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
