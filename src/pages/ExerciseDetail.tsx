import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  Crosshair,
  Sparkles,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Difficulty, Exercise, StatKey } from '../lib/types'
import { STAT_META } from '../lib/game'
import { useAuth } from '../store/auth'
import { awardXp } from '../store/progress'
import { ExerciseVisual } from '../components/ExerciseVisual'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { EmptyState } from '../components/system/EmptyState'
import { InlineLoader } from '../components/system/Loader'

const EASE = [0.22, 1, 0.36, 1] as const

const DIFFICULTY_PIPS: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3 }

const SAFETY_NOTES: Partial<Record<Exercise['category'], string>> = {
  breath:
    'Never practice breath-holds in or near water, or while driving. Stop immediately and sit down if you feel dizzy or lightheaded.',
  martial:
    'Technique for fitness and self-protection only. Spar only under a qualified coach. Never use your training to instigate violence.',
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} sec`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m} min ${s} sec` : `${m} min`
}

function DifficultyPips({ difficulty }: { difficulty: Difficulty }) {
  const filled = DIFFICULTY_PIPS[difficulty]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-abyss/60 px-2.5 py-1">
      <span className="flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i <= filled ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]' : 'bg-line'
            }`}
          />
        ))}
      </span>
      <span className="text-[0.62rem] font-semibold tracking-[0.18em] text-mute uppercase">{difficulty}</span>
    </span>
  )
}

function StatChip({ stat }: { stat: StatKey }) {
  const meta = STAT_META[stat]
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 font-display text-[0.6rem] font-bold tracking-[0.16em] uppercase"
      style={{ color: meta.color, borderColor: `${meta.color}55`, backgroundColor: `${meta.color}14` }}
    >
      {stat} · {meta.label}
    </span>
  )
}

function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-abyss/60 px-2.5 py-1 text-xs text-ink/85 capitalize">
      {children}
    </span>
  )
}

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Quick log form
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('')
  const [minutes, setMinutes] = useState('5')
  const [submitting, setSubmitting] = useState(false)
  const [logError, setLogError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const flashTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      const { data, error: err } = await supabase.from('exercises').select('*').eq('id', id).maybeSingle()
      if (cancelled) return
      if (err) {
        setError(err.message)
      } else {
        const ex = (data as Exercise) ?? null
        setExercise(ex)
        if (ex) {
          setSets(String(ex.default_sets ?? 3))
          const firstRep = ex.default_reps?.match(/\d+/)?.[0]
          setReps(firstRep ?? '10')
          setMinutes(ex.duration_sec ? String(Math.max(1, Math.round(ex.duration_sec / 60))) : '5')
        }
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const durationMode =
    !!exercise && (exercise.category === 'breath' || exercise.category === 'yoga' || exercise.duration_sec !== null)

  const prescription = exercise
    ? exercise.default_sets && exercise.default_reps
      ? `${exercise.default_sets} × ${exercise.default_reps}`
      : exercise.duration_sec
        ? formatDuration(exercise.duration_sec)
        : "Ascendant's discretion"
    : ''

  const handleLog = async () => {
    if (!exercise || !session?.user) return
    setLogError(null)

    let payload: Record<string, unknown>
    if (durationMode) {
      const mins = Number(minutes)
      if (!Number.isFinite(mins) || mins <= 0) {
        setLogError('Enter the minutes you trained.')
        return
      }
      payload = { sets: [], duration_min: Math.round(mins) }
    } else {
      const s = Number(sets)
      const r = Number(reps)
      if (!Number.isInteger(s) || s <= 0 || !Number.isInteger(r) || r <= 0) {
        setLogError('Enter your sets and reps to record the log.')
        return
      }
      const w = weight.trim() === '' ? null : Number(weight)
      if (w !== null && (!Number.isFinite(w) || w < 0)) {
        setLogError('Weight must be a positive number (or leave it blank).')
        return
      }
      const setEntries: Array<{ reps: number; weight_kg?: number }> = Array.from({ length: s }, () =>
        w !== null ? { reps: r, weight_kg: w } : { reps: r },
      )
      payload = { sets: setEntries }
    }

    setSubmitting(true)
    try {
      const { error: insertError } = await supabase.from('workout_logs').insert({
        user_id: session.user.id,
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        xp_earned: exercise.base_xp,
        ...payload,
      })
      if (insertError) throw new Error(insertError.message)

      const rewards: Partial<Record<StatKey, number>> = {}
      rewards[exercise.stat_focus] = 1
      await awardXp(exercise.base_xp, rewards)

      setFlash(`+${exercise.base_xp} XP · ${exercise.stat_focus} +1`)
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => setFlash(null), 4500)
    } catch (e) {
      setLogError(e instanceof Error ? e.message : 'The System could not record this log. Try again, Ascendant.')
    } finally {
      setSubmitting(false)
    }
  }

  const safetyNote = exercise ? SAFETY_NOTES[exercise.category] : undefined

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        to="/app/exercises"
        className="inline-flex min-h-11 items-center gap-2 text-[0.7rem] font-bold tracking-[0.22em] text-mute uppercase transition-colors hover:text-sky-200"
      >
        <ArrowLeft size={15} />
        Back to Library
      </Link>

      {loading ? (
        <InlineLoader label="Retrieving protocol" />
      ) : error ? (
        <div className="glass rounded-lg p-4">
          <p className="text-sm text-danger">The archive could not be reached: {error}</p>
        </div>
      ) : !exercise ? (
        <div className="glass clip-system rounded-lg">
          <EmptyState
            icon={<XCircle size={40} />}
            title="Protocol not found"
            hint="This exercise is not in the archive, or has not yet been published by the System."
            action={
              <Link to="/app/exercises">
                <GlowButton variant="ghost" size="sm">
                  Return to Library
                </GlowButton>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {/* ---------- Hero: visual + overview ---------- */}
          <SystemPanel>
            <div className="grid gap-5 md:grid-cols-2 md:items-start">
              <ExerciseVisual exercise={exercise} className="w-full" />
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-xl font-bold tracking-[0.14em] text-ink uppercase text-glow sm:text-2xl">
                    {exercise.name}
                  </h1>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-sky-400/40 bg-sky-500/10 px-2.5 py-1 font-display text-[0.6rem] font-bold tracking-[0.18em] text-sky-200 uppercase">
                      {exercise.category}
                    </span>
                    <DifficultyPips difficulty={exercise.difficulty} />
                    <StatChip stat={exercise.stat_focus} />
                  </div>
                </div>

                {exercise.description && <p className="text-sm leading-relaxed text-ink/85">{exercise.description}</p>}

                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[0.62rem] font-bold tracking-[0.25em] text-mute uppercase">
                    <Crosshair size={12} /> Target
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {exercise.muscles.length > 0 ? (
                      exercise.muscles.map((m) => <TagChip key={m}>{m}</TagChip>)
                    ) : (
                      <span className="text-xs text-mute">Full body</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[0.62rem] font-bold tracking-[0.25em] text-mute uppercase">Equipment</p>
                  <div className="flex flex-wrap gap-1.5">
                    {exercise.equipment.length > 0 ? (
                      exercise.equipment.map((eq) => <TagChip key={eq}>{eq}</TagChip>)
                    ) : (
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-xs text-success">
                        No equipment
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3.5">
                  <div>
                    <p className="text-[0.62rem] font-bold tracking-[0.25em] text-mute uppercase">Prescription</p>
                    <p className="font-display text-sm font-bold tracking-[0.12em] text-glow-soft">{prescription}</p>
                  </div>
                  <span className="font-display text-lg font-bold tracking-[0.15em] text-gold text-glow-gold">
                    +{exercise.base_xp} XP
                  </span>
                </div>
              </div>
            </div>
          </SystemPanel>

          {/* ---------- Safety directive ---------- */}
          {safetyNote && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
              className="flex items-start gap-3 rounded-lg border border-amber-400/50 bg-amber-500/10 p-4"
              role="alert"
            >
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-300" />
              <div>
                <p className="font-display text-[0.68rem] font-bold tracking-[0.25em] text-amber-300 uppercase">
                  Safety Directive
                </p>
                <p className="mt-1 text-sm leading-relaxed text-amber-100/90">{safetyNote}</p>
              </div>
            </motion.div>
          )}

          {/* ---------- Cues & mistakes ---------- */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <SystemPanel title="Form Cues" icon={<CheckCircle2 size={14} className="text-sky-300" />}>
              {exercise.cues.length > 0 ? (
                <ul className="space-y-2.5">
                  {exercise.cues.map((cue, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.08 + i * 0.06, ease: EASE }}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/90"
                    >
                      <Check size={16} className="mt-0.5 shrink-0 text-sky-400" />
                      {cue}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-mute">No cues recorded for this protocol yet.</p>
              )}
            </SystemPanel>

            <SystemPanel title="Common Mistakes" icon={<XCircle size={14} className="text-danger" />}>
              {exercise.mistakes.length > 0 ? (
                <ul className="space-y-2.5">
                  {exercise.mistakes.map((mistake, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.08 + i * 0.06, ease: EASE }}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/90"
                    >
                      <X size={16} className="mt-0.5 shrink-0 text-danger" />
                      {mistake}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-mute">No common mistakes recorded for this protocol yet.</p>
              )}
            </SystemPanel>
          </div>

          {/* ---------- Quick log ---------- */}
          <SystemPanel title="Quick Log" icon={<ClipboardList size={14} className="text-sky-300" />}>
            <div className="space-y-4">
              <p className="text-sm text-mute">
                Record a completed session and the System will credit your growth.
                {prescription !== "Ascendant's discretion" && (
                  <>
                    {' '}
                    Prescribed: <span className="font-semibold text-glow-soft">{prescription}</span>.
                  </>
                )}
              </p>

              <AnimatePresence>
                {flash && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex items-center gap-2.5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3"
                  >
                    <Sparkles size={17} className="shrink-0 text-success" />
                    <span className="font-display text-sm font-bold tracking-[0.18em] text-success uppercase">
                      {flash}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {durationMode ? (
                <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                  <div>
                    <label htmlFor="ql-minutes" className="sys-label">
                      Minutes
                    </label>
                    <input
                      id="ql-minutes"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      className="sys-input"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:max-w-lg sm:grid-cols-3">
                  <div>
                    <label htmlFor="ql-sets" className="sys-label">
                      Sets
                    </label>
                    <input
                      id="ql-sets"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      className="sys-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="ql-reps" className="sys-label">
                      Reps
                    </label>
                    <input
                      id="ql-reps"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="sys-input"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="ql-weight" className="sys-label">
                      Weight kg <span className="normal-case">(optional)</span>
                    </label>
                    <input
                      id="ql-weight"
                      type="number"
                      min={0}
                      step={0.5}
                      inputMode="decimal"
                      placeholder="—"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="sys-input"
                    />
                  </div>
                </div>
              )}

              {logError && <p className="text-sm text-danger">{logError}</p>}

              <GlowButton
                onClick={handleLog}
                loading={submitting}
                icon={<Zap size={15} />}
                className="w-full sm:w-auto"
              >
                Log Training · +{exercise.base_xp} XP
              </GlowButton>
            </div>
          </SystemPanel>
        </>
      )}
    </div>
  )
}
