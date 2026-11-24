import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Dumbbell, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Difficulty, Exercise, ExerciseCategory, StatKey } from '../../lib/types'
import { STAT_KEYS, STAT_META } from '../../lib/game'
import { SystemPanel } from '../../components/system/SystemPanel'
import { GlowButton } from '../../components/system/GlowButton'
import { InlineLoader } from '../../components/system/Loader'
import { EmptyState } from '../../components/system/EmptyState'
import { ExerciseVisual } from '../../components/ExerciseVisual'

const CATEGORIES: ExerciseCategory[] = ['home', 'gym', 'calisthenics', 'yoga', 'breath', 'martial']
const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced']

/** Built-in hologram scene keys offered as autocomplete for `anim:` values. */
const ANIM_KEYS = [
  'pushup', 'squat', 'pistol', 'deadlift', 'lunge', 'bridge', 'bench', 'press', 'pull', 'pulldown',
  'row', 'pullapart', 'curl', 'generic', 'dip', 'plank', 'sideplank', 'hollow', 'crunch', 'run',
  'jacks', 'rope', 'burpee', 'punch', 'kick', 'knee', 'slip', 'footwork', 'guard', 'stretch',
  'breathe', 'catcow', 'child', 'downdog', 'pigeon', 'thread', 'warrior', 'foldstand',
]
const easeOut = [0.22, 1, 0.36, 1] as const

interface FormState {
  name: string
  category: ExerciseCategory
  difficulty: Difficulty
  stat_focus: StatKey
  muscles: string
  equipment: string
  description: string
  cues: string
  mistakes: string
  default_sets: string
  default_reps: string
  duration_sec: string
  base_xp: string
  animation_url: string
  image_url: string
  published: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  category: 'home',
  difficulty: 'beginner',
  stat_focus: 'STR',
  muscles: '',
  equipment: '',
  description: '',
  cues: '',
  mistakes: '',
  default_sets: '',
  default_reps: '',
  duration_sec: '',
  base_xp: '20',
  animation_url: '',
  image_url: '',
  published: true,
}

function formFrom(ex: Exercise): FormState {
  return {
    name: ex.name,
    category: ex.category,
    difficulty: ex.difficulty,
    stat_focus: ex.stat_focus,
    muscles: ex.muscles.join(', '),
    equipment: ex.equipment.join(', '),
    description: ex.description ?? '',
    cues: ex.cues.join('\n'),
    mistakes: ex.mistakes.join('\n'),
    default_sets: ex.default_sets === null ? '' : String(ex.default_sets),
    default_reps: ex.default_reps ?? '',
    duration_sec: ex.duration_sec === null ? '' : String(ex.duration_sec),
    base_xp: String(ex.base_xp),
    animation_url: ex.animation_url ?? '',
    image_url: ex.image_url ?? '',
    published: ex.published,
  }
}

const commaList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

const lineList = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="flex h-11 w-11 shrink-0 items-center justify-center"
    >
      <span
        className={`relative h-[22px] w-[42px] rounded-full border transition-all duration-200 ${
          on ? 'border-sky-400/60 bg-sky-500/25 shadow-[0_0_10px_rgba(56,189,248,0.4)]' : 'border-line bg-abyss'
        }`}
      >
        <span
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all duration-200 ${
            on ? 'left-[22px] bg-sky-300 shadow-[0_0_6px_rgba(56,189,248,0.9)]' : 'left-1 bg-mute'
          }`}
        />
      </span>
    </button>
  )
}

function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="sys-label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[0.68rem] leading-snug text-mute/80">{hint}</p>}
    </div>
  )
}

export default function AdminExercises() {
  const [exercises, setExercises] = useState<Exercise[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | ExerciseCategory>('all')

  // slide-over form state
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    const { data, error: err } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError('The System could not load the exercise library.')
      return
    }
    setError(null)
    setExercises((data as Exercise[] | null) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    if (!exercises) return null
    const q = search.trim().toLowerCase()
    return exercises.filter(
      (e) => (category === 'all' || e.category === category) && (!q || e.name.toLowerCase().includes(q)),
    )
  }, [exercises, search, category])

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setConfirmDelete(false)
    setFormOpen(true)
  }

  const openEdit = (ex: Exercise) => {
    setEditing(ex)
    setForm(formFrom(ex))
    setFormError(null)
    setConfirmDelete(false)
    setFormOpen(true)
  }

  /** Duplicate: pre-fill a NEW exercise with an existing row's data. */
  const openDuplicate = (ex: Exercise) => {
    setEditing(null)
    setForm({ ...formFrom(ex), name: `${ex.name} (Copy)` })
    setFormError(null)
    setConfirmDelete(false)
    setFormOpen(true)
  }

  const togglePublished = async (ex: Exercise) => {
    const next = !ex.published
    setExercises((prev) => (prev ? prev.map((e) => (e.id === ex.id ? { ...e, published: next } : e)) : prev))
    const { error: err } = await supabase.from('exercises').update({ published: next }).eq('id', ex.id)
    if (err) {
      setExercises((prev) =>
        prev ? prev.map((e) => (e.id === ex.id ? { ...e, published: ex.published } : e)) : prev,
      )
      setError('Publish state could not be updated. Try again.')
    }
  }

  const save = async () => {
    if (!form.name.trim()) {
      setFormError('An exercise needs a name.')
      return
    }
    setSaving(true)
    setFormError(null)
    const payload = {
      name: form.name.trim(),
      category: form.category,
      difficulty: form.difficulty,
      stat_focus: form.stat_focus,
      muscles: commaList(form.muscles),
      equipment: commaList(form.equipment),
      description: form.description.trim() || null,
      cues: lineList(form.cues),
      mistakes: lineList(form.mistakes),
      default_sets: form.default_sets.trim() ? Number(form.default_sets) : null,
      default_reps: form.default_reps.trim() || null,
      duration_sec: form.duration_sec.trim() ? Number(form.duration_sec) : null,
      base_xp: form.base_xp.trim() ? Number(form.base_xp) : 20,
      animation_url: form.animation_url.trim() || null,
      image_url: form.image_url.trim() || null,
      published: form.published,
    }
    const { error: err } = editing
      ? await supabase.from('exercises').update(payload).eq('id', editing.id)
      : await supabase.from('exercises').insert(payload)
    setSaving(false)
    if (err) {
      setFormError('The System rejected the save. Check the fields and try again.')
      return
    }
    setFormOpen(false)
    await load()
  }

  const remove = async () => {
    if (!editing) return
    setDeleting(true)
    const { error: err } = await supabase.from('exercises').delete().eq('id', editing.id)
    setDeleting(false)
    if (err) {
      setFormError('Deletion failed. Try again shortly.')
      setConfirmDelete(false)
      return
    }
    setFormOpen(false)
    await load()
  }

  const previewExercise = {
    name: form.name || 'New Exercise',
    category: form.category,
    animation_url: form.animation_url.trim() || null,
    image_url: form.image_url.trim() || null,
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-base font-bold tracking-[0.28em] text-gold uppercase text-glow-gold sm:text-lg">
            <Dumbbell size={20} className="shrink-0" />
            Exercise Library
          </h1>
          <p className="mt-1 text-sm text-mute">
            Every technique the System can assign — including unpublished drafts.
          </p>
        </div>
        <GlowButton variant="gold" icon={<Plus size={15} />} onClick={openNew}>
          New Exercise
        </GlowButton>
      </motion.header>

      {error && (
        <p className="rounded-md border border-danger/40 bg-red-950/30 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {/* Search + filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut, delay: 0.06 }}
        className="flex flex-col gap-2.5 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mute" />
          <input
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="sys-input pl-10"
            aria-label="Search exercises"
          />
        </div>
        <select
          value={category}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as 'all' | ExerciseCategory)}
          className="sys-input sm:w-48"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </motion.div>

      {/* List */}
      <SystemPanel
        title="Registered Techniques"
        icon={<Dumbbell size={14} className="text-gold" />}
        action={
          filtered && (
            <span className="font-display text-[0.6rem] tracking-[0.2em] text-mute uppercase">
              {filtered.length} shown
            </span>
          )
        }
      >
        {filtered === null && !error ? (
          <InlineLoader label="Loading library" />
        ) : !filtered || filtered.length === 0 ? (
          <EmptyState
            icon={<Dumbbell size={30} />}
            title="No exercises found"
            hint={
              search || category !== 'all'
                ? 'Adjust your search or filter.'
                : 'Forge the first technique for your Ascendants.'
            }
            action={
              <GlowButton variant="gold" size="sm" icon={<Plus size={14} />} onClick={openNew}>
                New Exercise
              </GlowButton>
            }
          />
        ) : (
          <ul className="space-y-2">
            {filtered.map((ex, i) => (
              <motion.li
                key={ex.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easeOut, delay: Math.min(i, 12) * 0.03 }}
                className="flex items-center gap-2 rounded-md border border-line/60 bg-abyss/50 p-2 pl-3 transition-colors hover:border-sky-400/40 sm:gap-3"
              >
                <button
                  type="button"
                  onClick={() => openEdit(ex)}
                  className="group flex min-h-[44px] min-w-0 flex-1 flex-col justify-center text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-ink group-hover:text-sky-200">{ex.name}</span>
                    <Pencil
                      size={12}
                      className="shrink-0 text-mute/50 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.62rem] font-semibold tracking-[0.12em] uppercase">
                    <span className="text-mute">{ex.category}</span>
                    <span className="text-mute/50">·</span>
                    <span className="text-mute">{ex.difficulty}</span>
                    <span className="text-mute/50">·</span>
                    <span style={{ color: STAT_META[ex.stat_focus].color }}>{ex.stat_focus}</span>
                    <span className="text-mute/50">·</span>
                    <span className="text-gold">{ex.base_xp} XP</span>
                    {!ex.published && (
                      <span className="rounded-full border border-line px-1.5 py-px text-[0.54rem] text-mute">
                        Draft
                      </span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => openDuplicate(ex)}
                  aria-label={`Duplicate ${ex.name}`}
                  title="Duplicate"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-mute transition hover:bg-sky-500/10 hover:text-sky-300"
                >
                  <Copy size={15} />
                </button>
                <Toggle
                  on={ex.published}
                  onToggle={() => void togglePublished(ex)}
                  label={`${ex.published ? 'Unpublish' : 'Publish'} ${ex.name}`}
                />
              </motion.li>
            ))}
          </ul>
        )}
      </SystemPanel>

      {/* Slide-over create/edit form */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex justify-end bg-void/70 backdrop-blur-sm"
            onClick={() => setFormOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={editing ? 'Edit exercise' : 'New exercise'}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: easeOut }}
              onClick={(e) => e.stopPropagation()}
              className="glass h-full w-full max-w-xl overflow-y-auto border-l border-gold/25"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line/60 bg-panel/90 px-4 py-3 backdrop-blur-xl sm:px-6">
                <h2 className="font-display text-[0.72rem] font-bold tracking-[0.26em] text-gold uppercase text-glow-gold">
                  {editing ? 'Edit Exercise' : 'Forge New Exercise'}
                </h2>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label="Close"
                  className="flex h-11 w-11 items-center justify-center rounded-md text-mute transition hover:bg-abyss hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 p-4 sm:p-6">
                {/* Live preview */}
                <div>
                  <p className="sys-label">Live Preview</p>
                  <ExerciseVisual exercise={previewExercise} className="mx-auto max-w-sm" />
                </div>

                <Field label="Name">
                  <input
                    value={form.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="e.g. Diamond Push-up"
                    className="sys-input"
                  />
                </Field>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) => set({ category: e.target.value as ExerciseCategory })}
                      className="sys-input"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Difficulty">
                    <select
                      value={form.difficulty}
                      onChange={(e) => set({ difficulty: e.target.value as Difficulty })}
                      className="sys-input"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Stat Focus">
                    <select
                      value={form.stat_focus}
                      onChange={(e) => set({ stat_focus: e.target.value as StatKey })}
                      className="sys-input"
                    >
                      {STAT_KEYS.map((k) => (
                        <option key={k} value={k}>
                          {k} — {STAT_META[k].label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Muscles" hint="Comma-separated, e.g. chest, triceps, core">
                  <input
                    value={form.muscles}
                    onChange={(e) => set({ muscles: e.target.value })}
                    placeholder="chest, triceps, core"
                    className="sys-input"
                  />
                </Field>

                <Field
                  label="Equipment"
                  hint="Comma-separated: none, bands, dumbbells, pull-up bar, barbell, machine"
                >
                  <input
                    value={form.equipment}
                    onChange={(e) => set({ equipment: e.target.value })}
                    placeholder="none, dumbbells"
                    className="sys-input"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    rows={3}
                    placeholder="What this technique trains and how to perform it."
                    className="sys-input resize-y"
                  />
                </Field>

                <Field label="Form Cues" hint="One cue per line">
                  <textarea
                    value={form.cues}
                    onChange={(e) => set({ cues: e.target.value })}
                    rows={3}
                    placeholder={'Brace your core\nKeep elbows at 45 degrees'}
                    className="sys-input resize-y"
                  />
                </Field>

                <Field label="Common Mistakes" hint="One mistake per line">
                  <textarea
                    value={form.mistakes}
                    onChange={(e) => set({ mistakes: e.target.value })}
                    rows={3}
                    placeholder={'Sagging hips\nFlared elbows'}
                    className="sys-input resize-y"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Default Sets">
                    <input
                      type="number"
                      min={0}
                      value={form.default_sets}
                      onChange={(e) => set({ default_sets: e.target.value })}
                      placeholder="3"
                      className="sys-input"
                    />
                  </Field>
                  <Field label="Default Reps" hint='Text, e.g. "8-12"'>
                    <input
                      value={form.default_reps}
                      onChange={(e) => set({ default_reps: e.target.value })}
                      placeholder="8-12"
                      className="sys-input"
                    />
                  </Field>
                  <Field label="Duration (sec)">
                    <input
                      type="number"
                      min={0}
                      value={form.duration_sec}
                      onChange={(e) => set({ duration_sec: e.target.value })}
                      placeholder="45"
                      className="sys-input"
                    />
                  </Field>
                  <Field label="Base XP">
                    <input
                      type="number"
                      min={0}
                      value={form.base_xp}
                      onChange={(e) => set({ base_xp: e.target.value })}
                      placeholder="20"
                      className="sys-input"
                    />
                  </Field>
                </div>

                <Field
                  label="Animation"
                  hint="Leave empty to auto-match the exercise name. Built-in keys: anim:pushup, squat, pistol, deadlift, lunge, bridge, bench, press, pull, pulldown, row, pullapart, curl, dip, plank, sideplank, hollow, crunch, run, jacks, rope, burpee, punch, kick, knee, slip, footwork, guard, stretch, breathe, catcow, child, downdog, pigeon, thread, warrior, foldstand — or an https:// video URL."
                >
                  <input
                    value={form.animation_url}
                    onChange={(e) => set({ animation_url: e.target.value })}
                    placeholder="anim:pushup (or leave empty to auto-match by name)"
                    className="sys-input"
                    list="anim-key-options"
                  />
                  <datalist id="anim-key-options">
                    {ANIM_KEYS.map((k) => (
                      <option key={k} value={`anim:${k}`} />
                    ))}
                  </datalist>
                </Field>

                <Field label="Image URL" hint="Optional https:// image, shown when no animation is set">
                  <input
                    value={form.image_url}
                    onChange={(e) => set({ image_url: e.target.value })}
                    placeholder="https://…"
                    className="sys-input"
                  />
                </Field>

                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border border-line/60 bg-abyss/50 px-3.5 py-2.5">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => set({ published: e.target.checked })}
                    className="h-4 w-4 accent-sky-400"
                  />
                  <span className="text-sm font-semibold text-ink">Published</span>
                  <span className="text-xs text-mute">— visible to all Ascendants</span>
                </label>

                {formError && (
                  <p className="rounded-md border border-danger/40 bg-red-950/30 px-3 py-2 text-sm text-danger">
                    {formError}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2.5 border-t border-line/60 pt-4 pb-2">
                  <GlowButton variant="gold" loading={saving} onClick={() => void save()}>
                    {editing ? 'Save Changes' : 'Create Exercise'}
                  </GlowButton>
                  <GlowButton variant="ghost" onClick={() => setFormOpen(false)}>
                    Cancel
                  </GlowButton>
                  {editing && (
                    <div className="ml-auto flex items-center gap-2">
                      {confirmDelete ? (
                        <>
                          <GlowButton
                            variant="danger"
                            size="sm"
                            loading={deleting}
                            icon={<Trash2 size={14} />}
                            onClick={() => void remove()}
                          >
                            Confirm Delete
                          </GlowButton>
                          <GlowButton variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                            Keep
                          </GlowButton>
                        </>
                      ) : (
                        <GlowButton
                          variant="danger"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          onClick={() => setConfirmDelete(true)}
                        >
                          Delete
                        </GlowButton>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
