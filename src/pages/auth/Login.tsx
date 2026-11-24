import { useState, type FormEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
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

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const notConfirmed = !!error && error.toLowerCase().includes('email not confirmed')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    navigate('/app')
  }

  return (
    <AuthFrame eyebrow="Identify yourself, Ascendant" title="System Access">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-md border border-danger/40 bg-red-950/30 px-3.5 py-3">
            <p className="font-display text-[0.58rem] font-bold tracking-[0.3em] text-danger uppercase">
              System Alert — Access Denied
            </p>
            <p className="mt-1 text-sm leading-snug text-red-100/85">
              {notConfirmed
                ? 'Your registration has not been confirmed yet. Check your inbox (and spam folder) for the confirmation link, then return here to enter.'
                : 'The Gate did not recognize these credentials. Verify your email and access key, then try again.'}
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
              placeholder="••••••••"
              autoComplete="current-password"
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

        <GlowButton type="submit" size="lg" full loading={loading} icon={<LogIn size={16} />} className="mt-2">
          Enter the System
        </GlowButton>
      </form>

      <div className="mt-6 space-y-2.5 text-center text-sm text-mute">
        <p>
          No record yet?{' '}
          <Link to="/register" className="text-sky-300 underline-offset-4 transition hover:text-sky-200 hover:underline">
            Begin your Ascension
          </Link>
        </p>
        <p>
          <Link to="/reset" className="text-sky-300/80 underline-offset-4 transition hover:text-sky-200 hover:underline">
            Forgot your access key?
          </Link>
        </p>
      </div>
    </AuthFrame>
  )
}
