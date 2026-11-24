import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Check, Milestone, ScrollText, TreePine } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { GROVE_MILESTONES, groveState, effectiveStreak } from '../lib/streak'
import { useAuth } from '../store/auth'
import { SystemPanel } from '../components/system/SystemPanel'
import { Loader, InlineLoader } from '../components/system/Loader'
import { StreakTree } from '../components/StreakTree'

const easeOut = [0.22, 1, 0.36, 1] as const

type MilestoneStatus = 'reached' | 'next' | 'future'

export default function Grove() {
  const { character } = useAuth()
  const userId = character?.user_id

  const [activeDays, setActiveDays] = useState<Set<string>>(new Set())
  const [weekLoading, setWeekLoading] = useState(true)
  const [weekError, setWeekError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    void (async () => {
      setWeekLoading(true)
      setWeekError(null)
      const from = new Date()
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      const { data, error } = await supabase
        .from('workout_logs')
        .select('logged_at')
        .eq('user_id', userId)
        .gte('logged_at', from.toISOString())
      if (cancelled) return
      if (error) {
        setWeekError('The System could not read this week’s training record.')
      } else if (data) {
        setActiveDays(new Set(data.map((r: { logged_at: string }) => r.logged_at.slice(0, 10))))
      }
      setWeekLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

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

  if (!character) return <Loader label="ENTERING THE GROVE" />

  const grove = groveState(character)
  const streak = effectiveStreak(character)
  const nextIdx = GROVE_MILESTONES.findIndex((m) => m.at > streak)
  const trainedToday = activeDays.has(week[6]!.key)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ---------- Header ---------- */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <p className="font-display text-[0.6rem] font-bold tracking-[0.35em] text-mute uppercase">
          Sanctuary · Discipline Record
        </p>
        <h1 className="mt-1 font-display text-xl font-black tracking-[0.08em] text-ink uppercase sm:text-2xl">
          The Streak <span className="text-glow-soft text-glow">Grove</span>
        </h1>
        <p className="mt-1 text-sm text-mute">
          The System keeps a living record of your consistency. Every day trained, it grows.
        </p>
      </motion.header>

      {/* ---------- Hero: the grove itself ---------- */}
      <SystemPanel title="Your Grove" icon={<TreePine size={13} />}>
        <div className="py-1 sm:px-4 sm:py-4">
          <StreakTree character={character} />
        </div>
      </SystemPanel>

      {/* ---------- The Journey ---------- */}
      <SystemPanel title="The Journey" icon={<Milestone size={13} />}>
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-2 sm:pt-1">
          {/* vertical rail (mobile) */}
          <div className="absolute top-3 bottom-3 left-[11px] w-px bg-line/70 sm:hidden" aria-hidden />
          {/* horizontal rail (desktop) */}
          <div className="absolute top-[15px] right-[8%] left-[8%] hidden h-px bg-line/70 sm:block" aria-hidden />

          {GROVE_MILESTONES.map((m, i) => {
            const status: MilestoneStatus = streak >= m.at ? 'reached' : i === nextIdx ? 'next' : 'future'
            const pct = Math.min(100, (streak / m.at) * 100)
            return (
              <motion.div
                key={m.at}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 + i * 0.06, ease: easeOut }}
                className="relative flex items-start gap-3.5 sm:flex-1 sm:flex-col sm:items-center sm:gap-2.5 sm:text-center"
              >
                {/* dot */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    status === 'reached'
                      ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-300'
                      : status === 'next'
                        ? 'animate-pulse-glow border-sky-400/70 bg-sky-500/10'
                        : 'border-line bg-abyss'
                  }`}
                  style={
                    status === 'reached'
                      ? { boxShadow: '0 0 10px rgba(74,222,128,0.45)' }
                      : status === 'next'
                        ? { boxShadow: '0 0 12px rgba(56,189,248,0.4)' }
                        : undefined
                  }
                >
                  {status === 'reached' ? (
                    <Check size={13} strokeWidth={3} />
                  ) : status === 'next' ? (
                    <span
                      className="h-2 w-2 rounded-full bg-sky-400"
                      style={{ boxShadow: '0 0 8px rgba(56,189,248,0.9)' }}
                    />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-line" />
                  )}
                </span>

                {/* label */}
                <div className="min-w-0 sm:flex sm:flex-col sm:items-center">
                  <p
                    className={`font-display text-[0.66rem] font-bold tracking-[0.14em] uppercase ${
                      status === 'reached' ? 'text-emerald-200' : status === 'next' ? 'text-sky-200' : 'text-mute'
                    }`}
                  >
                    {m.label}
                  </p>
                  <p className={`mt-0.5 text-[0.66rem] font-semibold tracking-[0.18em] uppercase ${status === 'future' ? 'text-mute/60' : 'text-mute'}`}>
                    day {m.at}
                  </p>
                  {status === 'next' && (
                    <div className="mt-1.5 w-36 max-w-full">
                      <div className="h-1 overflow-hidden rounded-full border border-line/60 bg-void">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
                          style={{ boxShadow: '0 0 8px rgba(56,189,248,0.6)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: easeOut }}
                        />
                      </div>
                      <p className="mt-1 text-[0.62rem] font-bold tracking-[0.14em] text-sky-300/90 uppercase">
                        {streak}/{m.at} days
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
        {nextIdx === -1 && (
          <p className="mt-4 text-[0.8rem] text-glow-soft/90 italic">
            Every milestone stands. The grove is complete — now it simply lives, as you do.
          </p>
        )}
      </SystemPanel>

      {/* ---------- This Week ---------- */}
      <SystemPanel title="This Week" icon={<CalendarDays size={13} />}>
        {weekLoading ? (
          <InlineLoader label="Reading the rings" />
        ) : weekError ? (
          <p className="py-4 text-center text-sm text-danger">{weekError}</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-1 sm:justify-start sm:gap-5">
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
                      className={`block h-5 w-5 rounded-full border transition sm:h-6 sm:w-6 ${
                        active ? 'border-emerald-300/80 bg-emerald-400' : 'border-line bg-abyss'
                      } ${d.isToday && !active ? 'border-sky-400/60' : ''}`}
                      style={active ? { boxShadow: '0 0 12px rgba(74,222,128,0.8)' } : undefined}
                    />
                    <span className={`text-[0.62rem] font-bold tracking-widest ${d.isToday ? 'text-sky-300' : 'text-mute'}`}>
                      {d.initial}
                    </span>
                  </motion.div>
                )
              })}
            </div>
            <p className="mt-3 text-[0.8rem] text-mute italic">
              {trainedToday
                ? 'The grove drank today. Well tended, Ascendant.'
                : 'The grove waits for today’s water — one quest is enough.'}
            </p>
          </>
        )}
      </SystemPanel>

      {/* ---------- Lore ---------- */}
      <SystemPanel title="The Grove’s Law" icon={<ScrollText size={13} />}>
        <p className="text-sm leading-relaxed text-glow-soft/90">
          Every Ascendant tends a grove. It does not grow from strength — it grows from returning.
        </p>
        <ul className="mt-3 space-y-2.5">
          <li className="flex items-start gap-2.5 text-[0.82rem] leading-snug text-mute">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400"
              style={{ boxShadow: '0 0 8px rgba(74,222,128,0.7)' }}
            />
            <span>
              <span className="font-semibold text-emerald-200">Green leaves</span> — each day trained, the tree drinks
              and climbs a little higher.
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-[0.82rem] leading-snug text-mute">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400"
              style={{ boxShadow: '0 0 8px rgba(251,191,36,0.7)' }}
            />
            <span>
              <span className="font-semibold text-amber-200">Gold leaves</span> — a grace day. Miss a single day and the
              leaves turn gold; train again and the tree drinks as if you never left.
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-[0.82rem] leading-snug text-mute">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-line bg-abyss" />
            <span>
              <span className="font-semibold text-ink">Withered</span> — after longer rest the tree returns to the
              earth. One quest plants a new sapling, and the forest remembers everything you grew before.
            </span>
          </li>
        </ul>
        <p className="mt-4 text-[0.8rem] text-mute italic">
          Rest is not failure, Ascendant. The grove asks only that you come back.
        </p>
      </SystemPanel>
    </div>
  )
}
