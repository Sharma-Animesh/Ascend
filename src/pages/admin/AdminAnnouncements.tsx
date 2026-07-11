import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Radio, Send, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../store/auth'
import type { Announcement } from '../../lib/types'
import { SystemPanel } from '../../components/system/SystemPanel'
import { GlowButton } from '../../components/system/GlowButton'
import { InlineLoader } from '../../components/system/Loader'
import { EmptyState } from '../../components/system/EmptyState'

const easeOut = [0.22, 1, 0.36, 1] as const

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
          on ? 'border-gold/60 bg-gold/20 shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 'border-line bg-abyss'
        }`}
      >
        <span
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all duration-200 ${
            on ? 'left-[22px] bg-gold shadow-[0_0_6px_rgba(251,191,36,0.9)]' : 'left-1 bg-mute'
          }`}
        />
      </span>
    </button>
  )
}

export default function AdminAnnouncements() {
  const { session } = useAuth()

  const [items, setItems] = useState<Announcement[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // create form
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // delete confirm
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    const { data, error: err } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError('The System could not load broadcasts.')
      return
    }
    setError(null)
    setItems((data as Announcement[] | null) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  const broadcast = async () => {
    if (!title.trim()) {
      setFormError('A broadcast needs a title.')
      return
    }
    if (!session?.user.id) {
      setFormError('Session expired — sign in again.')
      return
    }
    setSending(true)
    setFormError(null)
    const { error: err } = await supabase.from('announcements').insert({
      title: title.trim(),
      body: body.trim() || null,
      active: true,
      created_by: session.user.id,
    })
    setSending(false)
    if (err) {
      setFormError('The System rejected this broadcast. Try again.')
      return
    }
    setTitle('')
    setBody('')
    await load()
  }

  const toggleActive = async (a: Announcement) => {
    const next = !a.active
    setItems((prev) => (prev ? prev.map((x) => (x.id === a.id ? { ...x, active: next } : x)) : prev))
    const { error: err } = await supabase.from('announcements').update({ active: next }).eq('id', a.id)
    if (err) {
      setItems((prev) => (prev ? prev.map((x) => (x.id === a.id ? { ...x, active: a.active } : x)) : prev))
      setError('Broadcast state could not be updated. Try again.')
    }
  }

  const remove = async (id: string) => {
    setDeletingId(id)
    const { error: err } = await supabase.from('announcements').delete().eq('id', id)
    setDeletingId(null)
    setConfirmId(null)
    if (err) {
      setError('Deletion failed. Try again shortly.')
      return
    }
    await load()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        <h1 className="flex items-center gap-2.5 font-display text-base font-bold tracking-[0.28em] text-gold uppercase text-glow-gold sm:text-lg">
          <Megaphone size={20} className="shrink-0" />
          System Broadcasts
        </h1>
        <p className="mt-1 text-sm text-mute">Active broadcasts appear on every Hunter's dashboard.</p>
      </motion.header>

      {error && (
        <p className="rounded-md border border-danger/40 bg-red-950/30 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {/* Create */}
      <SystemPanel title="New Broadcast" icon={<Radio size={14} className="text-gold" />}>
        <div className="space-y-3">
          <div>
            <label htmlFor="ann-title" className="sys-label">
              Title
            </label>
            <input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Double XP weekend — the Gate is open"
              className="sys-input"
            />
          </div>
          <div>
            <label htmlFor="ann-body" className="sys-label">
              Message
            </label>
            <textarea
              id="ann-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="The System's message to all Hunters…"
              className="sys-input resize-y"
            />
          </div>
          {formError && (
            <p className="rounded-md border border-danger/40 bg-red-950/30 px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <GlowButton variant="gold" loading={sending} icon={<Send size={14} />} onClick={() => void broadcast()}>
              Broadcast
            </GlowButton>
            <p className="text-[0.7rem] text-mute/80">New broadcasts go live immediately.</p>
          </div>
        </div>
      </SystemPanel>

      {/* List */}
      <SystemPanel
        title="All Broadcasts"
        icon={<Megaphone size={14} className="text-gold" />}
        action={
          items && (
            <span className="font-display text-[0.6rem] tracking-[0.2em] text-mute uppercase">
              {items.filter((a) => a.active).length} live
            </span>
          )
        }
      >
        {items === null && !error ? (
          <InlineLoader label="Loading broadcasts" />
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={30} />}
            title="No broadcasts yet"
            hint="Compose the first System-wide message above."
          />
        ) : (
          <ul className="space-y-2.5">
            {items.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easeOut, delay: Math.min(i, 10) * 0.04 }}
                className={`rounded-md border p-3 transition-colors ${
                  a.active ? 'border-gold/30 bg-gold/[0.04]' : 'border-line/60 bg-abyss/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-ink">{a.title}</span>
                      <span
                        className={`rounded-full border px-2 py-px font-display text-[0.52rem] font-bold tracking-[0.2em] uppercase ${
                          a.active
                            ? 'border-gold/50 bg-gold/10 text-gold'
                            : 'border-line text-mute'
                        }`}
                      >
                        {a.active ? 'Live' : 'Inactive'}
                      </span>
                    </p>
                    {a.body && <p className="mt-1 text-sm whitespace-pre-line text-mute">{a.body}</p>}
                    <p className="mt-1.5 text-[0.68rem] text-mute/70">
                      {new Date(a.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Toggle
                      on={a.active}
                      onToggle={() => void toggleActive(a)}
                      label={`${a.active ? 'Deactivate' : 'Activate'} broadcast "${a.title}"`}
                    />
                    {confirmId === a.id ? (
                      <div className="flex items-center gap-1.5 pl-1">
                        <GlowButton
                          variant="danger"
                          size="sm"
                          loading={deletingId === a.id}
                          onClick={() => void remove(a.id)}
                        >
                          Confirm
                        </GlowButton>
                        <GlowButton variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                          Keep
                        </GlowButton>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Delete broadcast "${a.title}"`}
                        onClick={() => setConfirmId(a.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-md text-mute transition hover:bg-red-950/40 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </SystemPanel>
    </div>
  )
}
