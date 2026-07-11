import { useState, type FormEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, MailCheck, Send } from 'lucide-react'
import { SystemPanel } from '../../components/system/SystemPanel'
import { GlowButton } from '../../components/system/GlowButton'
import { LogoMark } from '../../components/system/Logo'
import { supabase } from '../../lib/supabase'

const EASE = [0.22, 1, 0.36, 1] as const

function AuthFrame({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="grid-bg relative min-h-dvh overflow-hidden bg-void">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(56,189,248,0.15), transparent 62%), radial-gradient(ellipse 70% 50% at 50% 115%, rgba(139,92,246,0.1), transparent 62%)',
        }}
      />
      <div className="pt-safe pb-safe relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="w-full max-w-md"
        >
          <Link to="/" aria-label="Return to the landing page" className="mb-7 flex justify-center">
            <LogoMark size={54} className="animate-pulse-glow" />
          </Link>
          <SystemPanel animate={false} padding={false} className="p-6 sm:p-8">
            <header className="mb-6 text-center">
              <p className="font-display text-[0.58rem] font-bold tracking-[0.45em] text-sky-300/80 uppercase">
                {eyebrow}
              </p>
              <h1 className="text-glow mt-2 font-display text-lg font-bold tracking-[0.24em] text-ink uppercase">
                {title}
              </h1>
              <div className="shimmer-line mt-4" />
            </header>
            {children}
          </SystemPanel>
        </motion.div>
      </div>
    </div>
  )
}

export default function Reset() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/login',
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthFrame eyebrow="Recovery Protocol" title="Transmission Sent">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="text-center"
        >
          <span className="glow-border mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-abyss/70">
            <MailCheck size={28} className="animate-pulse-glow text-sky-300" />
          </span>
          <p className="mt-5 text-sm leading-relaxed text-mute">
            If a Hunter record exists for <span className="font-semibold text-ink">{email.trim()}</span>, a recovery
            link is on its way. Follow it to forge a new access key.
          </p>
          <p className="mt-3 text-xs text-mute/70">
            No signal received? Check your spam folder — transmissions sometimes drift.
          </p>
          <GlowButton size="lg" full className="mt-6" onClick={() => navigate('/login')}>
            Return to Login
          </GlowButton>
          <button
            type="button"
            onClick={() => {
              setSent(false)
              setEmail('')
            }}
            className="mt-4 min-h-11 w-full text-sm text-sky-300/80 underline-offset-4 transition hover:text-sky-200 hover:underline"
          >
            Use a different email
          </button>
        </motion.div>
      </AuthFrame>
    )
  }

  return (
    <AuthFrame eyebrow="Recovery Protocol" title="Access Recovery">
      <div className="mb-5 flex items-start gap-3 rounded-md border border-line bg-abyss/50 px-3.5 py-3">
        <KeyRound size={18} className="mt-0.5 shrink-0 text-sky-300" />
        <p className="text-sm leading-snug text-mute">
          Lost your access key, Hunter? Enter the email bound to your record and the System will dispatch a recovery
          link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-md border border-danger/40 bg-red-950/30 px-3.5 py-3">
            <p className="font-display text-[0.58rem] font-bold tracking-[0.3em] text-danger uppercase">
              System Alert
            </p>
            <p className="mt-1 text-sm leading-snug text-red-100/85">
              The recovery transmission could not be sent. Please try again in a moment.
            </p>
            <p className="mt-1.5 text-xs text-red-300/60">Signal: {error}</p>
          </div>
        )}

        <label className="block">
          <span className="sys-label">Email</span>
          <input
            type="email"
            className="sys-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hunter@example.com"
            autoComplete="email"
            required
          />
        </label>

        <GlowButton type="submit" size="lg" full loading={loading} icon={<Send size={16} />} className="mt-1">
          Send Recovery Link
        </GlowButton>
      </form>

      <p className="mt-6 text-center text-sm text-mute">
        Key remembered?{' '}
        <Link to="/login" className="text-sky-300 underline-offset-4 transition hover:text-sky-200 hover:underline">
          Return to Login
        </Link>
      </p>
    </AuthFrame>
  )
}
