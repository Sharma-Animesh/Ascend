// Profile — account, character respec, titles, preferences and system info.
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ChevronRight,
  Crown,
  Info,
  LineChart,
  Lock,
  LogOut,
  Medal,
  Pencil,
  Settings2,
  ShieldCheck,
  Swords,
  Target,
  User,
  X,
} from 'lucide-react'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { Emblem } from '../components/system/Emblem'
import { InlineLoader } from '../components/system/Loader'
import { supabase } from '../lib/supabase'
import type { Profile as ProfileRow } from '../lib/types'
import { ARCHETYPES, CLASSES, TITLE_RULES, archetypeById, classById, rankById } from '../lib/game'
import { useAuth } from '../store/auth'

const EASE = [0.22, 1, 0.36, 1] as const

/** Staggered fade-up wrapper so panels enter one after another. */
function Rise({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-abyss/40 p-3">
      <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-mute uppercase">{label}</p>
      <p className="mt-0.5 truncate text-sm text-ink">{value}</p>
    </div>
  )
}

/** Awakening-style option grid used by the RESPEC choosers. */
function ChooserGrid<T extends { id: string; name: string; color: string }>({
  options,
  currentId,
  busy,
  onPick,
  subtitle,
}: {
  options: T[]
  currentId: string | null
  busy: boolean
  onPick: (id: string) => void
  subtitle: (option: T) => string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-1 gap-2 pt-3 sm:grid-cols-2">
        {options.map((o) => {
          const current = o.id === currentId
          return (
            <button
              key={o.id}
              type="button"
              disabled={busy}
              onClick={() => onPick(o.id)}
              className={`flex min-h-16 items-center gap-3 rounded-lg border p-3 text-left transition disabled:opacity-60 ${
                current
                  ? 'glow-border bg-sky-500/10'
                  : 'border-line bg-abyss/50 hover:border-sky-400/50 hover:bg-abyss/80'
              }`}
            >
              <Emblem id={o.id} size={42} active={current} />
              <span className="min-w-0 flex-1">
                <span
                  className="block font-display text-[0.72rem] font-bold tracking-[0.14em] uppercase"
                  style={{ color: o.color }}
                >
                  {o.name}
                </span>
                <span className="block truncate text-xs text-mute">{subtitle(o)}</span>
              </span>
              {current && <Check size={15} className="shrink-0 text-sky-300" />}
            </button>
          )
        })}
      </div>
      <p className="mt-2.5 text-xs text-mute/80">Respec changes future quests, not your earned stats.</p>
    </motion.div>
  )
}

export default function ProfilePage() {
  const { session, profile, character, setProfile, refreshCharacter, signOut } = useAuth()
  const navigate = useNavigate()

  // account
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  // character
  const [chooser, setChooser] = useState<'class' | 'archetype' | null>(null)
  const [respeccing, setRespeccing] = useState(false)
  const [respecError, setRespecError] = useState<string | null>(null)
  // preferences
  const [savingUnits, setSavingUnits] = useState(false)
  const [prefError, setPrefError] = useState<string | null>(null)

  if (!session || !profile) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <InlineLoader label="Syncing profile" />
      </div>
    )
  }

  const cls = classById(character?.class ?? null)
  const arch = archetypeById(character?.archetype ?? null)
  const rank = character ? rankById(character.rank) : null
  const titles = character?.titles ?? []
  const lockedCount = TITLE_RULES.filter((r) => !titles.includes(r.title)).length
  const memberSince = new Date(profile.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const saveName = async (e: FormEvent) => {
    e.preventDefault()
    const name = nameDraft.trim()
    if (!name) {
      setNameError('A Hunter needs a name.')
      return
    }
    setSavingName(true)
    setNameError(null)
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', profile.id)
      .select()
      .single()
    if (error || !data) {
      setNameError('The System could not update your name. Try again.')
    } else {
      setProfile(data as ProfileRow)
      setEditingName(false)
    }
    setSavingName(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/')
    } finally {
      setSigningOut(false)
    }
  }

  const respec = async (kind: 'class' | 'archetype', id: string) => {
    if (!character) return
    const currentId = kind === 'class' ? character.class : character.archetype
    if (currentId === id) {
      setChooser(null)
      return
    }
    setRespeccing(true)
    setRespecError(null)
    const patch = kind === 'class' ? { class: id } : { archetype: id }
    const { error } = await supabase
      .from('character_profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('user_id', character.user_id)
    if (error) {
      setRespecError('Respec failed — the System could not save the change. Try again.')
    } else {
      await refreshCharacter()
      setChooser(null)
    }
    setRespeccing(false)
  }

  const setUnits = async (units: 'metric' | 'imperial') => {
    if (profile.units === units || savingUnits) return
    setSavingUnits(true)
    setPrefError(null)
    const { data, error } = await supabase
      .from('profiles')
      .update({ units })
      .eq('id', profile.id)
      .select()
      .single()
    if (error || !data) setPrefError('Could not save your preference. Try again.')
    else setProfile(data as ProfileRow)
    setSavingUnits(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ---------- ACCOUNT ---------- */}
      <Rise>
        <SystemPanel title="Account" icon={<User size={14} />} animate={false}>
          <div className="space-y-3">
            <div className="rounded-lg border border-line bg-abyss/40 p-3">
              <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-mute uppercase">Hunter Name</p>
              {editingName ? (
                <form className="mt-1.5 flex items-center gap-1.5" onSubmit={saveName}>
                  <input
                    className="sys-input h-11 py-1"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    maxLength={40}
                    autoFocus
                    aria-label="Hunter name"
                  />
                  <button
                    type="submit"
                    disabled={savingName}
                    aria-label="Save name"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line text-success transition hover:border-emerald-400/60 disabled:opacity-50"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Cancel"
                    onClick={() => {
                      setEditingName(false)
                      setNameError(null)
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line text-mute transition hover:text-ink"
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-display text-base font-bold text-ink">
                    {profile.display_name || 'Unnamed Hunter'}
                  </p>
                  <button
                    type="button"
                    aria-label="Edit name"
                    onClick={() => {
                      setNameDraft(profile.display_name ?? '')
                      setEditingName(true)
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-mute transition hover:text-sky-300"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              )}
              {nameError && <p className="mt-1.5 text-xs text-danger">{nameError}</p>}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoRow label="Email" value={session.user.email ?? '—'} />
              <InfoRow label="Member since" value={memberSince} />
            </div>

            <GlowButton
              variant="danger"
              size="sm"
              className="min-h-11"
              icon={<LogOut size={14} />}
              loading={signingOut}
              onClick={() => void handleSignOut()}
            >
              Sign out
            </GlowButton>
          </div>
        </SystemPanel>
      </Rise>

      {/* ---------- CHARACTER ---------- */}
      <Rise delay={0.06}>
        <SystemPanel
          title="Character"
          icon={<Swords size={14} />}
          animate={false}
          action={
            character && rank ? (
              <span className="font-display text-[0.65rem] font-bold tracking-[0.2em]" style={{ color: rank.color }}>
                LV.{character.level} · {rank.label}
              </span>
            ) : undefined
          }
        >
          {character ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-abyss/40 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  {cls ? (
                    <Emblem id={cls.id} size={46} active />
                  ) : (
                    <span className="flex h-[46px] w-[46px] items-center justify-center rounded-md border border-line text-mute">
                      <Swords size={20} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-mute uppercase">Combat Class</p>
                    <p className="truncate font-display text-sm font-bold" style={cls ? { color: cls.color } : undefined}>
                      {cls?.name ?? 'Unassigned'}
                    </p>
                    <p className="truncate text-xs text-mute">{cls?.tagline ?? 'Choose your path'}</p>
                  </div>
                </div>
                <GlowButton
                  size="sm"
                  variant="ghost"
                  className="min-h-11 shrink-0"
                  icon={<Swords size={13} />}
                  onClick={() => setChooser((c) => (c === 'class' ? null : 'class'))}
                >
                  Respec
                </GlowButton>
              </div>
              <AnimatePresence initial={false}>
                {chooser === 'class' && (
                  <ChooserGrid
                    key="class-chooser"
                    options={CLASSES}
                    currentId={character.class}
                    busy={respeccing}
                    onPick={(id) => void respec('class', id)}
                    subtitle={(c) => c.tagline}
                  />
                )}
              </AnimatePresence>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-abyss/40 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  {arch ? (
                    <Emblem id={arch.id} size={46} active />
                  ) : (
                    <span className="flex h-[46px] w-[46px] items-center justify-center rounded-md border border-line text-mute">
                      <Crown size={20} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-mute uppercase">
                      Physique Archetype
                    </p>
                    <p
                      className="truncate font-display text-sm font-bold"
                      style={arch ? { color: arch.color } : undefined}
                    >
                      {arch?.name ?? 'Unassigned'}
                    </p>
                    <p className="truncate text-xs text-mute">{arch?.build ?? 'Choose your form'}</p>
                  </div>
                </div>
                <GlowButton
                  size="sm"
                  variant="ghost"
                  className="min-h-11 shrink-0"
                  icon={<Crown size={13} />}
                  onClick={() => setChooser((c) => (c === 'archetype' ? null : 'archetype'))}
                >
                  Respec
                </GlowButton>
              </div>
              <AnimatePresence initial={false}>
                {chooser === 'archetype' && (
                  <ChooserGrid
                    key="archetype-chooser"
                    options={ARCHETYPES}
                    currentId={character.archetype}
                    busy={respeccing}
                    onPick={(id) => void respec('archetype', id)}
                    subtitle={(a) => `${a.build} · ${a.focus}`}
                  />
                )}
              </AnimatePresence>

              {respecError && <p className="text-xs text-danger">{respecError}</p>}
            </div>
          ) : (
            <p className="text-sm text-mute">No character data yet — complete your Awakening to forge one.</p>
          )}
        </SystemPanel>
      </Rise>

      {/* ---------- TITLES ---------- */}
      <Rise delay={0.12}>
        <SystemPanel title="Titles" icon={<Medal size={14} />} animate={false}>
          {titles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {titles.map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.05, ease: EASE }}
                  className="text-glow-gold inline-flex min-h-9 items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-gold uppercase"
                >
                  <Medal size={13} /> {t}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mute">No titles earned yet — your legend is still being written.</p>
          )}
          {lockedCount > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-mute/80">
              <Lock size={12} /> {lockedCount} more title{lockedCount === 1 ? '' : 's'} lie sealed — level up and keep
              your streak alive to claim them.
            </p>
          )}
        </SystemPanel>
      </Rise>

      {/* ---------- PREFERENCES ---------- */}
      <Rise delay={0.18}>
        <SystemPanel title="Preferences" icon={<Settings2 size={14} />} animate={false}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">Units</p>
              <p className="text-xs text-mute">Data entry is metric for now — this sets your display preference.</p>
            </div>
            <div className="flex shrink-0 overflow-hidden rounded-md border border-line">
              {(['metric', 'imperial'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  disabled={savingUnits}
                  onClick={() => void setUnits(u)}
                  className={`min-h-11 px-4 font-display text-[0.65rem] font-bold tracking-[0.15em] uppercase transition ${
                    profile.units === u
                      ? 'bg-sky-500/20 text-sky-200 shadow-[inset_0_0_12px_rgba(56,189,248,0.25)]'
                      : 'bg-abyss/60 text-mute hover:text-ink'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {prefError && <p className="mt-2 text-xs text-danger">{prefError}</p>}

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              to="/app/goals"
              className="group flex min-h-12 items-center justify-between rounded-lg border border-line bg-abyss/40 px-3.5 py-2.5 transition hover:border-sky-400/50"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                <Target size={16} className="text-sky-300" /> Resolutions
              </span>
              <ChevronRight size={16} className="text-mute transition group-hover:translate-x-0.5 group-hover:text-sky-300" />
            </Link>
            <Link
              to="/app/progress"
              className="group flex min-h-12 items-center justify-between rounded-lg border border-line bg-abyss/40 px-3.5 py-2.5 transition hover:border-sky-400/50"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                <LineChart size={16} className="text-sky-300" /> Progress Log
              </span>
              <ChevronRight size={16} className="text-mute transition group-hover:translate-x-0.5 group-hover:text-sky-300" />
            </Link>
          </div>
        </SystemPanel>
      </Rise>

      {/* ---------- SYSTEM ---------- */}
      <Rise delay={0.24}>
        <SystemPanel title="System" icon={<Info size={14} />} animate={false}>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-mute">Version</span>
              <span className="font-display text-xs font-bold tracking-[0.2em] text-glow-soft">ASCEND 0.1.0</span>
            </li>
            <li className="text-mute">
              <span className="font-semibold text-ink">Privacy — </span>
              your data stays in your account; export or deletion available on request.
            </li>
            <li className="text-xs text-mute/90">
              ASCEND provides general fitness information, not medical or dietary advice. Consult a healthcare
              professional before starting a new training or nutrition program.
            </li>
          </ul>
          {profile.role === 'admin' && (
            <Link
              to="/app/admin"
              className="mt-4 flex min-h-12 items-center justify-between rounded-lg border border-amber-400/40 bg-amber-500/10 px-3.5 py-2.5 transition hover:border-amber-300/70 hover:bg-amber-500/15"
            >
              <span className="text-glow-gold flex items-center gap-2.5 font-display text-xs font-bold tracking-[0.2em] text-gold uppercase">
                <ShieldCheck size={16} /> System Administration
              </span>
              <ChevronRight size={16} className="text-gold" />
            </Link>
          )}
        </SystemPanel>
      </Rise>
    </div>
  )
}
