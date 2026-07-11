import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpenText, Search, SearchX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Difficulty, Exercise, ExerciseCategory, StatKey } from '../lib/types'
import { STAT_META } from '../lib/game'
import { ExerciseVisual } from '../components/ExerciseVisual'
import { EmptyState } from '../components/system/EmptyState'
import { InlineLoader } from '../components/system/Loader'

const EASE = [0.22, 1, 0.36, 1] as const

type CategoryFilter = ExerciseCategory | 'all'
type DifficultyFilter = Difficulty | 'all'

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

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter((ex) => {
      if (category !== 'all' && ex.category !== category) return false
      if (difficulty !== 'all' && ex.difficulty !== difficulty) return false
      if (!q) return true
      const haystack = `${ex.name} ${ex.muscles.join(' ')}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [exercises, query, category, difficulty])

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <h1 className="flex items-center gap-2.5 font-display text-lg font-bold tracking-[0.25em] text-glow-soft uppercase text-glow sm:text-xl">
          <BookOpenText size={20} className="shrink-0 text-sky-300" />
          Exercise Archive
        </h1>
        <p className="mt-1 text-sm text-mute">
          Every technique catalogued by the System. Select a protocol to study its form and log your training, Hunter.
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
              <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
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
          </p>

          {filtered.length === 0 ? (
            <div className="glass clip-system rounded-lg">
              <EmptyState
                icon={<SearchX size={40} />}
                title="No protocols match"
                hint="Adjust your search or filters, Hunter — the archive holds more than this."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ex, i) => (
                <ExerciseCard key={ex.id} exercise={ex} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
