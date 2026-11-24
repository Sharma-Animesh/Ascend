import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Cookie,
  Crosshair,
  Drumstick,
  Flame,
  Globe,
  Leaf,
  Moon,
  NotebookPen,
  Plus,
  Salad,
  Sprout,
  Sun,
  Sunrise,
  Trash2,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { InlineLoader } from '../components/system/Loader'
import { EmptyState } from '../components/system/EmptyState'
import { supabase } from '../lib/supabase'
import { macroTargets } from '../lib/tdee'
import { MEAL_PLANS, type MealPlanDay, type MealPlanDiet } from '../lib/mealplans'
import { REGION_LABELS, regionForCountry, type CuisineRegion } from '../lib/regions'
import { useAuth } from '../store/auth'
import type { Assessment, FoodLog, MealType } from '../lib/types'

// ---------- constants & helpers ----------

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other']

const MEAL_META: Record<MealType, { label: string; Icon: LucideIcon }> = {
  breakfast: { label: 'Breakfast', Icon: Sunrise },
  lunch: { label: 'Lunch', Icon: Sun },
  dinner: { label: 'Dinner', Icon: Moon },
  snack: { label: 'Snack', Icon: Cookie },
  other: { label: 'Other', Icon: UtensilsCrossed },
}

type DietKey = MealPlanDiet

const DIET_TABS: Array<{ id: DietKey; label: string; Icon: LucideIcon }> = [
  { id: 'veg', label: 'Veg', Icon: Leaf },
  { id: 'nonveg', label: 'Non-Veg', Icon: Drumstick },
  { id: 'vegan', label: 'Vegan', Icon: Sprout },
]

// Cuisine browsing: defaults from the country picked at Awakening, but the
// The Ascendant may browse any region — a manual pick is remembered locally.
const CUISINE_STORAGE_KEY = 'ascend_cuisine_region'
const REGION_ORDER = Object.keys(REGION_LABELS) as CuisineRegion[]

/** The assessments row carries a `country` code column that the shared Assessment type doesn't declare yet. */
type AssessmentRow = Assessment & { country?: string | null }

function storedCuisine(): CuisineRegion | null {
  try {
    const v = localStorage.getItem(CUISINE_STORAGE_KEY)
    return v && v in REGION_LABELS ? (v as CuisineRegion) : null
  } catch {
    return null
  }
}

const todayStr = () => new Date().toISOString().slice(0, 10)

function mealForNow(): MealType {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 18) return 'snack'
  return 'dinner'
}

/** Parse a grams field: empty/invalid → 0, otherwise rounded to 1 decimal. */
function toGrams(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : 0
}

// ---------- small presentational pieces ----------

function MacroBar({ label, value, target, delay = 0 }: { label: string; value: number; target: number; delay?: number }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-display text-[0.6rem] font-bold tracking-[0.24em] text-mute uppercase">{label}</span>
        <span className="text-xs tabular-nums">
          <span className="font-semibold text-ink">{Math.round(value)}</span>
          <span className="text-mute"> / {target} g</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full border border-line/60 bg-abyss">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const }}
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
        />
      </div>
    </div>
  )
}

function TotalTile({ label, value, target, unit }: { label: string; value: number; target: number | null; unit: string }) {
  const remaining = target != null ? Math.round(target - value) : null
  return (
    <div className="rounded-md border border-line/70 bg-abyss/60 px-3 py-2.5">
      <div className="font-display text-[0.55rem] font-bold tracking-[0.22em] text-mute uppercase">{label}</div>
      <div className="mt-0.5 text-sm tabular-nums">
        <span className="font-semibold text-ink">{Math.round(value)}</span>
        {target != null && <span className="text-mute"> / {target}</span>}
        <span className="text-xs text-mute"> {unit}</span>
      </div>
      {remaining != null && (
        <div className={`text-[0.68rem] tabular-nums ${remaining >= 0 ? 'text-sky-300/90' : 'text-gold'}`}>
          {remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
        </div>
      )}
    </div>
  )
}

function MealPlanCard({ day, index }: { day: MealPlanDay; index: number }) {
  const totals = day.meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein_g,
      carbs: acc.carbs + m.carbs_g,
      fat: acc.fat + m.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
      className="rounded-lg border border-line/70 bg-abyss/50 p-4"
    >
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-xs font-bold tracking-[0.24em] text-glow-soft uppercase">{day.label}</h3>
        <span className="text-[0.7rem] text-mute tabular-nums">
          {totals.calories} kcal · P {totals.protein} · C {totals.carbs} · F {totals.fat}
        </span>
      </header>
      <ul className="space-y-3.5">
        {day.meals.map((m) => {
          const meta = MEAL_META[m.meal]
          return (
            <li key={`${m.meal}-${m.name}`} className="border-l-2 border-sky-400/30 pl-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-display text-[0.55rem] font-bold tracking-[0.2em] text-sky-300/80 uppercase">
                  <meta.Icon size={11} /> {meta.label}
                </span>
                <span className="text-[0.7rem] text-mute tabular-nums">{m.calories} kcal</span>
              </div>
              <p className="mt-0.5 text-sm font-semibold text-ink">{m.name}</p>
              <p className="text-xs leading-snug text-mute">{m.desc}</p>
              <p className="mt-1 text-[0.7rem] text-glow-soft/80 tabular-nums">
                P {m.protein_g}g · C {m.carbs_g}g · F {m.fat_g}g
              </p>
            </li>
          )
        })}
      </ul>
    </motion.article>
  )
}

// ---------- page ----------

const EMPTY_FORM = { name: '', calories: '', protein: '', carbs: '', fat: '' }

export default function Nutrition() {
  const { session, character } = useAuth()

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [diet, setDiet] = useState<DietKey>('veg')
  const [cuisine, setCuisine] = useState<CuisineRegion>(() => storedCuisine() ?? 'international')

  const [form, setForm] = useState<{ name: string; meal: MealType; calories: string; protein: string; carbs: string; fat: string }>({
    ...EMPTY_FORM,
    meal: mealForNow(),
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void (async () => {
      setLoading(true)
      setLoadError(null)
      const [aRes, lRes] = await Promise.all([
        supabase
          .from('assessments')
          // '*' includes the country column (added for cuisine defaults)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('logged_date', todayStr())
          .order('created_at', { ascending: true }),
      ])
      if (cancelled) return
      if (aRes.error || lRes.error) setLoadError('The System could not sync your nutrition data. Refresh to try again.')
      const a = (aRes.data as AssessmentRow | null) ?? null
      setAssessment(a)
      if (a?.diet_pref === 'veg' || a?.diet_pref === 'nonveg' || a?.diet_pref === 'vegan') setDiet(a.diet_pref)
      // A manual cuisine pick (persisted locally) beats the country default.
      setCuisine(storedCuisine() ?? regionForCountry(a?.country ?? null))
      setLogs((lRes.data as FoodLog[] | null) ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const targets = useMemo(
    () => (assessment ? macroTargets(assessment, character?.archetype ?? null) : null),
    [assessment, character?.archetype],
  )

  const totals = useMemo(
    () =>
      logs.reduce(
        (acc, l) => ({
          calories: acc.calories + (l.calories ?? 0),
          protein: acc.protein + (l.protein_g ?? 0),
          carbs: acc.carbs + (l.carbs_g ?? 0),
          fat: acc.fat + (l.fat_g ?? 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [logs],
  )

  const groups = useMemo(
    () =>
      MEAL_ORDER.map((meal) => {
        const items = logs.filter((l) => l.meal === meal)
        return { meal, items, subtotal: items.reduce((s, l) => s + (l.calories ?? 0), 0) }
      }).filter((g) => g.items.length > 0),
    [logs],
  )

  const allergies = assessment?.allergies ?? []

  async function addFood(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userId) return
    const name = form.name.trim()
    const calories = Number(form.calories)
    if (!name) {
      setFormError('Name the food, Ascendant.')
      return
    }
    if (form.calories.trim() === '' || !Number.isFinite(calories) || calories < 0) {
      setFormError('Enter the calories for this entry.')
      return
    }
    setSaving(true)
    setFormError(null)
    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: userId,
        name,
        meal: form.meal,
        calories: Math.round(calories),
        protein_g: toGrams(form.protein),
        carbs_g: toGrams(form.carbs),
        fat_g: toGrams(form.fat),
        logged_date: todayStr(),
      })
      .select('*')
      .single()
    setSaving(false)
    if (error || !data) {
      setFormError('The System could not record this entry. Try again.')
      return
    }
    setLogs((prev) => [...prev, data as FoodLog])
    setForm((f) => ({ ...EMPTY_FORM, meal: f.meal }))
  }

  function selectCuisine(region: CuisineRegion) {
    setCuisine(region)
    try {
      localStorage.setItem(CUISINE_STORAGE_KEY, region)
    } catch {
      // Storage unavailable — the choice still applies for this session.
    }
  }

  async function deleteLog(id: string) {
    const previous = logs
    setActionError(null)
    setLogs((l) => l.filter((x) => x.id !== id))
    const { error } = await supabase.from('food_logs').delete().eq('id', id)
    if (error) {
      setLogs(previous)
      setActionError('The System could not remove that entry. Try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <SystemPanel title="Nutrition" icon={<Flame size={14} />}>
          <InlineLoader label="Syncing fuel data" />
        </SystemPanel>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {loadError && (
        <p className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">{loadError}</p>
      )}

      {/* ---------- TARGETS ---------- */}
      <SystemPanel title="Daily Targets" icon={<Crosshair size={14} />}>
        {targets ? (
          <>
            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex flex-col items-center gap-1.5 sm:items-start sm:border-r sm:border-line/60 sm:pr-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-black tracking-tight text-sky-300 text-glow tabular-nums">
                    {targets.calories.toLocaleString()}
                  </span>
                  <span className="font-display text-[0.6rem] font-bold tracking-[0.25em] text-mute uppercase">kcal</span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 font-display text-[0.6rem] font-bold tracking-[0.2em] text-sky-200 uppercase">
                  <Flame size={11} /> {targets.strategyLabel}
                </span>
              </div>
              <div className="space-y-4">
                <MacroBar label="Protein" value={totals.protein} target={targets.protein_g} delay={0.1} />
                <MacroBar label="Carbs" value={totals.carbs} target={targets.carbs_g} delay={0.2} />
                <MacroBar label="Fat" value={totals.fat} target={targets.fat_g} delay={0.3} />
              </div>
            </div>
            {targets.flooredForSafety && (
              <p className="mt-4 rounded-md border border-sky-400/30 bg-sky-500/10 px-3.5 py-2.5 text-sm text-glow-soft">
                Targets were raised to a safe minimum — sustainable fuel powers the climb.
              </p>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Crosshair size={34} />}
            title="Assessment data missing"
            hint="The System needs your awakening assessment — age, height and weight — to calculate calorie and macro targets. Complete it from your profile to unlock them."
          />
        )}
      </SystemPanel>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* ---------- TODAY'S LOG ---------- */}
        <SystemPanel title="Today's Log" icon={<NotebookPen size={14} />} className="lg:col-span-3">
          {logs.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed size={34} />}
              title="Nothing logged yet"
              hint="Log your first meal of the day — every entry fuels the climb."
            />
          ) : (
            <div className="space-y-5">
              {groups.map((g) => {
                const meta = MEAL_META[g.meal]
                return (
                  <div key={g.meal}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-display text-[0.62rem] font-bold tracking-[0.24em] text-sky-300/90 uppercase">
                        <meta.Icon size={13} /> {meta.label}
                      </span>
                      <span className="text-xs text-mute tabular-nums">{Math.round(g.subtotal)} kcal</span>
                    </div>
                    <div className="space-y-1.5">
                      <AnimatePresence>
                        {g.items.map((item, i) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                            className="flex items-center gap-2 rounded-md border border-line/60 bg-abyss/50 py-1.5 pr-1 pl-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                              <p className="text-[0.7rem] text-mute tabular-nums">
                                P {Math.round(item.protein_g ?? 0)} · C {Math.round(item.carbs_g ?? 0)} · F{' '}
                                {Math.round(item.fat_g ?? 0)} g
                              </p>
                            </div>
                            <p className="shrink-0 text-sm tabular-nums">
                              <span className="font-semibold text-glow-soft">{item.calories}</span>
                              <span className="text-[0.65rem] text-mute"> kcal</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => void deleteLog(item.id)}
                              aria-label={`Delete ${item.name}`}
                              className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-mute transition hover:bg-red-500/10 hover:text-danger"
                            >
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )
              })}

              {/* totals vs targets */}
              <div className="border-t border-line/70 pt-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <TotalTile label="Calories" value={totals.calories} target={targets?.calories ?? null} unit="kcal" />
                  <TotalTile label="Protein" value={totals.protein} target={targets?.protein_g ?? null} unit="g" />
                  <TotalTile label="Carbs" value={totals.carbs} target={targets?.carbs_g ?? null} unit="g" />
                  <TotalTile label="Fat" value={totals.fat} target={targets?.fat_g ?? null} unit="g" />
                </div>
              </div>
            </div>
          )}
          {actionError && <p className="mt-3 text-sm text-danger">{actionError}</p>}
        </SystemPanel>

        {/* ---------- ADD FOOD ---------- */}
        <SystemPanel title="Add Food" icon={<Plus size={14} />} className="self-start lg:col-span-2">
          <form onSubmit={addFood} className="space-y-3.5" noValidate>
            <div>
              <label htmlFor="food-name" className="sys-label">
                Food name
              </label>
              <input
                id="food-name"
                className="sys-input"
                value={form.name}
                maxLength={80}
                placeholder="e.g. Dal tadka + rice"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="food-meal" className="sys-label">
                  Meal
                </label>
                <select
                  id="food-meal"
                  className="sys-input"
                  value={form.meal}
                  onChange={(e) => setForm((f) => ({ ...f, meal: e.target.value as MealType }))}
                >
                  {MEAL_ORDER.map((m) => (
                    <option key={m} value={m}>
                      {MEAL_META[m].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="food-cal" className="sys-label">
                  Calories
                </label>
                <input
                  id="food-cal"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  className="sys-input"
                  value={form.calories}
                  placeholder="0"
                  onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { key: 'protein', label: 'Protein g' },
                  { key: 'carbs', label: 'Carbs g' },
                  { key: 'fat', label: 'Fat g' },
                ] as const
              ).map((f) => (
                <div key={f.key}>
                  <label htmlFor={`food-${f.key}`} className="sys-label">
                    {f.label}
                  </label>
                  <input
                    id={`food-${f.key}`}
                    type="number"
                    min={0}
                    step={0.1}
                    inputMode="decimal"
                    className="sys-input"
                    value={form[f.key]}
                    placeholder="0"
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            {formError && <p className="text-sm text-danger">{formError}</p>}
            <GlowButton type="submit" full loading={saving} icon={<Plus size={15} />}>
              Log Food
            </GlowButton>
          </form>
        </SystemPanel>
      </div>

      {/* ---------- MEAL PLAN ---------- */}
      <SystemPanel title="Meal Plan" icon={<Salad size={14} />}>
        {/* cuisine selector */}
        <div className="mb-2 flex items-center gap-1.5">
          <Globe size={12} className="text-sky-300/80" />
          <span className="font-display text-[0.6rem] font-bold tracking-[0.24em] text-mute uppercase">Cuisine</span>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Cuisine region">
          {REGION_ORDER.map((r) => {
            const active = cuisine === r
            return (
              <button
                key={r}
                type="button"
                onClick={() => selectCuisine(r)}
                aria-pressed={active}
                className={`min-h-11 shrink-0 rounded-full border px-4 font-display text-[0.6rem] font-bold tracking-[0.16em] whitespace-nowrap uppercase transition-all ${
                  active
                    ? 'glow-border bg-sky-500/15 text-sky-200'
                    : 'border-line bg-abyss/60 text-mute hover:border-sky-400/40 hover:text-glow-soft'
                }`}
              >
                {REGION_LABELS[r]}
              </button>
            )
          })}
        </div>
        <p className="mt-2 mb-4 text-xs text-mute">Defaulted from your country — browse any cuisine, fuel is fuel.</p>

        <div className="flex gap-2">
          {DIET_TABS.map((t) => {
            const active = diet === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setDiet(t.id)}
                aria-pressed={active}
                className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border px-2 font-display text-[0.62rem] font-bold tracking-[0.18em] uppercase transition-all ${
                  active
                    ? 'glow-border bg-sky-500/15 text-sky-200'
                    : 'border-line bg-abyss/60 text-mute hover:border-sky-400/40 hover:text-glow-soft'
                }`}
              >
                <t.Icon size={13} /> {t.label}
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-xs text-mute">
          Template plan — swap freely
          {allergies.length > 0 ? (
            <>
              , respect your allergies: <span className="font-semibold text-gold">{allergies.join(', ')}</span>
            </>
          ) : null}
          .
        </p>

        <div key={`${cuisine}-${diet}`} className="mt-4 grid gap-4 md:grid-cols-2">
          {MEAL_PLANS[cuisine][diet].map((day, i) => (
            <MealPlanCard key={day.label} day={day} index={i} />
          ))}
        </div>
      </SystemPanel>

      <p className="pb-2 text-center text-xs text-mute/70">General information, not medical or dietary advice.</p>
    </div>
  )
}
