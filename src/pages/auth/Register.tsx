import { useState, type FormEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Circle, Eye, EyeOff, MailCheck, UserPlus } from 'lucide-react'
import { SystemPanel } from '../../components/system/SystemPanel'
import { GlowButton } from '../../components/system/GlowButton'
import { LogoMark } from '../../components/system/Logo'
import { supabase } from '../../lib/supabase'
import { isNative } from '../../lib/native'

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

function Requirement({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-xs transition-colors ${ok ? 'text-success' : 'text-mute'}`}>
      {ok ? <Check size={13} className="shrink-0" /> : <Circle size={9} className="mx-0.5 shrink-0" />}
      {label}
    </li>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [already, setAlready] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<string | null>(null)

  function validate(): string | null {
    if (displayName.trim().length < 2) return 'Choose an Ascendant name of at least 2 characters.'
    if (password.length < 8) return 'Your access key must be at least 8 characters long.'
    if (password !== confirm) return 'The two access keys do not match.'
    if (!agreed) return 'Please confirm the acknowledgement below to proceed.'
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setDetail(null)
    setAlready(false)

    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }

    setLoading(true)
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
        // Native app: deep link back into ASCEND. Browser: hosted callback page.
        emailRedirectTo: isNative ? 'ascend://auth/callback' : `${window.location.origin}/auth/callback`,
      },
    })

    if (err) {
      if (/already registered|already exists|already been registered/i.test(err.message)) {
        setAlready(true)
      } else {
        setError('The Ascension could not be completed. Adjust and try again.')
        setDetail(err.message)
      }
      setLoading(false)
      return
    }

    if (data.session) {
      navigate('/awakening')
      return
    }

    // Supabase returns a user with zero identities when the email is already registered & confirmed.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setAlready(true)
      setLoading(false)
      return
    }

    if (data.user) {
      setSent(true)
      setLoading(false)
      return
    }

    setError('The System returned an unexpected response. Please try again.')
    setLoading(false)
  }

  if (sent) {
    return (
      <AuthFrame eyebrow="Ascension Protocol" title="Transmission Sent">
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
            A confirmation signal has been dispatched to{' '}
            <span className="font-semibold text-ink">{email.trim()}</span>. Open the link inside to verify your
            record, then return and log in to complete your Ascension.
          </p>
          <p className="mt-3 text-xs text-mute/70">
            No signal received? Check your spam folder — transmissions sometimes drift.
          </p>
          <GlowButton size="lg" full className="mt-6" onClick={() => navigate('/login')}>
            Proceed to Login
          </GlowButton>
        </motion.div>
      </AuthFrame>
    )
  }

  return (
    <AuthFrame eyebrow="New Ascendant Registration" title="Ascension Protocol">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {already && (
          <div role="alert" className="rounded-md border border-sky-400/40 bg-sky-950/30 px-3.5 py-3">
            <p className="font-display text-[0.58rem] font-bold tracking-[0.3em] text-sky-300 uppercase">
              System Notice — Record Exists
            </p>
            <p className="mt-1 text-sm leading-snug text-sky-100/85">
              This email is already bound to an Ascendant.{' '}
              <Link to="/login" className="text-sky-300 underline underline-offset-4 hover:text-sky-200">
                Log in
              </Link>{' '}
              instead — or{' '}
              <Link to="/reset" className="text-sky-300 underline underline-offset-4 hover:text-sky-200">
                recover your access key
              </Link>{' '}
              if it has been lost.
            </p>
          </div>
        )}

        {error && !already && (
          <div role="alert" className="rounded-md border border-danger/40 bg-red-950/30 px-3.5 py-3">
            <p className="font-display text-[0.58rem] font-bold tracking-[0.3em] text-danger uppercase">
              System Alert
            </p>
            <p className="mt-1 text-sm leading-snug text-red-100/85">{error}</p>
            {detail && <p className="mt-1.5 text-xs text-red-300/60">Signal: {detail}</p>}
          </div>
        )}

        <label className="block">
          <span className="sys-label">Ascendant Name</span>
          <input
            type="text"
            className="sys-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How the System will address you"
            autoComplete="nickname"
            maxLength={40}
            required
          />
        </label>

        <label className="block">
          <span className="sys-label">Email</span>
          <input
            type="email"
            className="sys-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ascendant@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="sys-label">Access Key — Password</span>
          <span className="relative block">
            <input
              type={showPw ? 'text' : 'password'}
              className="sys-input pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-mute transition hover:text-sky-300"
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>

        <label className="block">
          <span className="sys-label">Confirm Access Key</span>
          <input
            type={showPw ? 'text' : 'password'}
            className="sys-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your access key"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <ul className="space-y-1" aria-live="polite">
          <Requirement ok={password.length >= 8} label="At least 8 characters" />
          <Requirement ok={confirm.length > 0 && confirm === password} label="Both keys match" />
        </ul>

        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-line bg-abyss/50 px-3.5 py-3 text-sm leading-snug text-mute transition hover:border-sky-400/40">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-sky-400"
            required
          />
          <span>
            I am <span className="text-ink">16 or older</span> and accept that ASCEND provides general fitness
            information, <span className="text-ink">not medical advice</span>.
          </span>
        </label>

        <GlowButton type="submit" size="lg" full loading={loading} icon={<UserPlus size={16} />} className="mt-1">
          Begin Ascension
        </GlowButton>
      </form>

      <p className="mt-6 text-center text-sm text-mute">
        Already ascended?{' '}
        <Link to="/login" className="text-sky-300 underline-offset-4 transition hover:text-sky-200 hover:underline">
          Log in
        </Link>
      </p>
    </AuthFrame>
  )
}
