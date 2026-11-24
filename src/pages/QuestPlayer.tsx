import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  CheckCircle2,
  Compass,
  Swords,
  TimerReset,
  Trophy,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Exercise, Quest, QuestType } from '../lib/types'
import { awardXp } from '../store/progress'
import { useAuth } from '../store/auth'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { InlineLoader } from '../components/system/Loader'
import { EmptyState } from '../components/system/EmptyState'
import { ExerciseVisual } from '../components/ExerciseVisual'

const easeOut = [0.22, 1, 0.36, 1] as const

const TYPE_BADGE: Record<QuestType, { label: string; cls: string }> = {
  daily: { label: 'Daily Quest', cls: 'border-sky-400/50 bg-sky-500/10 text-sky-300' },
  weekly: { label: 'Weekly Quest', cls: 'border-violet-400/50 bg-violet-500/10 text-violet-300' },
  boss: { label: 'Boss Quest', cls: 'border-red-400/50 bg-red-500/10 text-red-300' },
  trial: { label: 'Trial', cls: 'border-amber-400/50 bg-amber-500/10 text-amber-300' },
}

const DIFF_CLS: Record<string, string> = {
  beginner: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  intermediate: 'border-sky-400/40 bg-sky-500/10 text-sky-300',
  advanced: 'border-red-400/40 bg-red-500/10 text-red-300',
}

const REST_SECONDS = 60

function RestTimer() {
  const [left, setLeft] = useState(0)
  const running = left > 0

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left, running])

  const r = 24
  const circ = 2 * Math.PI * r
  const pct = running ? left / REST_SECONDS : 1

  return (
    <button
      onClick={() => setLeft(running ? 0 : REST_SECONDS)}
      className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 transition-all ${
        running
          ? 'border-sky-400/50 bg-sky-500/10 shadow-[0_0_16px_rgba(56,189,248,0.2)]'
          : 'border-line bg-abyss/60 hover:border-sky-400/40'
      }`}
    >
      <span className="flex items-center gap-2 font-display text-[0.68rem] font-bold tracking-[0.22em] text-glow-soft uppercase">
        <TimerReset size={15} className={running ? 'text-sky-300' : 'text-mute'} />
        {running ? 'Resting — tap to reset' : 'Rest Timer · 60s'}
      </span>
      <span className="relative inline-flex h-12 w-12 items-center justify-center">
        <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(28,52,82,0.9)" strokeWidth="4" />
          <motion.circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: running ? 1 : 0.3, ease: 'linear' }}
            style={{ filter: 'drop-shadow(0 0 5px rgba(56,189,248,0.8))' }}
          />
        </svg>
        <span className={`font-display text-[0.72rem] font-black tracking-wider ${running ? 'text-sky-200' : 'text-mute'}`}>
          {running ? left : 60}
        </span>
      </span>
    </button>
  )
}

function SafetyNote({ category }: { category: Exercise['category'] }) {
  if (category === 'breath') {
    return (
      <p className="flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-500/10 p-2.5 text-[0.75rem] text-amber-200/90">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        Never practice breath-holds in or near water or while driving. Stop immediately and sit down if you feel dizzy or lightheaded.
      </p>
    )
  }
  if (category === 'martial') {
    return (
      <p className="flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-500/10 p-2.5 text-[0.75rem] text-amber-200/90">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        Technique for fitness and self-protection. Spar only under a qualified coach. Never use to instigate violence.
      </p>
    )
  }
  return null
}

export default function QuestPlayer() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()

  const [quest, setQuest] = useState<Quest | null>(null)
  const [exercises, setExercises] = useState<Record<string, Exercise>>({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [done, setDone] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [justCleared, setJustCleared] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: qErr } = await supabase.from('quests').select('*').eq('id', id).maybeSingle()
        if (qErr) throw qErr
        if (cancelled) return
        if (!data) {
          setNotFound(true)
          return
        }
        const q = data as Quest
        setQuest(q)
        setDone(Object.fromEntries(q.objectives.map((o) => [o.id, o.done])))
        if (q.status === 'completed') setCleared(true)

        const exIds = [...new Set(q.objectives.map((o) => o.exercise_id).filter((v): v is string => !!v))]
        if (exIds.length) {
          const { data: exs, error: exErr } = await supabase.from('exercises').select('*').in('id', exIds)
          if (exErr) throw exErr
          if (!cancelled && exs) {
            setExercises(Object.fromEntries((exs as Exercise[]).map((e) => [e.id, e])))
          }
        }
      } catch {
        if (!cancelled) setError('The System failed to retrieve this quest. Try again shortly.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const total = quest?.objectives.length ?? 0
  const doneCount = useMemo(
    () => (quest ? quest.objectives.filter((o) => done[o.id]).length : 0),
    [quest, done],
  )
  const allDone = total > 0 && doneCount === total

  const toggle = (objectiveId: string) => {
    if (cleared || completing) return
    setDone((d) => ({ ...d, [objectiveId]: !d[objectiveId] }))
  }

  const completeQuest = async () => {
    if (!quest || !session || !allDone || completing || cleared) return
    setCompleting(true)
    setError(null)
    try {
      const updatedObjectives = quest.objectives.map((o) => ({ ...o, done: !!done[o.id] }))
      const completedAt = new Date().toISOString()
      const { error: upErr } = await supabase
        .from('quests')
        .update({ status: 'completed', completed_at: completedAt, objectives: updatedObjectives })
        .eq('id', quest.id)
      if (upErr) throw upErr

      const { error: logErr } = await supabase.from('workout_logs').insert({
        user_id: session.user.id,
        quest_id: quest.id,
        exercise_name: quest.title,
        xp_earned: quest.xp_reward,
        sets: [],
      })
      if (logErr) throw logErr

      await awardXp(quest.xp_reward, quest.stat_rewards)

      setQuest({ ...quest, status: 'completed', completed_at: completedAt, objectives: updatedObjectives })
      setJustCleared(true)
      setCleared(true)
    } catch {
      setError('The System could not record your completion. Check your connection and try again.')
    } finally {
      setCompleting(false)
    }
  }

  // ---------- Loading / guard states ----------
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <InlineLoader label="Opening quest" />
      </div>
    )
  }

  if (notFound || !quest) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <SystemPanel>
          <EmptyState
            icon={<Compass size={32} />}
            title="Quest not found"
            hint="This directive does not exist in your record — it may have expired or belongs to another Ascendant."
            action={
              <Link to="/app">
                <GlowButton variant="ghost" icon={<ArrowLeft size={15} />}>
                  Return to Command
                </GlowButton>
              </Link>
            }
          />
        </SystemPanel>
      </div>
    )
  }

  const badge = TYPE_BADGE[quest.type]

  // ---------- Cleared state ----------
  if (cleared) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <SystemPanel className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="flex flex-col items-center gap-4 py-8 sm:py-12"
          >
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
              className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400/60 bg-amber-500/10"
              style={{ boxShadow: '0 0 30px rgba(251,191,36,0.35)' }}
            >
              <Trophy size={36} className="text-gold" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))' }} />
            </motion.span>
            <div>
              <p className="font-display text-3xl font-black tracking-[0.12em] text-gold text-glow-gold sm:text-4xl">
                +{quest.xp_reward} XP
              </p>
              <p className="mt-2 font-display text-sm font-bold tracking-[0.28em] text-ink uppercase">
                Quest cleared, Ascendant.
              </p>
              <p className="mt-1 text-sm text-mute">
                {justCleared
                  ? 'The System has recorded your victory. The climb continues.'
                  : 'This directive has already been completed. Rest well — the climb continues.'}
              </p>
            </div>
            <p className="font-display text-[0.62rem] font-bold tracking-[0.3em] text-mute uppercase">
              {quest.title} · {badge.label}
            </p>
            <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row">
              <Link to="/app">
                <GlowButton variant="gold" icon={<ArrowLeft size={15} />}>
                  Return to Command
                </GlowButton>
              </Link>
            </div>
          </motion.div>
        </SystemPanel>
      </div>
    )
  }

  // ---------- Active quest ----------
  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easeOut }}>
        <Link
          to="/app"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[0.72rem] font-bold tracking-[0.2em] text-mute uppercase transition hover:text-sky-300"
        >
          <ArrowLeft size={15} /> Command
        </Link>
      </motion.div>

      {/* ---------- Progress header ---------- */}
      <SystemPanel title={badge.label} icon={<Swords size={13} />}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="font-display text-lg font-black tracking-[0.08em] text-ink uppercase sm:text-xl">{quest.title}</h1>
            {quest.description && <p className="mt-1 text-sm text-mute">{quest.description}</p>}
          </div>
          <span className="shrink-0 font-display text-[0.85rem] font-black tracking-[0.1em] text-gold text-glow-gold">
            +{quest.xp_reward} XP
          </span>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[0.68rem] font-bold tracking-[0.2em] uppercase">
            <span className="text-glow-soft">
              {doneCount}/{total} objectives
            </span>
            <span className="text-mute">{total ? Math.round((doneCount / total) * 100) : 0}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full border border-line/70 bg-void">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400"
              style={{ boxShadow: '0 0 10px rgba(56,189,248,0.7)' }}
              initial={{ width: 0 }}
              animate={{ width: `${total ? Math.max(2, (doneCount / total) * 100) : 0}%` }}
              transition={{ duration: 0.6, ease: easeOut }}
            />
          </div>
        </div>
      </SystemPanel>

      {/* ---------- Objectives ---------- */}
      <SystemPanel title="Objectives" icon={<Check size={13} />}>
        <div className="space-y-2.5">
          {quest.objectives.map((o, i) => {
            const ex = o.exercise_id ? exercises[o.exercise_id] : undefined
            const isDone = !!done[o.id]
            const isOpen = expanded === o.id
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.06, ease: easeOut }}
                className={`overflow-hidden rounded-lg border transition-colors ${
                  isDone ? 'border-success/30 bg-emerald-500/[0.05]' : 'border-line bg-abyss/60'
                }`}
              >
                <div className="flex items-stretch">
                  <button
                    onClick={() => toggle(o.id)}
                    aria-label={isDone ? `Mark ${o.label} incomplete` : `Mark ${o.label} complete`}
                    className="flex min-h-[52px] min-w-[52px] items-center justify-center"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                        isDone
                          ? 'border-success bg-success/20 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                          : 'border-line bg-void hover:border-sky-400/60'
                      }`}
                    >
                      {isDone && <Check size={15} className="text-success" strokeWidth={3} />}
                    </span>
                  </button>
                  <button
                    onClick={() => (ex ? setExpanded(isOpen ? null : o.id) : toggle(o.id))}
                    className="flex min-h-[52px] flex-1 items-center justify-between gap-2 py-2 pr-3 text-left"
                  >
                    <span className="min-w-0">
                      <span className={`block text-[0.92rem] font-semibold ${isDone ? 'text-mute line-through decoration-mute/40' : 'text-ink'}`}>
                        {o.label}
                      </span>
                      {o.target && (
                        <span className="block text-[0.72rem] font-bold tracking-[0.15em] text-sky-300/80 uppercase">{o.target}</span>
                      )}
                    </span>
                    {ex && (
                      <ChevronDown
                        size={17}
                        className={`shrink-0 text-mute transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-300' : ''}`}
                      />
                    )}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {ex && isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: easeOut }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 border-t border-line/60 p-3 sm:p-4">
                        <ExerciseVisual exercise={ex} className="mx-auto max-w-sm" />
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-sm border px-1.5 py-0.5 font-display text-[0.55rem] font-bold tracking-[0.25em] uppercase ${DIFF_CLS[ex.difficulty] ?? DIFF_CLS.beginner}`}
                          >
                            {ex.difficulty}
                          </span>
                          <span className="rounded-sm border border-line bg-void px-1.5 py-0.5 font-display text-[0.55rem] font-bold tracking-[0.25em] text-mute uppercase">
                            {ex.category}
                          </span>
                        </div>
                        {ex.description && <p className="text-[0.85rem] leading-relaxed text-mute">{ex.description}</p>}
                        {ex.cues.length > 0 && (
                          <div>
                            <p className="mb-1.5 font-display text-[0.6rem] font-bold tracking-[0.28em] text-glow-soft uppercase">
                              Form Cues
                            </p>
                            <ul className="space-y-1">
                              {ex.cues.map((cue) => (
                                <li key={cue} className="flex items-start gap-2 text-[0.82rem] text-ink/85">
                                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sky-400" style={{ boxShadow: '0 0 5px rgba(56,189,248,0.8)' }} />
                                  {cue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <SafetyNote category={ex.category} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </SystemPanel>

      {/* ---------- Rest timer ---------- */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2, ease: easeOut }}>
        <RestTimer />
      </motion.div>

      {/* ---------- Complete ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: easeOut }}
        className="space-y-2"
      >
        {error && <p className="text-center text-sm text-danger">{error}</p>}
        <GlowButton
          variant="gold"
          size="lg"
          full
          disabled={!allDone}
          loading={completing}
          onClick={() => void completeQuest()}
          icon={<CheckCircle2 size={17} />}
        >
          Complete Quest
        </GlowButton>
        {!allDone && (
          <p className="text-center text-[0.75rem] text-mute">
            Clear all objectives to claim your reward, Ascendant.
          </p>
        )}
      </motion.div>
    </div>
  )
}
