// THE AWAKENING — cinematic multi-step onboarding wizard (standalone full-screen page).
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, HeartPulse, Ruler, ShieldAlert, Sparkles, Swords, Timer, Utensils } from 'lucide-react'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { Emblem } from '../components/system/Emblem'
import { LogoMark } from '../components/system/Logo'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/auth'
import { ARCHETYPES, CLASSES, DEFAULT_STATS, STAT_KEYS, STAT_META, archetypeById, classById, rankById } from '../lib/game'
import { ACTIVITY_MULTIPLIERS, bmi, bodyFatEstimate } from '../lib/tdee'
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

const TOTAL_STEPS = 7
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

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 rounded-md border px-3.5 py-2 font-display text-[0.62rem] font-bold tracking-[0.18em] uppercase transition-all duration-200 active:scale-[0.97] ${
        active
          ? 'border-sky-400/70 bg-sky-500/15 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,0.28)]'
          : 'border-line bg-abyss/60 text-mute hover:border-sky-400/40 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function OptionRow({
  active,
  onClick,
  title,
  desc,
  badge,
}: {
  active: boolean
  onClick: () => void
  title: string
  desc?: string
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-11 w-full items-center gap-3 rounded-md border px-3.5 py-2.5 text-left transition-all duration-200 ${
        active
          ? 'border-sky-400/70 bg-sky-500/10 shadow-[0_0_14px_rgba(56,189,248,0.18)]'
          : 'border-line bg-abyss/50 hover:border-sky-400/40'
      }`}
    >
      <span
        className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-all ${
          active ? 'border-sky-300 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'border-mute/50'
        }`}
      />
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-semibold ${active ? 'text-sky-100' : 'text-ink'}`}>{title}</span>
        {desc && <span className="block text-xs text-mute">{desc}</span>}
      </span>
      {badge && (
        <span className="shrink-0 font-display text-[0.55rem] font-bold tracking-[0.15em] text-glow-soft/80 uppercase">{badge}</span>
      )}
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

  const ageError = draft.age.trim() !== '' && ageN === null ? 'The System accepts Hunters aged 16–100.' : null
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
    draft.diet !== null

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
    step === 2 ? vitalsValid : step === 4 ? contextValid : step === 5 ? calibrationValid : step === 6 ? draft.archetype !== null && draft.clazz !== null : true

  // ----- Navigation -----
  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }
  const handleContinue = () => {
    if (!canContinue) return
    // Arriving at the designation step: pre-select the System's suggestion (still overridable).
    if (step === 5 && draft.archetype === null) patch({ archetype: suggested })
    goTo(step + 1)
  }
  const handleBack = () => {
    if (step > 1 && !saving) goTo(step - 1)
  }

  // ----- Finish: single async operation -----
  const finish = async () => {
    if (!session?.user) {
      setSaveError('Session lost. Please sign in again, Hunter.')
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
      setSaveError('The System could not record your Awakening. Check your connection and try again.')
      setSaving(false)
    }
  }

  // ----- Step content -----
  const renderStep = () => {
    switch (step) {
      // ---------------- STEP 1 · INTRO ----------------
      case 1:
        return (
          <div className="flex flex-col items-center gap-7 pt-6 text-center sm:pt-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.55 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <LogoMark size={76} className="animate-pulse-glow" />
            </motion.div>
            <div className="space-y-3">
              <motion.p
                {...fadeUp(0.35)}
                className="font-display text-3xl font-black tracking-[0.2em] text-ink uppercase text-glow sm:text-5xl"
              >
                Hunter.
              </motion.p>
              <motion.p {...fadeUp(0.85)} className="text-lg font-semibold text-glow-soft sm:text-xl">
                You have been selected.
              </motion.p>
              <motion.p {...fadeUp(1.3)} className="text-base text-mute sm:text-lg">
                The System will now assess your vessel.
              </motion.p>
            </div>
            <Rise delay={1.75} className="w-full text-left">
              <SystemPanel title="System Notice" icon={<ShieldAlert size={13} />} animate={false}>
                <ul className="space-y-2 text-sm leading-relaxed text-mute">
                  <li className="flex gap-2">
                    <span className="mt-1 text-sky-400/80">◆</span>
                    ASCEND provides general fitness information — it is not medical advice.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 text-sky-400/80">◆</span>
                    Consult a physician before starting any training program, especially if you have a health condition.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 text-sky-400/80">◆</span>
                    The System accepts Hunters aged 16 and above.
                  </li>
                </ul>
              </SystemPanel>
            </Rise>
          </div>
        )

      // ---------------- STEP 2 · VITALS ----------------
      case 2:
        return (
          <div>
            <StepHeading kicker="Assessment 01 · Vessel" title="Vital Parameters" sub="The System requires your physical baseline, Hunter." />
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
                    <div className="flex flex-wrap gap-2">
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
              </SystemPanel>
            </Rise>
          </div>
        )

      // ---------------- STEP 3 · HEALTH SCREEN ----------------
      case 3: {
        const flagged = anyHealthFlag(draft.flags)
        return (
          <div>
            <StepHeading kicker="Assessment 02 · Safety" title="Health Screen" sub="Answer honestly. Nothing here blocks your Awakening." />
            <Rise delay={0.1}>
              <SystemPanel title="Readiness Query" icon={<HeartPulse size={13} />} animate={false}>
                <p className="mb-3 text-sm text-mute">Mark anything that applies to you:</p>
                <div className="space-y-2.5">
                  {HEALTH_FLAGS.map((f, i) => {
                    const checked = draft.flags[f.key]
                    return (
                      <motion.button
                        key={f.key}
                        {...fadeUp(0.15 + i * 0.06)}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => patch({ flags: toggleHealthFlag(draft.flags, f.key) })}
                        className={`flex w-full items-start gap-3 rounded-md border p-3 text-left transition-all duration-200 ${
                          checked ? 'border-amber-400/60 bg-amber-500/10' : 'border-line bg-abyss/50 hover:border-sky-400/40'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                            checked ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-mute/50 text-transparent'
                          }`}
                        >
                          <Check size={13} strokeWidth={3} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-ink">{f.label}</span>
                          <span className="block text-xs leading-snug text-mute">{f.desc}</span>
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
                <AnimatePresence>
                  {flagged && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-3 rounded-md border border-amber-400/40 bg-amber-500/10 p-3.5">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
                        <div className="space-y-1 text-sm leading-relaxed text-amber-100/90">
                          <p className="font-semibold text-amber-200">Guidance from the System — not a gate.</p>
                          <p>
                            Please get clearance from a physician before intense training. You can absolutely continue your Awakening —
                            the System will keep advanced breathwork and high-intensity content gated for your safety, and every path
                            can begin gently. Your ascent is still yours, Hunter.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SystemPanel>
            </Rise>
          </div>
        )
      }

      // ---------------- STEP 4 · CONTEXT ----------------
      case 4:
        return (
          <div>
            <StepHeading kicker="Assessment 03 · Context" title="Training Context" sub="Define the conditions of your ascent." />
            <div className="space-y-4">
              <Rise delay={0.08}>
                <SystemPanel title="Operational Profile" icon={<Sparkles size={13} />} animate={false}>
                  <div className="space-y-5">
                    <div>
                      <span className="sys-label">Current activity level</span>
                      <div className="space-y-2">
                        {Object.entries(ACTIVITY_MULTIPLIERS).map(([id, def]) => (
                          <OptionRow
                            key={id}
                            active={draft.activity === id}
                            onClick={() => patch({ activity: id })}
                            title={def.label}
                            badge={`×${def.factor}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="sys-label">Experience</span>
                      <div className="space-y-2">
                        {EXPERIENCE_OPTIONS.map((o) => (
                          <OptionRow
                            key={o.id}
                            active={draft.experience === o.id}
                            onClick={() => patch({ experience: o.id })}
                            title={o.label}
                            desc={o.desc}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="sys-label">Primary objective</span>
                      <div className="space-y-2">
                        {GOAL_OPTIONS.map((o) => (
                          <OptionRow key={o.id} active={draft.goal === o.id} onClick={() => patch({ goal: o.id })} title={o.label} desc={o.desc} />
                        ))}
                      </div>
                    </div>
                  </div>
                </SystemPanel>
              </Rise>

              <Rise delay={0.18}>
                <SystemPanel title="Arsenal & Schedule" icon={<Timer size={13} />} animate={false}>
                  <div className="space-y-5">
                    <div>
                      <span className="sys-label">Available equipment</span>
                      <div className="flex flex-wrap gap-2">
                        {EQUIPMENT_OPTIONS.map((e) => (
                          <Chip key={e} active={draft.equipment.includes(e)} onClick={() => patch({ equipment: toggleEquipment(draft.equipment, e) })}>
                            {e}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="sys-label">Training days per week</span>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OPTIONS.map((d) => (
                          <Chip key={d} active={draft.days === d} onClick={() => patch({ days: d })}>
                            {d}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="sys-label">Session length</span>
                      <div className="flex flex-wrap gap-2">
                        {SESSION_LENGTHS.map((m) => (
                          <Chip key={m} active={draft.session === m} onClick={() => patch({ session: m })}>
                            {m} min
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                </SystemPanel>
              </Rise>

              <Rise delay={0.28}>
                <SystemPanel title="Provisions" icon={<Utensils size={13} />} animate={false}>
                  <div className="space-y-5">
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
                </SystemPanel>
              </Rise>
            </div>
          </div>
        )

      // ---------------- STEP 5 · RANK CALIBRATION ----------------
      case 5:
        return (
          <div>
            <StepHeading
              kicker="Assessment 04 · Trial"
              title="Rank Calibration"
              sub="The System measures your base parameters. Estimates are acceptable — zero is a valid answer."
            />
            <Rise delay={0.1}>
              <SystemPanel title="Baseline Trial" icon={<Swords size={13} />} animate={false}>
                <div className="space-y-4">
                  <Field label="Max push-ups in one set" hint="Full range, unbroken" error={pushError}>
                    <input
                      className="sys-input"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={500}
                      placeholder="e.g. 12"
                      value={draft.pushups}
                      onChange={(e) => patch({ pushups: e.target.value })}
                    />
                  </Field>
                  <Field label="Plank hold (seconds)" hint="Stop the timer when form breaks" error={plankError}>
                    <input
                      className="sys-input"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={3600}
                      placeholder="e.g. 45"
                      value={draft.plank}
                      onChange={(e) => patch({ plank: e.target.value })}
                    />
                  </Field>
                  <Field label="Bodyweight squats in 60 seconds" hint="Controlled reps only" error={squatError}>
                    <input
                      className="sys-input"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={500}
                      placeholder="e.g. 25"
                      value={draft.squats}
                      onChange={(e) => patch({ squats: e.target.value })}
                    />
                  </Field>
                  <p className="text-xs leading-relaxed text-mute/80">
                    Perform each trial safely on a stable surface. Stop immediately if you feel pain, dizziness or discomfort — the
                    System values your longevity above your numbers.
                  </p>
                </div>
              </SystemPanel>
            </Rise>
          </div>
        )

      // ---------------- STEP 6 · ARCHETYPE + CLASS ----------------
      case 6:
        return (
          <div>
            <StepHeading kicker="Assessment 05 · Designation" title="Archetype & Class" sub="The System suggests. You decide, Hunter." />
            <div className="space-y-5">
              <Rise delay={0.08}>
                <SystemPanel title="Vessel Analysis" icon={<HeartPulse size={13} />} animate={false}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-line bg-abyss/60 p-3 text-center">
                      <p className="font-display text-[0.55rem] font-bold tracking-[0.3em] text-mute uppercase">BMI est.</p>
                      <p className="mt-1 font-display text-xl font-bold text-glow-soft">{bmiVal ?? '—'}</p>
                    </div>
                    <div className="rounded-md border border-line bg-abyss/60 p-3 text-center">
                      <p className="font-display text-[0.55rem] font-bold tracking-[0.3em] text-mute uppercase">Body-fat est.</p>
                      <p className="mt-1 font-display text-xl font-bold text-glow-soft">
                        {bodyFat ? `${bodyFat.low}–${bodyFat.high}%` : '—'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-mute/80">BMI and body-fat are rough estimates, not a diagnosis.</p>
                </SystemPanel>
              </Rise>

              <Rise delay={0.16}>
                <h2 className="mb-2.5 font-display text-[0.66rem] font-bold tracking-[0.3em] text-glow-soft uppercase">
                  Choose your Archetype <span className="text-mute normal-case tracking-normal">— the physique you seek</span>
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ARCHETYPES.map((a, i) => {
                    const selected = draft.archetype === a.id
                    return (
                      <motion.button
                        key={a.id}
                        {...fadeUp(0.2 + i * 0.06)}
                        type="button"
                        onClick={() => patch({ archetype: a.id })}
                        aria-pressed={selected}
                        className={`clip-system relative flex items-center gap-3 rounded-lg border p-3.5 text-left transition-all duration-200 active:scale-[0.98] ${
                          selected ? 'glow-border bg-sky-500/10' : 'border-line bg-abyss/50 hover:border-sky-400/40'
                        }`}
                      >
                        {suggested === a.id && (
                          <span className="absolute top-2 right-2 rounded-sm border border-gold/50 bg-gold/10 px-1.5 py-0.5 font-display text-[0.48rem] font-bold tracking-[0.22em] text-gold">
                            SUGGESTED
                          </span>
                        )}
                        <Emblem id={a.id} size={54} active={selected} className="shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-display text-sm font-bold tracking-[0.12em] uppercase" style={{ color: a.color }}>
                            {a.name}
                          </span>
                          <span className="block text-xs font-semibold text-ink">{a.build}</span>
                          <span className="block text-xs text-mute">{a.focus}</span>
                          <span className="mt-0.5 block text-[0.68rem] font-semibold text-glow-soft">◈ {a.calorieLabel}</span>
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </Rise>

              <Rise delay={0.3}>
                <h2 className="mb-2.5 font-display text-[0.66rem] font-bold tracking-[0.3em] text-glow-soft uppercase">
                  Choose your Class <span className="text-mute normal-case tracking-normal">— how you train</span>
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CLASSES.map((c, i) => {
                    const selected = draft.clazz === c.id
                    return (
                      <motion.button
                        key={c.id}
                        {...fadeUp(0.34 + i * 0.06)}
                        type="button"
                        onClick={() => patch({ clazz: c.id })}
                        aria-pressed={selected}
                        className={`clip-system relative flex items-center gap-3 rounded-lg border p-3.5 text-left transition-all duration-200 active:scale-[0.98] ${
                          selected ? 'glow-border bg-sky-500/10' : 'border-line bg-abyss/50 hover:border-sky-400/40'
                        }`}
                      >
                        <Emblem id={c.id} size={54} active={selected} className="shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-display text-sm font-bold tracking-[0.12em] uppercase" style={{ color: c.color }}>
                            {c.name}
                          </span>
                          <span className="block text-xs font-semibold text-ink">{c.tagline}</span>
                          <span className="block text-xs leading-snug text-mute">{c.desc}</span>
                          <span className="mt-0.5 block text-[0.68rem] font-semibold text-glow-soft">
                            {c.statBias.map((k) => `+${k}`).join(' · ')}
                          </span>
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </Rise>
            </div>
          </div>
        )

      // ---------------- STEP 7 · REVEAL ----------------
      case 7: {
        const rankE = rankById('E')
        const chosenClass = classById(draft.clazz)
        const chosenArch = archetypeById(draft.archetype)
        return (
          <div className="flex flex-col items-center gap-6 pt-4 text-center">
            <motion.p
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
              className="font-display text-2xl font-black tracking-[0.22em] text-ink uppercase text-glow sm:text-4xl"
            >
              You Have Awakened
            </motion.p>

            <Rise delay={0.55}>
              <span
                className="inline-flex items-center gap-2 rounded-md border px-5 py-2 font-display text-base font-black tracking-[0.35em] uppercase"
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
            </Rise>

            <Rise delay={0.8} className="w-full">
              <div className="flex items-center justify-center gap-5 sm:gap-9">
                <div className="flex flex-col items-center gap-1.5">
                  <Emblem id={draft.clazz ?? 'ranger'} size={72} active />
                  <p className="font-display text-xs font-bold tracking-[0.2em] text-ink uppercase">{chosenClass?.name ?? '—'}</p>
                  <p className="font-display text-[0.5rem] font-bold tracking-[0.3em] text-mute uppercase">Class</p>
                </div>
                <div className="h-16 w-px bg-line" />
                <div className="flex flex-col items-center gap-1.5">
                  <Emblem id={draft.archetype ?? 'blade'} size={72} active />
                  <p className="font-display text-xs font-bold tracking-[0.2em] text-ink uppercase">{chosenArch?.name ?? '—'}</p>
                  <p className="font-display text-[0.5rem] font-bold tracking-[0.3em] text-mute uppercase">Archetype</p>
                </div>
              </div>
            </Rise>

            <Rise delay={1.05} className="w-full text-left">
              <SystemPanel title="Hunter Parameters" icon={<Sparkles size={13} />} animate={false}>
                <div className="space-y-3">
                  {STAT_KEYS.map((k, i) => {
                    const value = finalStats[k]
                    const bonus = value - DEFAULT_STATS[k]
                    return (
                      <motion.div
                        key={k}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.09, duration: 0.4, ease: EASE }}
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
                            transition={{ delay: 1.3 + i * 0.09, duration: 0.7, ease: EASE }}
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

            <Rise delay={2.0} className="w-full">
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
              Awakening Protocol <span className="text-mute">·</span> Step {step}/{TOTAL_STEPS}
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
