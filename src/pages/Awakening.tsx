// THE ASCENSION — cinematic multi-step onboarding wizard (standalone full-screen page).
// (Route stays /awakening and the file keeps its name — only user-facing copy changed.)
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Ruler, ShieldAlert, Sparkles, Swords } from 'lucide-react'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { Emblem } from '../components/system/Emblem'
import { LogoMark } from '../components/system/Logo'
import { CharacterArt } from '../components/CharacterArt'
import { ArchetypeCarousel } from '../components/ArchetypeCarousel'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/auth'
import { CLASSES, DEFAULT_STATS, STAT_KEYS, STAT_META, archetypeById, classById, rankById } from '../lib/game'
import { ACTIVITY_MULTIPLIERS, bmi, bodyFatEstimate } from '../lib/tdee'
import { COUNTRIES } from '../lib/regions'
import {
  DAYS_OPTIONS,
  DIET_OPTIONS,
  EMPTY_HEALTH_FLAGS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  HEALTH_FLAGS,
  SESSION_LENGTHS,
  anyHealthFlag,
  computeStartingStats,
  numInRange,
  parseAllergies,
  suggestArchetype,
  toggleEquipment,
  toggleHealthFlag,
} from '../lib/awakening'
import type { HealthFlags } from '../lib/awakening'

const TOTAL_STEPS = 5
const EASE = [0.22, 1, 0.36, 1] as const

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 56 : -56 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -56 : 56, transition: { duration: 0.22, ease: EASE } }),
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: EASE },
})

// ---------- Small local UI atoms ----------

function Rise({ delay, children, className = '' }: { delay: number; children: ReactNode; className?: string }) {
  return (
    <motion.div {...fadeUp(delay)} className={className}>
      {children}
    </motion.div>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <label className="block">
      <span className="sys-label">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-mute/70">{hint}</span>
      ) : null}
    </label>
  )
}

/** Compact selectable chip (small text, tight padding). */
function Chip({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`rounded-md border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 active:scale-[0.97] ${
        active
          ? 'border-sky-400/70 bg-sky-500/15 text-sky-100 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
          : 'border-line bg-abyss/60 text-mute hover:border-sky-400/40 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function StepHeading({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <header className="mb-5">
      <p className="font-display text-[0.56rem] font-bold tracking-[0.42em] text-sky-400/90 uppercase">{kicker}</p>
      <h1 className="mt-1.5 font-display text-lg font-bold tracking-[0.16em] text-ink uppercase sm:text-2xl">{title}</h1>
      <p className="mt-1.5 text-sm text-mute">{sub}</p>
    </header>
  )
}

// ---------- Draft state ----------

interface Draft {
  age: string
  sex: 'male' | 'female' | 'other' | null
  height: string
  weight: string
  target: string
  flags: HealthFlags
  activity: string | null
  experience: string | null
  goal: string | null
  equipment: string[]
  days: number
  session: number | null
  diet: string | null
  country: string | null
  allergies: string
  pushups: string
  plank: string
  squats: string
  archetype: string | null
  clazz: string | null
}

const INITIAL_DRAFT: Draft = {
  age: '',
  sex: null,
  height: '',
  weight: '',
  target: '',
  flags: { ...EMPTY_HEALTH_FLAGS },
  activity: null,
  experience: null,
  goal: null,
  equipment: [],
  days: 3,
  session: null,
  diet: null,
  country: null,
  allergies: '',
  pushups: '',
  plank: '',
  squats: '',
  archetype: null,
  clazz: null,
}

// ---------- Page ----------

export default function Awakening() {
  const navigate = useNavigate()
  const session = useAuth((s) => s.session)

  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT)
  const [healthOpen, setHealthOpen] = useState(false)
  const [sessionCustom, setSessionCustom] = useState(false)
  const [customSession, setCustomSession] = useState('')
  const classRowRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const assessmentSaved = useRef(false)

  useEffect(() => {
    if (!useAuth.getState().profile) void useAuth.getState().loadUserData()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  // ----- Parsed & validated values -----
  const ageN = numInRange(draft.age, 16, 100)
  const heightN = numInRange(draft.height, 100, 250)
  const weightN = numInRange(draft.weight, 30, 300)
  const targetProvided = draft.target.trim() !== ''
  const targetN = numInRange(draft.target, 30, 300)

  const ageError = draft.age.trim() !== '' && ageN === null ? 'The System accepts Ascendants aged 16–100.' : null
  const heightError = draft.height.trim() !== '' && heightN === null ? 'Enter a height between 100 and 250 cm.' : null
  const weightError = draft.weight.trim() !== '' && weightN === null ? 'Enter a weight between 30 and 300 kg.' : null
  const targetError = targetProvided && targetN === null ? 'Enter a target between 30 and 300 kg, or leave blank.' : null

  const vitalsValid = ageN !== null && draft.sex !== null && heightN !== null && weightN !== null && (!targetProvided || targetN !== null)
  const contextValid =
    draft.activity !== null &&
    draft.experience !== null &&
    draft.goal !== null &&
    draft.equipment.length > 0 &&
    draft.session !== null &&
    draft.diet !== null &&
    draft.country !== null

  const customSessionError =
    sessionCustom && customSession.trim() !== '' && numInRange(customSession, 10, 180) === null
      ? 'Enter a session length between 10 and 180 minutes.'
      : null

  const pushN = numInRange(draft.pushups, 0, 500)
  const plankN = numInRange(draft.plank, 0, 3600)
  const squatN = numInRange(draft.squats, 0, 500)
  const pushError = draft.pushups.trim() !== '' && pushN === null ? '0–500 reps.' : null
  const plankError = draft.plank.trim() !== '' && plankN === null ? '0–3600 seconds.' : null
  const squatError = draft.squats.trim() !== '' && squatN === null ? '0–500 reps.' : null
  const calibrationValid = pushN !== null && plankN !== null && squatN !== null

  const bmiVal = heightN !== null && weightN !== null ? bmi(weightN, heightN) : null
  const bodyFat = bmiVal !== null && ageN !== null ? bodyFatEstimate(bmiVal, ageN, draft.sex) : null
  const suggested = suggestArchetype(draft.goal, bmiVal, draft.experience)

  const finalStats = useMemo(
    () =>
      computeStartingStats({
        pushups: pushN ?? 0,
        plankSec: plankN ?? 0,
        squats: squatN ?? 0,
        classId: draft.clazz,
        archetypeId: draft.archetype,
      }),
    [pushN, plankN, squatN, draft.clazz, draft.archetype],
  )

  const canContinue =
    step === 2 ? vitalsValid : step === 3 ? contextValid && calibrationValid : step === 4 ? draft.archetype !== null && draft.clazz !== null : true

  // ----- Health section (inline on the vitals step; never blocks progress) -----
  const toggleHealthSection = () => {
    if (healthOpen) {
      setHealthOpen(false)
      patch({ flags: { ...EMPTY_HEALTH_FLAGS } })
    } else {
      setHealthOpen(true)
    }
  }
  const clearHealth = () => {
    patch({ flags: { ...EMPTY_HEALTH_FLAGS } })
    setHealthOpen(false)
  }

  // ----- Navigation -----
  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }
  const handleContinue = () => {
    if (!canContinue) return
    // Arriving at the designation step: pre-select the System's suggestion (still overridable).
    if (step === 3 && draft.archetype === null) patch({ archetype: suggested })
    goTo(step + 1)
  }
  const handleBack = () => {
    if (step > 1 && !saving) goTo(step - 1)
  }

  /** Scroll the class mini-card row by one card width (desktop chevrons). */
  const scrollClassRow = (dir: -1 | 1) => {
    const row = classRowRef.current
    if (!row) return
    const card = row.querySelector<HTMLElement>('[data-class-card]')
    row.scrollBy({ left: dir * ((card?.offsetWidth ?? 144) + 10), behavior: 'smooth' })
  }

  // ----- Finish: single async operation -----
  const finish = async () => {
    if (!session?.user) {
      setSaveError('Session lost. Please sign in again, Ascendant.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const userId = session.user.id
      if (!assessmentSaved.current) {
        const { error } = await supabase.from('assessments').insert({
          user_id: userId,
          age: ageN,
          sex: draft.sex,
          height_cm: heightN,
          weight_kg: weightN,
          target_weight_kg: targetProvided ? targetN : null,
          activity_level: draft.activity,
          experience: draft.experience,
          goal: draft.goal,
          equipment: draft.equipment,
          days_per_week: draft.days,
          session_length_min: draft.session,
          diet_pref: draft.diet,
          country: draft.country,
          allergies: parseAllergies(draft.allergies),
          health_flags: draft.flags,
          bmi: bmiVal,
          bodyfat_est_low: bodyFat?.low ?? null,
          bodyfat_est_high: bodyFat?.high ?? null,
        })
        if (error) throw error
        assessmentSaved.current = true
      }
      const { error: charError } = await supabase
        .from('character_profiles')
        .update({ class: draft.clazz, archetype: draft.archetype, stats: finalStats, rank: 'E' })
        .eq('user_id', userId)
      if (charError) throw charError
      const { error: profileError } = await supabase.from('profiles').update({ onboarded: true }).eq('id', userId)
      if (profileError) throw profileError
      await useAuth.getState().loadUserData()
      navigate('/app')
    } catch {
      setSaveError('The System could not record your Ascension. Check your connection and try again.')
      setSaving(false)
    }
  }

  // ----- Step content -----
  const renderStep = () => {
    switch (step) {
      // ---------------- STEP 1 · INTRO ----------------
      case 1:
        return (
          <div className="flex flex-col items-center gap-6 pt-8 text-center sm:pt-14">
            <motion.div
              initial={{ opacity: 0, scale: 0.55 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <LogoMark size={72} className="animate-pulse-glow" />
            </motion.div>
            <div className="space-y-2">
              <motion.p
                {...fadeUp(0.3)}
                className="font-display text-3xl font-black tracking-[0.2em] text-ink uppercase text-glow sm:text-5xl"
              >
                Ascendant.
              </motion.p>
              <motion.p {...fadeUp(0.7)} className="text-lg font-semibold text-glow-soft">
                You have been selected.
              </motion.p>
              <motion.p {...fadeUp(1.0)} className="text-sm text-mute sm:text-base">
                The System will now assess your vessel.
              </motion.p>
            </div>
            <Rise delay={1.35} className="w-full">
              <div className="glass clip-system rounded-lg p-3.5 text-left">
                <p className="mb-2 flex items-center gap-1.5 font-display text-[0.58rem] font-bold tracking-[0.3em] text-glow-soft uppercase">
                  <ShieldAlert size={12} /> System Notice
                </p>
                <ul className="space-y-1.5 text-xs leading-relaxed text-mute">
                  <li className="flex gap-2">
                    <span className="text-sky-400/80">◆</span>General fitness information — not medical advice.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sky-400/80">◆</span>Consult a physician before starting any training program.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sky-400/80">◆</span>The System accepts Ascendants aged 16 and above.
                  </li>
                </ul>
              </div>
            </Rise>
          </div>
        )

      // ---------------- STEP 2 · VITALS + INLINE HEALTH ----------------
      case 2: {
        const flagged = anyHealthFlag(draft.flags)
        return (
          <div>
            <StepHeading kicker="Assessment 01 · Vessel" title="Vital Parameters" sub="The System requires your physical baseline, Ascendant." />
            <Rise delay={0.1}>
              <SystemPanel title="Body Registry" icon={<Ruler size={13} />} animate={false}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Age" hint="16–100 years" error={ageError}>
                    <input
                      className="sys-input"
                      type="number"
                      inputMode="numeric"
                      min={16}
                      max={100}
                      placeholder="e.g. 24"
                      value={draft.age}
                      onChange={(e) => patch({ age: e.target.value })}
                    />
                  </Field>
                  <div>
                    <span className="sys-label">Sex</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(['male', 'female', 'other'] as const).map((s) => (
                        <Chip key={s} active={draft.sex === s} onClick={() => patch({ sex: s })}>
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <Field label="Height (cm)" hint="100–250 cm" error={heightError}>
                    <input
                      className="sys-input"
                      type="number"
                      inputMode="decimal"
                      min={100}
                      max={250}
                      placeholder="e.g. 175"
                      value={draft.height}
                      onChange={(e) => patch({ height: e.target.value })}
                    />
                  </Field>
                  <Field label="Weight (kg)" hint="30–300 kg" error={weightError}>
                    <input
                      className="sys-input"
                      type="number"
                      inputMode="decimal"
                      min={30}
                      max={300}
                      placeholder="e.g. 72"
                      value={draft.weight}
                      onChange={(e) => patch({ weight: e.target.value })}
                    />
                  </Field>
                  <Field label="Target Weight (kg) — optional" hint="Leave blank if unsure" error={targetError}>
                    <input
                      className="sys-input"
                      type="number"
                      inputMode="decimal"
                      min={30}
                      max={300}
                      placeholder="e.g. 68"
                      value={draft.target}
                      onChange={(e) => patch({ target: e.target.value })}
                    />
                  </Field>
                </div>

                {/* Inline health screen — expands only when relevant, never blocks. */}
                <div className="mt-5 border-t border-line/60 pt-4">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={healthOpen}
                    onClick={toggleHealthSection}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-md border px-3.5 py-2.5 text-left transition-all duration-200 ${
                      healthOpen ? 'border-amber-400/50 bg-amber-500/5' : 'border-line bg-abyss/50 hover:border-sky-400/40'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                        healthOpen ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-mute/50 text-transparent'
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      I have a medical condition, injury, or take relevant medication
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {healthOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 mb-2 text-xs text-mute">Mark anything that applies — nothing here blocks your Ascension:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {HEALTH_FLAGS.map((f) => {
                            const checked = draft.flags[f.key]
                            return (
                              <button
                                key={f.key}
                                type="button"
                                role="checkbox"
                                aria-checked={checked}
                                title={f.desc}
                                onClick={() => patch({ flags: toggleHealthFlag(draft.flags, f.key) })}
                                className={`flex min-h-11 items-center gap-2 rounded-md border px-2.5 py-2 text-left transition-all duration-200 ${
                                  checked ? 'border-amber-400/60 bg-amber-500/10' : 'border-line bg-abyss/50 hover:border-sky-400/40'
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                                    checked ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-mute/50 text-transparent'
                                  }`}
                                >
                                  <Check size={11} strokeWidth={3} />
                                </span>
                                <span className="text-xs leading-tight font-semibold text-ink">{f.label}</span>
                              </button>
                            )
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={clearHealth}
                          className="mt-2.5 rounded-md border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-all duration-200 hover:bg-success/20 active:scale-[0.97]"
                        >
                          None of these — all clear
                        </button>

                        <AnimatePresence>
                          {flagged && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.3, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <div className="flex gap-3 rounded-md border border-amber-400/40 bg-amber-500/10 p-3">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-300" />
                                <p className="text-xs leading-relaxed text-amber-100/90">
                                  <span className="font-semibold text-amber-200">Guidance, not a gate.</span> Please get clearance from a
                                  physician before intense training. You can absolutely continue your Ascension — the System keeps
                                  high-intensity content gated for your safety, and every path can begin gently.
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </SystemPanel>
            </Rise>
          </div>
        )
      }

      // ---------------- STEP 3 · TRAINING CONTEXT + RANK CALIBRATION ----------------
      case 3: {
        const expDesc = EXPERIENCE_OPTIONS.find((o) => o.id === draft.experience)?.desc
        const goalDesc = GOAL_OPTIONS.find((o) => o.id === draft.goal)?.desc
        return (
          <div>
            <StepHeading kicker="Assessment 02 · Context" title="Training Context" sub="Define the conditions of your ascent." />
            <div className="space-y-4">
              <Rise delay={0.08}>
                <SystemPanel title="Operational Profile" icon={<Sparkles size={13} />} animate={false}>
                  <div className="space-y-4">
                    <Field label="Current activity level">
                      <select
                        className="sys-input"
                        value={draft.activity ?? ''}
                        onChange={(e) => patch({ activity: e.target.value || null })}
                      >
                        <option value="" disabled>
                          Select your activity level…
                        </option>
                        {Object.entries(ACTIVITY_MULTIPLIERS).map(([id, def]) => (
                          <option key={id} value={id}>
                            {def.label} — ×{def.factor}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div>
                      <span className="sys-label">Experience</span>
                      <div className="flex flex-wrap gap-2">
                        {EXPERIENCE_OPTIONS.map((o) => (
                          <Chip key={o.id} active={draft.experience === o.id} onClick={() => patch({ experience: o.id })} title={o.desc}>
                            {o.label}
                          </Chip>
                        ))}
                      </div>
                      {expDesc && <span className="mt-1 block text-[0.7rem] text-mute/70">{expDesc}</span>}
                    </div>

                    <div>
                      <span className="sys-label">Primary objective</span>
                      <div className="flex flex-wrap gap-2">
                        {GOAL_OPTIONS.map((o) => (
                          <Chip key={o.id} active={draft.goal === o.id} onClick={() => patch({ goal: o.id })} title={o.desc}>
                            {o.label}
                          </Chip>
                        ))}
                      </div>
                      {goalDesc && <span className="mt-1 block text-[0.7rem] text-mute/70">{goalDesc}</span>}
                    </div>

                    <Field label="Country" hint="Sets your default meal-plan cuisine — you can browse every cuisine later.">
                      <select
                        className="sys-input"
                        value={draft.country ?? ''}
                        onChange={(e) => patch({ country: e.target.value || null })}
                      >
                        <option value="" disabled>
                          Select your country…
                        </option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <span className="sys-label">Diet preference</span>
                        <div className="flex flex-wrap gap-2">
                          {DIET_OPTIONS.map((o) => (
                            <Chip key={o.id} active={draft.diet === o.id} onClick={() => patch({ diet: o.id })}>
                              {o.label}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      <Field label="Allergies — optional" hint="Comma-separated, e.g. peanuts, lactose">
                        <input
                          className="sys-input"
                          type="text"
                          placeholder="None"
                          value={draft.allergies}
                          onChange={(e) => patch({ allergies: e.target.value })}
                        />
                      </Field>
                    </div>

                    <div>
                      <span className="sys-label">Available equipment</span>
                      <div className="flex flex-wrap gap-1.5">
                        {EQUIPMENT_OPTIONS.map((e) => (
                          <Chip key={e} active={draft.equipment.includes(e)} onClick={() => patch({ equipment: toggleEquipment(draft.equipment, e) })}>
                            {e}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <span className="sys-label">Days per week</span>
                        <div className="flex flex-wrap gap-1.5">
                          {DAYS_OPTIONS.map((d) => (
                            <Chip key={d} active={draft.days === d} onClick={() => patch({ days: d })}>
                              {d}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="sys-label">Session length</span>
                        <div className="flex flex-wrap gap-1.5">
                          {SESSION_LENGTHS.map((m) => (
                            <Chip
                              key={m}
                              active={!sessionCustom && draft.session === m}
                              onClick={() => {
                                setSessionCustom(false)
                                patch({ session: m })
                              }}
                            >
                              {m} min
                            </Chip>
                          ))}
                          <Chip
                            active={sessionCustom}
                            onClick={() => {
                              setSessionCustom(true)
                              patch({ session: numInRange(customSession, 10, 180) })
                            }}
                          >
                            Custom
                          </Chip>
                        </div>
                        {sessionCustom && (
                          <div className="mt-2">
                            <input
                              className="sys-input w-36"
                              type="number"
                              inputMode="numeric"
                              min={10}
                              max={180}
                              placeholder="e.g. 75"
                              aria-label="Custom session length in minutes"
                              value={customSession}
                              onChange={(e) => {
                                setCustomSession(e.target.value)
                                patch({ session: numInRange(e.target.value, 10, 180) })
                              }}
                            />
                            {customSessionError ? (
                              <span className="mt-1 block text-xs font-semibold text-danger">{customSessionError}</span>
                            ) : (
                              <span className="mt-1 block text-xs text-mute/70">Minutes per session — 10 to 180.</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SystemPanel>
              </Rise>

              <Rise delay={0.16}>
                <SystemPanel title="Rank Calibration" icon={<Swords size={13} />} animate={false}>
                  <p className="mb-3 text-xs text-mute">
                    The System measures your base parameters. Estimates are acceptable — zero is a valid answer.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <Field label="Max push-ups" error={pushError}>
                      <input
                        className="sys-input"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={500}
                        placeholder="12"
                        value={draft.pushups}
                        onChange={(e) => patch({ pushups: e.target.value })}
                      />
                    </Field>
                    <Field label="Plank (sec)" error={plankError}>
                      <input
                        className="sys-input"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={3600}
                        placeholder="45"
                        value={draft.plank}
                        onChange={(e) => patch({ plank: e.target.value })}
                      />
                    </Field>
                    <Field label="Squats / 60s" error={squatError}>
                      <input
                        className="sys-input"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={500}
                        placeholder="25"
                        value={draft.squats}
                        onChange={(e) => patch({ squats: e.target.value })}
                      />
                    </Field>
                  </div>
                  <p className="mt-3 text-[0.7rem] leading-relaxed text-mute/80">
                    Perform each trial safely on a stable surface. Stop immediately if you feel pain or dizziness — the System values
                    your longevity above your numbers.
                  </p>
                </SystemPanel>
              </Rise>
            </div>
          </div>
        )
      }

      // ---------------- STEP 4 · ARCHETYPE & CLASS ----------------
      case 4:
        return (
          <div>
            <StepHeading
              kicker="Assessment 03 · Designation"
              title="Archetype & Class"
              sub="Swipe to choose the physique you seek. The System suggests — you decide, Ascendant."
            />
            <div className="space-y-5">
              <Rise delay={0.08} className="-mx-4 sm:-mx-6">
                <ArchetypeCarousel value={draft.archetype} suggestedId={suggested} onChange={(id) => patch({ archetype: id })} />
              </Rise>

              <Rise delay={0.16}>
                <div className="flex items-stretch justify-center gap-3 rounded-md border border-line bg-abyss/60 px-3 py-2.5">
                  <div className="flex-1 text-center">
                    <p className="font-display text-[0.52rem] font-bold tracking-[0.28em] text-mute uppercase">BMI est.</p>
                    <p className="mt-0.5 font-display text-base font-bold text-glow-soft">{bmiVal ?? '—'}</p>
                  </div>
                  <div className="w-px bg-line" />
                  <div className="flex-1 text-center">
                    <p className="font-display text-[0.52rem] font-bold tracking-[0.28em] text-mute uppercase">Body-fat est.</p>
                    <p className="mt-0.5 font-display text-base font-bold text-glow-soft">
                      {bodyFat ? `${bodyFat.low}–${bodyFat.high}%` : '—'}
                    </p>
                  </div>
                </div>
                <p className="mt-1.5 text-center text-[0.68rem] text-mute/70">Rough estimates only — not a diagnosis.</p>
              </Rise>

              <Rise delay={0.24}>
                <h2 className="mb-2.5 font-display text-[0.66rem] font-bold tracking-[0.3em] text-glow-soft uppercase">
                  Choose your Class <span className="text-mute normal-case tracking-normal">— how you train</span>
                </h2>
                <div className="relative -mx-4 sm:-mx-6">
                  <div ref={classRowRef} className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1 sm:px-6">
                    {CLASSES.map((c) => {
                      const selected = draft.clazz === c.id
                      return (
                        <button
                          key={c.id}
                          type="button"
                          data-class-card
                          onClick={() => patch({ clazz: c.id })}
                          aria-pressed={selected}
                          className={`flex w-36 shrink-0 flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all duration-200 active:scale-[0.97] ${
                            selected ? 'glow-border bg-sky-500/10' : 'border-line bg-abyss/50 hover:border-sky-400/40'
                          }`}
                        >
                          <Emblem id={c.id} size={40} active={selected} />
                          <span className="font-display text-[0.7rem] font-bold tracking-[0.12em] uppercase" style={{ color: c.color }}>
                            {c.name}
                          </span>
                          <span className="text-[0.68rem] leading-snug text-mute">{c.tagline}</span>
                          <span className="text-[0.62rem] font-semibold text-glow-soft">{c.statBias.map((k) => `+${k}`).join(' · ')}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Mobile: subtle edge fades signal horizontal scrollability. */}
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-void to-transparent sm:hidden" />
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-void to-transparent sm:hidden" />

                  {/* Desktop: chevron controls, matching the archetype carousel. */}
                  <button
                    type="button"
                    onClick={() => scrollClassRow(-1)}
                    aria-label="Previous classes"
                    className="absolute top-1/2 left-1 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-abyss/90 text-glow-soft transition hover:border-sky-400/50 hover:text-sky-200 hover:shadow-[0_0_14px_rgba(56,189,248,0.25)] sm:inline-flex"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollClassRow(1)}
                    aria-label="Next classes"
                    className="absolute top-1/2 right-1 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-abyss/90 text-glow-soft transition hover:border-sky-400/50 hover:text-sky-200 hover:shadow-[0_0_14px_rgba(56,189,248,0.25)] sm:inline-flex"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                {draft.clazz && (
                  <p className="mt-2 text-xs leading-snug text-mute">{classById(draft.clazz)?.desc}</p>
                )}
              </Rise>
            </div>
          </div>
        )

      // ---------------- STEP 5 · REVEAL ----------------
      case 5: {
        const rankE = rankById('E')
        const chosenClass = classById(draft.clazz)
        const chosenArch = archetypeById(draft.archetype)
        return (
          <div className="flex flex-col items-center gap-6 pt-2 text-center">
            <motion.p
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
              className="font-display text-2xl font-black tracking-[0.22em] text-ink uppercase text-glow sm:text-4xl"
            >
              You Have Ascended
            </motion.p>

            <Rise delay={0.5} className="w-full">
              <div className="flex items-center justify-center gap-5 sm:gap-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
                  className="shrink-0"
                >
                  <CharacterArt
                    archetype={draft.archetype ?? 'blade'}
                    size={225}
                    className="drop-shadow-[0_0_26px_rgba(56,189,248,0.3)]"
                  />
                </motion.div>
                <div className="flex flex-col items-center gap-4">
                  <span
                    className="inline-flex items-center gap-2 rounded-md border px-4 py-1.5 font-display text-sm font-black tracking-[0.3em] uppercase"
                    style={{
                      borderColor: `${rankE.color}66`,
                      color: rankE.color,
                      background: `${rankE.color}0d`,
                      boxShadow: `0 0 22px ${rankE.color}33`,
                      textShadow: `0 0 12px ${rankE.color}88`,
                    }}
                  >
                    Rank {rankE.id}
                  </span>
                  <div className="flex flex-col items-center gap-1">
                    <Emblem id={draft.clazz ?? 'ranger'} size={56} active />
                    <p className="font-display text-xs font-bold tracking-[0.2em] text-ink uppercase">{chosenClass?.name ?? '—'}</p>
                    <p className="font-display text-[0.5rem] font-bold tracking-[0.3em] text-mute uppercase">Class</p>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <p
                      className="font-display text-xs font-bold tracking-[0.2em] uppercase"
                      style={{ color: chosenArch?.color ?? '#38bdf8' }}
                    >
                      {chosenArch?.name ?? '—'}
                    </p>
                    <p className="font-display text-[0.5rem] font-bold tracking-[0.3em] text-mute uppercase">Archetype</p>
                  </div>
                </div>
              </div>
            </Rise>

            <Rise delay={0.95} className="w-full text-left">
              <SystemPanel title="Ascendant Parameters" icon={<Sparkles size={13} />} animate={false}>
                <div className="space-y-3">
                  {STAT_KEYS.map((k, i) => {
                    const value = finalStats[k]
                    const bonus = value - DEFAULT_STATS[k]
                    return (
                      <motion.div
                        key={k}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + i * 0.09, duration: 0.4, ease: EASE }}
                      >
                        <div className="mb-1 flex items-baseline justify-between gap-2">
                          <span className="text-xs font-semibold tracking-wide text-mute">
                            <span className="font-display font-bold text-ink">{k}</span> · {STAT_META[k].label}
                          </span>
                          <span className="font-display text-sm font-bold text-ink">
                            {value}
                            {bonus > 0 && <span className="ml-1.5 text-[0.68rem] text-gold text-glow-gold">+{bonus}</span>}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full border border-line/60 bg-abyss">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (value / 16) * 100)}%` }}
                            transition={{ delay: 1.2 + i * 0.09, duration: 0.7, ease: EASE }}
                            className="h-full rounded-full"
                            style={{ background: STAT_META[k].color, boxShadow: `0 0 10px ${STAT_META[k].color}` }}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                <p className="mt-4 text-xs text-mute/80">Base parameters calibrated from your trial, class and archetype.</p>
              </SystemPanel>
            </Rise>

            <Rise delay={1.9} className="w-full">
              {saveError && (
                <p className="mb-3 text-sm font-semibold text-danger" role="alert">
                  {saveError}
                </p>
              )}
              <GlowButton variant="gold" size="lg" full loading={saving} onClick={() => void finish()}>
                {saveError ? 'Retry — Enter the System' : 'Enter the System'}
              </GlowButton>
            </Rise>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="grid-bg relative min-h-dvh overflow-x-hidden bg-void">
      {/* Ambient glow backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-36 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-[-6rem] h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pt-safe pb-safe sm:px-6">
        {/* Persistent protocol header */}
        <header className="pt-5 sm:pt-8">
          <div className="flex items-center justify-center gap-2.5">
            <LogoMark size={22} />
            <span className="font-display text-[0.56rem] font-bold tracking-[0.32em] text-glow-soft uppercase sm:text-[0.66rem]">
              Ascension Protocol <span className="text-mute">·</span> Step {step}/{TOTAL_STEPS}
            </span>
          </div>
          <div className="mt-3.5 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const idx = i + 1
              return (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    idx < step
                      ? 'bg-sky-400/80 shadow-[0_0_8px_rgba(56,189,248,0.55)]'
                      : idx === step
                        ? 'animate-pulse-glow bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.9)]'
                        : 'bg-line/60'
                  }`}
                />
              )
            })}
          </div>
        </header>

        {/* Animated step body */}
        <main className="flex-1 pt-6 pb-10 sm:pt-8">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div key={step} custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit">
              {renderStep()}

              {/* Step navigation */}
              <div className="mt-7 flex items-center gap-3">
                {step > 1 && (
                  <GlowButton variant="ghost" onClick={handleBack} disabled={saving} icon={<ArrowLeft size={15} />} aria-label="Back">
                    Back
                  </GlowButton>
                )}
                {step === 1 && (
                  <GlowButton full size="lg" onClick={handleContinue}>
                    Begin Assessment
                    <ArrowRight size={15} />
                  </GlowButton>
                )}
                {step > 1 && step < TOTAL_STEPS && (
                  <GlowButton className="flex-1" onClick={handleContinue} disabled={!canContinue}>
                    Continue
                    <ArrowRight size={15} />
                  </GlowButton>
                )}
              </div>
              {step > 1 && step < TOTAL_STEPS && !canContinue && (
                <p className="mt-2.5 text-center text-xs text-mute/70">Complete the fields above and the System will let you proceed.</p>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
