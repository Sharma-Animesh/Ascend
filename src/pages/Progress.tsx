import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Activity, Dumbbell, Flame, History, Scale, Trophy, Zap } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { EmptyState } from '../components/system/EmptyState'
import { InlineLoader } from '../components/system/Loader'
import { supabase } from '../lib/supabase'
import type { Measurement, WorkoutLog } from '../lib/types'
import { useAuth } from '../store/auth'
import {
  AXIS_TICK,
  CHART_CYAN,
  CHART_GRID,
  CURSOR_FILL,
  CURSOR_LINE,
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
} from '../components/charts/chartTheme'

// ---------- date helpers (local timezone) ----------

function ymd(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Parse a `YYYY-MM-DD` date string as a local date (avoids UTC day-shift). */
function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

/** Monday 00:00 of the current week, local time. */
function startOfWeek(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

function fmtLogDate(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${time}`
}

// ---------- motion ----------

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

// ---------- page ----------

export default function Progress() {
  const { session, character, loading } = useAuth()
  const [logs14, setLogs14] = useState<WorkoutLog[] | null>(null)
  const [recent, setRecent] = useState<WorkoutLog[] | null>(null)
  const [measurements, setMeasurements] = useState<Measurement[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [weightInput, setWeightInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const uid = session?.user.id
    if (!uid) return
    let cancelled = false
    void (async () => {
      const since = new Date()
      since.setHours(0, 0, 0, 0)
      since.setDate(since.getDate() - 13)
      const [l14, rec, meas] = await Promise.all([
        supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', uid)
          .gte('logged_at', since.toISOString())
          .order('logged_at', { ascending: true }),
        supabase.from('workout_logs').select('*').eq('user_id', uid).order('logged_at', { ascending: false }).limit(10),
        supabase.from('measurements').select('*').eq('user_id', uid).order('measured_on', { ascending: true }),
      ])
      if (cancelled) return
      if (l14.error || rec.error || meas.error) {
        setLoadError('The System could not retrieve part of your records. Pull down or revisit shortly.')
      }
      setLogs14((l14.data as WorkoutLog[] | null) ?? [])
      setRecent((rec.data as WorkoutLog[] | null) ?? [])
      setMeasurements((meas.data as Measurement[] | null) ?? [])
    })()
    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  // ---------- derived data ----------

  const workoutsThisWeek = useMemo(() => {
    if (!logs14) return null
    const weekStart = startOfWeek()
    return logs14.filter((l) => new Date(l.logged_at) >= weekStart).length
  }, [logs14])

  const weightData = useMemo(
    () =>
      (measurements ?? [])
        .filter((m) => m.weight_kg !== null)
        .map((m) => {
          const d = parseYmd(m.measured_on)
          return {
            label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            full: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            weight: m.weight_kg as number,
          }
        }),
    [measurements],
  )

  const volumeData = useMemo(() => {
    const days: { key: string; label: string; full: string; workouts: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      days.push({
        key: ymd(d),
        label: `${d.getDate()}`,
        full: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        workouts: 0,
      })
    }
    const byKey = new Map(days.map((d) => [d.key, d]))
    for (const log of logs14 ?? []) {
      const bucket = byKey.get(ymd(new Date(log.logged_at)))
      if (bucket) bucket.workouts += 1
    }
    return days
  }, [logs14])

  const trainedInWindow = useMemo(() => volumeData.some((d) => d.workouts > 0), [volumeData])

  // ---------- weight logging ----------

  const logWeight = async (e: FormEvent) => {
    e.preventDefault()
    const uid = session?.user.id
    const w = parseFloat(weightInput)
    if (!uid) return
    if (Number.isNaN(w) || w < 20 || w > 400) {
      setFormError('Enter a weight between 20 and 400 kg.')
      return
    }
    setSaving(true)
    setFormError(null)
    const today = ymd(new Date())
    const existing = measurements?.find((m) => m.measured_on === today)
    try {
      if (existing) {
        const { data, error } = await supabase
          .from('measurements')
          .update({ weight_kg: w })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        setMeasurements((ms) => (ms ?? []).map((m) => (m.id === existing.id ? (data as Measurement) : m)))
      } else {
        const { data, error } = await supabase
          .from('measurements')
          .insert({ user_id: uid, weight_kg: w, measured_on: today })
          .select()
          .single()
        if (error) throw error
        setMeasurements((ms) =>
          [...(ms ?? []), data as Measurement].sort((a, b) => a.measured_on.localeCompare(b.measured_on)),
        )
      }
      setWeightInput('')
    } catch {
      setFormError('The System could not record this entry. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16">
        <InlineLoader label="Synchronizing" />
      </div>
    )
  }

  const tiles: { label: string; value: string; icon: LucideIcon; accent: string }[] = [
    {
      label: 'Workouts this week',
      value: workoutsThisWeek === null ? '—' : String(workoutsThisWeek),
      icon: Dumbbell,
      accent: '#38bdf8',
    },
    { label: 'Total XP', value: (character?.xp ?? 0).toLocaleString(), icon: Zap, accent: '#a78bfa' },
    { label: 'Current streak', value: String(character?.streak ?? 0), icon: Flame, accent: '#fb923c' },
    { label: 'Longest streak', value: String(character?.longest_streak ?? 0), icon: Trophy, accent: '#fbbf24' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="font-display text-lg font-black tracking-[0.3em] text-glow-soft uppercase text-glow">
          Progress Log
        </h1>
        <p className="mt-0.5 text-sm text-mute">Every rep is recorded, Hunter. The climb is visible here.</p>
      </motion.div>

      {loadError && (
        <p className="rounded-md border border-danger/40 bg-red-950/30 px-3.5 py-2.5 text-xs font-semibold text-danger">
          {loadError}
        </p>
      )}

      {/* ---------- KPI tiles ---------- */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {tiles.map(({ label, value, icon: Icon, accent }) => (
          <motion.div
            key={label}
            variants={itemVariants}
            className="glass clip-system relative overflow-hidden rounded-lg p-3.5 sm:p-4"
          >
            <div className="flex items-center gap-2">
              <Icon size={14} style={{ color: accent, filter: `drop-shadow(0 0 5px ${accent}aa)` }} />
              <span className="text-[0.6rem] font-bold tracking-[0.18em] text-mute uppercase">{label}</span>
            </div>
            <div className="mt-2 font-display text-2xl font-black text-glow-soft text-glow sm:text-3xl">{value}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* ---------- Weight trend ---------- */}
        <SystemPanel title="Weight Trend" icon={<Scale size={13} />}>
          <form onSubmit={(e) => void logWeight(e)} className="mb-4 flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <label htmlFor="weight-input" className="sys-label">
                Log today's weight (kg)
              </label>
              <input
                id="weight-input"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={20}
                max={400}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="e.g. 72.5"
                className="sys-input"
              />
            </div>
            <GlowButton type="submit" loading={saving} className="h-[46px] shrink-0">
              Log
            </GlowButton>
          </form>
          {formError && <p className="mb-3 text-xs font-semibold text-danger">{formError}</p>}

          {measurements === null ? (
            <InlineLoader label="Loading" />
          ) : weightData.length < 2 ? (
            <EmptyState
              icon={<Scale size={28} />}
              title="Not enough data"
              hint="Log your weight at least twice and the System will chart your trajectory."
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weightData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={{ stroke: CHART_GRID }}
                  minTickGap={24}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  width={42}
                />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  cursor={CURSOR_LINE}
                  labelFormatter={(label, payload) =>
                    (payload?.[0]?.payload as { full?: string } | undefined)?.full ?? String(label)
                  }
                  formatter={(value) => [`${value} kg`, 'Weight']}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  name="Weight"
                  stroke={CHART_CYAN}
                  strokeWidth={2}
                  fill={CHART_CYAN}
                  fillOpacity={0.3}
                  dot={{ r: 4, fill: '#0d1528', stroke: CHART_CYAN, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SystemPanel>

        {/* ---------- Training volume ---------- */}
        <SystemPanel title="Training Volume — 14 Days" icon={<Activity size={13} />}>
          {logs14 === null ? (
            <InlineLoader label="Loading" />
          ) : !trainedInWindow ? (
            <EmptyState
              icon={<Activity size={28} />}
              title="No training recorded"
              hint="Complete a quest or log a workout — the System will plot your daily output here."
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={volumeData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: CHART_GRID }} interval={1} />
                <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  cursor={CURSOR_FILL}
                  labelFormatter={(label, payload) =>
                    (payload?.[0]?.payload as { full?: string } | undefined)?.full ?? String(label)
                  }
                  formatter={(value) => [String(value), 'Workouts']}
                />
                <Bar
                  dataKey="workouts"
                  name="Workouts"
                  fill={CHART_CYAN}
                  fillOpacity={0.32}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SystemPanel>
      </div>

      {/* ---------- Recent activity ---------- */}
      <SystemPanel title="Recent Activity" icon={<History size={13} />}>
        {recent === null ? (
          <InlineLoader label="Loading" />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<History size={28} />}
            title="No activity yet"
            hint="Your first completed training will appear here. The System awaits, Hunter."
          />
        ) : (
          <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-2">
            {recent.map((log) => (
              <motion.li
                key={log.id}
                variants={itemVariants}
                className="flex min-h-[52px] items-center justify-between gap-3 rounded-md border border-line/60 bg-abyss/40 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{log.exercise_name ?? 'Training session'}</p>
                  <p className="text-xs text-mute">{fmtLogDate(log.logged_at)}</p>
                </div>
                <span className="shrink-0 font-display text-[0.72rem] font-bold tracking-[0.14em] text-sky-300 text-glow">
                  +{log.xp_earned} XP
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </SystemPanel>
    </div>
  )
}
