// Goals — "Resolutions": long-horizon vows the System holds until fulfilled.
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Flag,
  Pencil,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { EmptyState } from '../components/system/EmptyState'
import { InlineLoader } from '../components/system/Loader'
import { supabase } from '../lib/supabase'
import type { Goal } from '../lib/types'
import { useAuth } from '../store/auth'
import { awardXp } from '../store/progress'

const EASE = [0.22, 1, 0.36, 1] as const

function sortGoals(list: Goal[]): Goal[] {
  return [...list].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return b.created_at.localeCompare(a.created_at)
  })
}

function fmt(n: number | null): string {
  if (n === null) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

interface DeadlineInfo {
  label: string
  tone: 'ok' | 'soon' | 'past'
}

function deadlineInfo(deadline: string | null): DeadlineInfo | null {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${deadline.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(due.getTime())) return null
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) {
    const past = -days
    return { label: `${past} day${past === 1 ? '' : 's'} past — still within reach`, tone: 'past' }
  }
  if (days === 0) return { label: 'Due today', tone: 'soon' }
  if (days === 1) return { label: '1 day left', tone: 'soon' }
  return { label: `${days} days left`, tone: days <= 7 ? 'soon' : 'ok' }
}

const TONE_CLASS: Record<DeadlineInfo['tone'], string> = {
  ok: 'text-mute',
  soon: 'text-gold',
  past: 'text-arc-soft',
}

/* ---------- Goal card ---------- */

function GoalCard({
  goal,
  index,
  fulfilled,
  onSetValue,
  onComplete,
  onDelete,
}: {
  goal: Goal
  index: number
  /** completed during this session — show the XP flash */
  fulfilled: boolean
  onSetValue: (value: number) => Promise<void>
  onComplete: () => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [confirm, setConfirm] = useState(false)

  const dl = deadlineInfo(goal.deadline)
  const target = goal.target_value
  const hasTarget = target !== null
  const pct = goal.completed
    ? 100
    : hasTarget && target > 0
      ? Math.min(100, (goal.current_value / target) * 100)
      : 0
  const unitSuffix = goal.unit ? ` ${goal.unit}` : ''

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  const submitValue = (e: FormEvent) => {
    e.preventDefault()
    const v = Number(editValue)
    if (!Number.isFinite(v) || v < 0) return
    setEditOpen(false)
    void run(() => onSetValue(v))
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: index * 0.05, ease: EASE } }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-lg p-4 ${
        goal.completed ? 'border border-amber-400/25 bg-abyss/40' : 'glass clip-system'
      }`}
    >
      <div className="relative z-[2] flex items-start justify-between gap-3">
        <div className={`flex min-w-0 items-start gap-2.5 ${goal.completed ? 'opacity-70' : ''}`}>
          {goal.completed && (
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-gold"
              style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' }}
            />
          )}
          <div className="min-w-0">
            <h3
              className={`font-display text-[0.85rem] font-bold tracking-[0.06em] break-words ${
                goal.completed ? 'text-mute' : 'text-ink'
              }`}
            >
              {goal.title}
            </h3>
            {!goal.completed && dl && (
              <p className={`mt-0.5 flex items-center gap-1.5 text-xs ${TONE_CLASS[dl.tone]}`}>
                <CalendarDays size={12} /> {dl.label}
              </p>
            )}
            {goal.completed && hasTarget && (
              <p className="mt-0.5 text-xs text-mute/80">
                {fmt(goal.current_value)}
                {unitSuffix} achieved
              </p>
            )}
          </div>
        </div>

        {confirm ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-[0.62rem] font-semibold tracking-[0.12em] text-mute uppercase">Release?</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(onDelete)}
              aria-label="Confirm delete"
              className="flex h-11 min-w-11 items-center justify-center rounded-md border border-red-500/40 bg-red-950/40 px-2 text-xs font-bold text-red-300 transition hover:bg-red-900/40"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              aria-label="Keep resolution"
              className="flex h-11 min-w-11 items-center justify-center rounded-md border border-line px-2 text-xs font-semibold text-mute transition hover:text-ink"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            aria-label="Delete resolution"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-mute/70 transition hover:text-danger"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {hasTarget && (
        <div className={`relative z-[2] mt-3 ${goal.completed ? 'opacity-70' : ''}`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
            <span className="tracking-[0.15em] text-mute uppercase">Progress</span>
            <span className={`font-semibold ${goal.completed ? 'text-gold' : 'text-glow-soft'}`}>
              {fmt(goal.current_value)} / {fmt(target)}
              {unitSuffix}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full border border-line/60 bg-void/70">
            <motion.div
              className={`h-full rounded-full ${
                goal.completed
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                  : 'bg-gradient-to-r from-sky-500 to-cyan-300'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: EASE }}
              style={{ boxShadow: goal.completed ? '0 0 10px rgba(251,191,36,0.5)' : '0 0 10px rgba(56,189,248,0.5)' }}
            />
          </div>
        </div>
      )}

      {fulfilled && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-glow-gold relative z-[2] mt-2.5 flex items-center gap-1.5 text-xs font-bold tracking-[0.1em] text-gold uppercase"
        >
          <Sparkles size={13} /> +80 XP · Resolution fulfilled
        </motion.p>
      )}

      {!goal.completed && (
        <div className="relative z-[2] mt-3 flex flex-wrap items-center gap-2">
          {hasTarget && (
            <GlowButton
              size="sm"
              variant="ghost"
              className="min-h-11"
              disabled={busy}
              onClick={() => void run(() => onSetValue(goal.current_value + 1))}
              aria-label={`Add 1 to ${goal.title}`}
            >
              +1
            </GlowButton>
          )}
          {hasTarget &&
            (editOpen ? (
              <form className="flex items-center gap-1.5" onSubmit={submitValue}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  aria-label={`New value for ${goal.title}`}
                  className="sys-input h-11 w-24 px-2.5 py-1 text-sm"
                />
                <button
                  type="submit"
                  aria-label="Save value"
                  className="flex h-11 w-11 items-center justify-center rounded-md border border-line text-success transition hover:border-emerald-400/60"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Cancel edit"
                  onClick={() => setEditOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-md border border-line text-mute transition hover:text-ink"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <GlowButton
                size="sm"
                variant="ghost"
                className="min-h-11"
                disabled={busy}
                icon={<Pencil size={13} />}
                onClick={() => {
                  setEditValue(String(goal.current_value))
                  setEditOpen(true)
                }}
              >
                Set value
              </GlowButton>
            ))}
          <GlowButton
            size="sm"
            variant="ghost"
            className="ml-auto min-h-11"
            loading={busy}
            icon={<Check size={13} />}
            onClick={() => void run(onComplete)}
          >
            Mark complete
          </GlowButton>
        </div>
      )}
    </motion.div>
  )
}

/* ---------- Page ---------- */

export default function Goals() {
  const userId = useAuth((s) => s.session?.user.id)

  const [goals, setGoals] = useState<Goal[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // add-goal form
  const [title, setTitle] = useState('')
  const [targetStr, setTargetStr] = useState('')
  const [unit, setUnit] = useState('')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  /** goals completed this session (show "+80 XP" flash) */
  const [fulfilledIds, setFulfilledIds] = useState<Set<string>>(new Set())
  /** hard guard so XP is only ever awarded once per goal */
  const awardedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void (async () => {
      const { data, error: err } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('completed', { ascending: true })
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (err) {
        setError('The System could not retrieve your resolutions. Refresh to retry.')
        setGoals([])
      } else {
        setGoals((data as Goal[]) ?? [])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const loading = goals === null

  const patch = (updated: Goal) => {
    setGoals((g) => sortGoals((g ?? []).map((x) => (x.id === updated.id ? updated : x))))
  }

  const addGoal = async (e: FormEvent) => {
    e.preventDefault()
    if (!userId || !title.trim()) return
    const targetNum = targetStr.trim() ? Number(targetStr) : null
    if (targetNum !== null && (!Number.isFinite(targetNum) || targetNum <= 0)) {
      setFormError('Target must be a positive number.')
      return
    }
    setSaving(true)
    setFormError(null)
    const { data, error: err } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: title.trim(),
        target_value: targetNum,
        unit: unit.trim() || null,
        deadline: deadline || null,
      })
      .select()
      .single()
    if (err || !data) {
      setFormError('The System could not record this resolution. Try again.')
    } else {
      setGoals((g) => sortGoals([...(g ?? []), data as Goal]))
      setTitle('')
      setTargetStr('')
      setUnit('')
      setDeadline('')
      setShowForm(false)
    }
    setSaving(false)
  }

  /** Complete a goal and award +80 XP exactly once. */
  const fulfil = async (goal: Goal, value?: number) => {
    const target = goal.target_value
    const v = value ?? (target !== null ? Math.max(goal.current_value, target) : goal.current_value)
    const { data, error: err } = await supabase
      .from('goals')
      .update({ current_value: v, completed: true })
      .eq('id', goal.id)
      .select()
      .single()
    if (err || !data) throw err ?? new Error('update failed')
    patch(data as Goal)
    if (!awardedRef.current.has(goal.id)) {
      awardedRef.current.add(goal.id)
      setFulfilledIds((prev) => new Set(prev).add(goal.id))
      await awardXp(80)
    }
  }

  const setValue = async (goal: Goal, value: number) => {
    setError(null)
    const v = Math.max(0, value)
    const target = goal.target_value
    try {
      if (!goal.completed && target !== null && v >= target) {
        await fulfil(goal, v)
      } else {
        const { data, error: err } = await supabase
          .from('goals')
          .update({ current_value: v })
          .eq('id', goal.id)
          .select()
          .single()
        if (err || !data) throw err ?? new Error('update failed')
        patch(data as Goal)
      }
    } catch {
      setError('The System could not save that update. Try again, Hunter.')
    }
  }

  const complete = async (goal: Goal) => {
    setError(null)
    try {
      await fulfil(goal)
    } catch {
      setError('The System could not mark that resolution complete. Try again.')
    }
  }

  const removeGoal = async (goal: Goal) => {
    setError(null)
    const { error: err } = await supabase.from('goals').delete().eq('id', goal.id)
    if (err) {
      setError('The System could not release that resolution. Try again.')
      return
    }
    setGoals((g) => (g ?? []).filter((x) => x.id !== goal.id))
  }

  const active = (goals ?? []).filter((g) => !g.completed)
  const done = (goals ?? []).filter((g) => g.completed)

  return (
    <div className="space-y-4 sm:space-y-6">
      <SystemPanel
        title="Resolutions"
        icon={<Target size={14} />}
        action={
          <GlowButton
            size="sm"
            variant={showForm ? 'ghost' : 'primary'}
            icon={showForm ? <X size={13} /> : <Plus size={13} />}
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? 'Close' : 'New'}
          </GlowButton>
        }
      >
        <p className="mb-4 text-sm text-mute">
          Long-horizon vows, Hunter. The System records each one and holds it until fulfilled.
        </p>

        <AnimatePresence initial={false}>
          {showForm && (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <form
                onSubmit={addGoal}
                className="glass mb-4 space-y-3 rounded-lg border border-sky-400/25 p-3.5 sm:p-4"
              >
                <div>
                  <label className="sys-label" htmlFor="goal-title">
                    Resolution
                  </label>
                  <input
                    id="goal-title"
                    className="sys-input"
                    placeholder='e.g. "First pull-up", "Run 5K"'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={80}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="sys-label" htmlFor="goal-target">
                      Target <span className="normal-case">(optional)</span>
                    </label>
                    <input
                      id="goal-target"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min={0}
                      className="sys-input"
                      placeholder="5"
                      value={targetStr}
                      onChange={(e) => setTargetStr(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="sys-label" htmlFor="goal-unit">
                      Unit
                    </label>
                    <input
                      id="goal-unit"
                      className="sys-input"
                      placeholder="km, reps…"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      maxLength={16}
                    />
                  </div>
                </div>
                <div>
                  <label className="sys-label" htmlFor="goal-deadline">
                    Deadline <span className="normal-case">(optional)</span>
                  </label>
                  <input
                    id="goal-deadline"
                    type="date"
                    className="sys-input"
                    style={{ colorScheme: 'dark' }}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                {formError && <p className="text-sm text-danger">{formError}</p>}
                <div className="flex gap-2 pt-1">
                  <GlowButton type="submit" size="sm" className="min-h-11 flex-1" loading={saving} icon={<Flag size={13} />}>
                    Declare
                  </GlowButton>
                  <GlowButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </GlowButton>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        {loading ? (
          <InlineLoader label="Retrieving" />
        ) : active.length === 0 ? (
          !showForm && (
            <EmptyState
              icon={<Flag size={30} />}
              title={done.length > 0 ? 'All resolutions fulfilled' : 'No resolutions yet'}
              hint={
                done.length > 0
                  ? 'Impressive, Hunter. Declare the next objective when you are ready.'
                  : '“Every ascent begins with a vow.” Declare one, and the System will hold you to it — gently.'
              }
              action={
                <GlowButton size="sm" className="min-h-11" icon={<Plus size={13} />} onClick={() => setShowForm(true)}>
                  Declare a resolution
                </GlowButton>
              }
            />
          )
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {active.map((g, i) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  index={i}
                  fulfilled={false}
                  onSetValue={(v) => setValue(g, v)}
                  onComplete={() => complete(g)}
                  onDelete={() => removeGoal(g)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </SystemPanel>

      {done.length > 0 && (
        <SystemPanel
          title="Fulfilled"
          icon={<CheckCircle2 size={14} />}
          action={
            <span className="text-glow-gold font-display text-[0.65rem] font-bold tracking-[0.2em] text-gold">
              {done.length} CLAIMED
            </span>
          }
        >
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {done.map((g, i) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  index={i}
                  fulfilled={fulfilledIds.has(g.id)}
                  onSetValue={(v) => setValue(g, v)}
                  onComplete={() => complete(g)}
                  onDelete={() => removeGoal(g)}
                />
              ))}
            </AnimatePresence>
          </div>
        </SystemPanel>
      )}
    </div>
  )
}
