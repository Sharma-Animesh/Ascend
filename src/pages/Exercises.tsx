import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpenText, Search, SearchX, Wind } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Difficulty, Exercise, ExerciseCategory, StatKey } from '../lib/types'
import { STAT_META } from '../lib/game'
import {
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUP_ORDER,
  groupsForExercise,
  type MuscleGroup,
} from '../lib/muscleGroups'
import { ExerciseVisual } from '../components/ExerciseVisual'
import { EmptyState } from '../components/system/EmptyState'
import { InlineLoader } from '../components/system/Loader'

const EASE = [0.22, 1, 0.36, 1] as const

type CategoryFilter = ExerciseCategory | 'all'
type DifficultyFilter = Difficulty | 'all'
type TargetFilter = MuscleGroup | 'all'

const CATEGORIES: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'home', label: 'Home' },
  { id: 'gym', label: 'Gym' },
  { id: 'calisthenics', label: 'Calisthenics' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'breath', label: 'Breath' },
  { id: 'martial', label: 'Martial' },
]

const DIFFICULTIES: Array<{ id: DifficultyFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
]

const TARGETS: Array<{ id: TargetFilter; label: string }> = [
  { id: 'all', label: 'All' },
  ...MUSCLE_GROUP_ORDER.map((group) => ({ id: group as TargetFilter, label: MUSCLE_GROUP_LABELS[group] })),
]

const DIFFICULTY_PIPS: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3 }

function DifficultyPips({ difficulty }: { difficulty: Difficulty }) {
  const filled = DIFFICULTY_PIPS[difficulty]
  return (
    <span className="flex items-center gap-1" title={difficulty} aria-label={`Difficulty: ${difficulty}`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= filled ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]' : 'bg-line'
          }`}
        />
      ))}
    </span>
  )
}

function StatChip({ stat }: { stat: StatKey }) {
  const meta = STAT_META[stat]
  return (
    <span
      className="rounded-full border px-2 py-0.5 font-display text-[0.58rem] font-bold tracking-[0.18em] uppercase"
      style={{ color: meta.color, borderColor: `${meta.color}55`, backgroundColor: `${meta.color}14` }}
      title={meta.label}
    >
      {stat}
    </span>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full border px-4 font-display text-[0.62rem] font-bold tracking-[0.18em] uppercase transition-all ${
        active
          ? 'border-sky-400/60 bg-sky-500/15 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
          : 'border-line bg-abyss/60 text-mute hover:border-sky-400/40 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.45), ease: EASE }}
    >
      <Link
        to={`/app/exercises/${exercise.id}`}
        className="glass clip-system group relative block overflow-hidden rounded-lg p-3 transition-all duration-200 hover:border-sky-400/50 hover:shadow-[0_0_22px_rgba(56,189,248,0.18)]"
      >
        <ExerciseVisual exercise={exercise} className="mb-3" />
        <h3 className="truncate font-display text-[0.82rem] font-bold tracking-[0.12em] text-ink uppercase transition-colors group-hover:text-sky-200">
          {exercise.name}
        </h3>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-[0.66rem] font-semibold tracking-[0.2em] text-mute uppercase">
            {exercise.category}
          </span>
          <DifficultyPips difficulty={exercise.difficulty} />
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5">
          <StatChip stat={exercise.stat_focus} />
          <span className="font-display text-[0.7rem] font-bold tracking-[0.15em] text-gold">
            +{exercise.base_xp} XP
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

/** Glowing divider header for a muscle-group segment in the "All" view. */
function SegmentHeader({ label, count }: { label: string; count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex items-center gap-3"
    >
      <h2 className="shrink-0 font-display text-[0.74rem] font-bold tracking-[0.3em] text-glow-soft uppercase text-glow">
        {label}
      </h2>
      <span className="shrink-0 rounded-full border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 font-display text-[0.58rem] font-bold tracking-[0.18em] text-sky-200/80">
        {count}
      </span>
      <span aria-hidden className="h-px min-w-4 flex-1 bg-gradient-to-r from-sky-400/50 via-sky-400/15 to-transparent" />
    </motion.div>
  )
}

/** Calmer, SystemPanel-style header for the Breath Control section. */
function BreathHeader({ count }: { count: number }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-[0.72rem] font-bold tracking-[0.28em] text-teal-200 uppercase [text-shadow:0_0_14px_rgba(45,212,191,0.4)]">
          <Wind size={14} className="shrink-0 text-teal-300" />
          Breath Control
        </h2>
        <span className="shrink-0 rounded-full border border-teal-300/25 bg-teal-400/10 px-2 py-0.5 font-display text-[0.58rem] font-bold tracking-[0.18em] text-teal-200/80">
          {count}
        </span>
      </div>
      <div className="mt-2.5 h-px bg-gradient-to-r from-teal-300/50 via-teal-300/15 to-transparent" />
    </motion.header>
  )
}

function BreathNote() {
  return (
    <p className="rounded-md border border-teal-300/20 bg-teal-400/5 px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-teal-100/85">
      Regulate the vessel. Never practice breath-holds near water or while driving. If you feel dizzy
      or lightheaded, stop and sit down.
    </p>
  )
}

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [target, setTarget] = useState<TargetFilter>('all')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error: err } = await supabase
        .from('exercises')
        .select('*')
        .eq('published', true)
        .order('name')
      if (cancelled) return
      if (err) setError(err.message)
      else setExercises((data as Exercise[]) ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const groupsById = useMemo(() => {
    const map = new Map<string, MuscleGroup[]>()
    for (const ex of exercises) map.set(ex.id, groupsForExercise(ex.muscles))
    return map
  }, [exercises])

  const selectCategory = (id: CategoryFilter) => {
    setCategory(id)
    // Muscle targeting is irrelevant to breath work — clear it so no hidden filter lingers.
    if (id === 'breath') setTarget('all')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter((ex) => {
      if (category !== 'all' && ex.category !== category) return false
      if (difficulty !== 'all' && ex.difficulty !== difficulty) return false
      if (category !== 'breath' && target !== 'all' && !(groupsById.get(ex.id) ?? []).includes(target))
        return false
      if (!q) return true
      const haystack = `${ex.name} ${ex.muscles.join(' ')}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [exercises, groupsById, query, category, difficulty, target])

  // Segmented view only when browsing everything — a specific category or target keeps the flat grid.
  const segmented = category === 'all' && target === 'all'

  const breathItems = useMemo(() => filtered.filter((ex) => ex.category === 'breath'), [filtered])

  const segments = useMemo(() => {
    if (!segmented) return []
    const training = filtered.filter((ex) => ex.category !== 'breath')
    const bySegment: Array<{ key: string; label: string; items: Exercise[] }> = MUSCLE_GROUP_ORDER.map((group) => ({
      key: group,
      label: MUSCLE_GROUP_LABELS[group],
      items: training.filter((ex) => (groupsById.get(ex.id) ?? [])[0] === group),
    }))
    const unmapped = training.filter((ex) => (groupsById.get(ex.id) ?? []).length === 0)
    if (unmapped.length > 0) bySegment.push({ key: 'general', label: 'General', items: unmapped })
    return bySegment.filter((segment) => segment.items.length > 0)
  }, [segmented, filtered, groupsById])

  const activeFilterParts = [
    category !== 'all' ? CATEGORIES.find((c) => c.id === category)?.label : null,
    category !== 'breath' && target !== 'all' ? MUSCLE_GROUP_LABELS[target] : null,
    difficulty !== 'all' ? DIFFICULTIES.find((d) => d.id === difficulty)?.label : null,
    query.trim() ? `"${query.trim()}"` : null,
  ].filter((part): part is string => Boolean(part))

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <h1 className="flex items-center gap-2.5 font-display text-lg font-bold tracking-[0.25em] text-glow-soft uppercase text-glow sm:text-xl">
          <BookOpenText size={20} className="shrink-0 text-sky-300" />
          Exercise Archive
        </h1>
        <p className="mt-1 text-sm text-mute">
          Every technique catalogued by the System. Select a protocol to study its form and log your training, Ascendant.
        </p>
      </motion.header>

      {/* Sticky-ish controls: search + filter chips */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06, ease: EASE }}
        className="sticky top-[calc(env(safe-area-inset-top,0px)+52px)] z-20 lg:top-4"
      >
        <div className="glass space-y-3 rounded-lg p-3 sm:p-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mute" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or muscle…"
              aria-label="Search exercises"
              className="sys-input pl-10"
            />
          </div>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {CATEGORIES.map((c) => (
              <FilterChip key={c.id} active={category === c.id} onClick={() => selectCategory(c.id)}>
                {c.label}
              </FilterChip>
            ))}
          </div>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {DIFFICULTIES.map((d) => (
              <FilterChip key={d.id} active={difficulty === d.id} onClick={() => setDifficulty(d.id)}>
                {d.label}
              </FilterChip>
            ))}
          </div>
          {category !== 'breath' && (
            <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1">
              <span className="shrink-0 pl-1 font-display text-[0.55rem] font-bold tracking-[0.25em] text-mute/80 uppercase">
                Target
              </span>
              {TARGETS.map((t) => (
                <FilterChip key={t.id} active={target === t.id} onClick={() => setTarget(t.id)}>
                  {t.label}
                </FilterChip>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {loading ? (
        <InlineLoader label="Accessing archive" />
      ) : error ? (
        <div className="glass rounded-lg p-4">
          <p className="text-sm text-danger">The archive could not be reached: {error}</p>
        </div>
      ) : (
        <>
          <p className="text-[0.68rem] font-semibold tracking-[0.25em] text-mute uppercase">
            {filtered.length} {filtered.length === 1 ? 'protocol' : 'protocols'} located
            {activeFilterParts.length > 0 && (
              <span className="text-sky-300/80"> · {activeFilterParts.join(' · ')}</span>
            )}
          </p>

          {filtered.length === 0 ? (
            <div className="glass clip-system rounded-lg">
              <EmptyState
                icon={<SearchX size={40} />}
                title="No protocols match"
                hint="Adjust your search or filters, Ascendant — the archive holds more than this."
              />
            </div>
          ) : segmented ? (
            <div className="space-y-8">
              {segments.map((segment) => (
                <section key={segment.key} className="space-y-4">
                  <SegmentHeader label={segment.label} count={segment.items.length} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {segment.items.map((ex, i) => (
                      <ExerciseCard key={ex.id} exercise={ex} index={i} />
                    ))}
                  </div>
                </section>
              ))}

              {breathItems.length > 0 && (
                <section className="space-y-4 border-t border-line/60 pt-6">
                  <BreathHeader count={breathItems.length} />
                  <BreathNote />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {breathItems.map((ex, i) => (
                      <ExerciseCard key={ex.id} exercise={ex} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {category === 'breath' && <BreathNote />}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((ex, i) => (
                  <ExerciseCard key={ex.id} exercise={ex} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
