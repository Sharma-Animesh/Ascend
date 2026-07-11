import { motion, type Variants } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Circle,
  Salad,
  Swords,
} from 'lucide-react'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { LogoWordmark } from '../components/system/Logo'
import { Emblem } from '../components/system/Emblem'
import { ARCHETYPES, RANKS, STAT_KEYS, STAT_META } from '../lib/game'

const EASE = [0.22, 1, 0.36, 1] as const

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

/** Deterministic pseudo-random particle field for the hero backdrop. */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  left: ((i * 37 + 13) % 97) + 1,
  top: ((i * 53 + 29) % 93) + 3,
  size: 1.5 + (i % 3),
  duration: 5.5 + (i % 5) * 1.4,
  delay: (i % 8) * 0.5,
  drift: i % 2 === 0 ? -20 : -34,
}))

const SAMPLE_OBJECTIVES = [
  { label: 'Push-ups — 3 × 12', done: true },
  { label: 'Shadow squats — 3 × 15', done: true },
  { label: 'Box breathing — 5 min', done: false },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="grid-bg relative min-h-dvh overflow-hidden bg-void">
      {/* ---------- Top bar ---------- */}
      <header className="pt-safe absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <LogoWordmark size={18} />
          <Link
            to="/login"
            className="flex min-h-11 items-center px-3 font-display text-[0.66rem] font-bold tracking-[0.25em] text-mute uppercase transition hover:text-sky-300"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-24">
        {/* radial cyan glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 85% 60% at 50% 8%, rgba(56,189,248,0.16), transparent 62%), radial-gradient(ellipse 60% 45% at 50% 108%, rgba(139,92,246,0.12), transparent 60%)',
          }}
        />
        {/* floating particles */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-sky-300"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                boxShadow: '0 0 6px rgba(56,189,248,0.9)',
              }}
              animate={{ y: [0, p.drift, 0], opacity: [0.1, 0.55, 0.1] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        {/* floating background emblems */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
          <span className="animate-float absolute top-28 -left-4 opacity-[0.14] lg:left-16">
            <Emblem id="titan" size={120} />
          </span>
          <span className="animate-float absolute -right-6 bottom-36 opacity-[0.12] lg:right-20" style={{ animationDelay: '1.4s' }}>
            <Emblem id="ascetic" size={100} />
          </span>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div variants={rise} className="flex justify-center">
            <LogoWordmark size={34} className="animate-float" />
          </motion.div>
          <motion.p variants={rise} className="mt-9 font-display text-[0.6rem] font-bold tracking-[0.5em] text-sky-300/80 uppercase">
            — System Online —
          </motion.p>
          <motion.h1
            variants={rise}
            className="text-glow mt-4 font-display text-[1.65rem] leading-tight font-black tracking-[0.08em] text-ink uppercase sm:text-5xl lg:text-[3.3rem]"
          >
            Your body is <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-sky-300 via-white to-violet-300 bg-clip-text text-transparent">
              the character.
            </span>
          </motion.h1>
          <motion.p variants={rise} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-mute sm:text-lg">
            Real training. RPG progression. Awaken, take quests, gain stats, rank up from{' '}
            <span className="text-glow-soft">E</span> to <span className="text-gold">Sovereign</span>.
          </motion.p>
          <motion.div variants={rise} className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <GlowButton size="lg" icon={<ArrowRight size={16} />} onClick={() => navigate('/register')}>
              Begin Awakening
            </GlowButton>
            <GlowButton size="lg" variant="ghost" onClick={() => navigate('/login')}>
              I have an account
            </GlowButton>
          </motion.div>
        </motion.div>

        <motion.div
          aria-hidden
          className="absolute bottom-6 text-mute/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <ChevronsDown size={20} className="animate-bounce" />
        </motion.div>
      </section>

      {/* ---------- Archetypes ---------- */}
      <section className="relative px-4 py-16 sm:py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.h2 variants={rise} className="text-glow font-display text-sm font-bold tracking-[0.35em] text-sky-300/90 uppercase sm:text-base">
            Five Paths. One Climb.
          </motion.h2>
          <motion.p variants={rise} className="mx-auto mt-3 max-w-xl text-mute">
            Choose the physique archetype you are climbing toward — the System calibrates every quest around it.
          </motion.p>
          <div className="mt-10 flex flex-wrap items-start justify-center gap-x-5 gap-y-8 sm:gap-x-10">
            {ARCHETYPES.map((a, i) => (
              <motion.div key={a.id} variants={rise} className="flex w-[5.5rem] flex-col items-center gap-2.5 sm:w-28">
                <span className="animate-float" style={{ animationDelay: `${i * 0.45}s` }}>
                  <Emblem id={a.id} size={64} />
                </span>
                <span className="font-display text-[0.66rem] font-bold tracking-[0.22em] uppercase" style={{ color: a.color }}>
                  {a.name}
                </span>
                <span className="text-center text-xs leading-snug text-mute">{a.build}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="relative px-4 py-12 sm:py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-5xl"
        >
          <motion.h2
            variants={rise}
            className="text-glow text-center font-display text-sm font-bold tracking-[0.35em] text-sky-300/90 uppercase sm:text-base"
          >
            The System Provides
          </motion.h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
            <motion.div variants={rise}>
              <SystemPanel animate={false} title="Daily Quests" icon={<Swords size={14} />} className="h-full">
                <p className="text-sm leading-relaxed text-mute">
                  Each dawn the System assigns training calibrated to your class, equipment and level. Clear the
                  objectives, claim the XP, keep the streak alive.
                </p>
                <ul className="mt-3 space-y-2">
                  {SAMPLE_OBJECTIVES.map((o) => (
                    <li key={o.label} className="flex items-center gap-2.5 text-sm">
                      {o.done ? (
                        <CheckCircle2 size={16} className="shrink-0 text-success" />
                      ) : (
                        <Circle size={16} className="shrink-0 text-mute/50" />
                      )}
                      <span className={o.done ? 'text-ink' : 'text-mute'}>{o.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-glow-gold mt-3 font-display text-[0.66rem] font-bold tracking-[0.25em] text-gold uppercase">
                  Reward: +120 XP
                </p>
              </SystemPanel>
            </motion.div>

            <motion.div variants={rise}>
              <SystemPanel animate={false} title="Living Stats" icon={<Activity size={14} />} className="h-full">
                <p className="text-sm leading-relaxed text-mute">
                  Seven attributes grow from what you actually do — lift for STR, sprint for VIT, breathe for BRE.
                  Level up, allocate points, shape your build.
                </p>
                <ul className="mt-3.5 flex flex-wrap gap-1.5">
                  {STAT_KEYS.map((k) => (
                    <li
                      key={k}
                      className="flex items-center gap-1.5 rounded border px-2 py-1 text-[0.68rem]"
                      style={{ borderColor: `${STAT_META[k].color}44`, background: `${STAT_META[k].color}0d` }}
                    >
                      <span className="font-display font-bold" style={{ color: STAT_META[k].color }}>
                        {k}
                      </span>
                      <span className="text-mute">{STAT_META[k].label}</span>
                    </li>
                  ))}
                </ul>
              </SystemPanel>
            </motion.div>

            <motion.div variants={rise}>
              <SystemPanel animate={false} title="Rank Trials" icon={<ChevronsUp size={14} />} className="h-full">
                <p className="text-sm leading-relaxed text-mute">
                  Prove your progression in trial gates from E-Rank all the way to Sovereign. Each rank opens harder
                  quests and greater rewards.
                </p>
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  {RANKS.map((r, i) => (
                    <span key={r.id} className="flex items-center gap-1.5">
                      <span
                        className="rounded border px-2 py-1 font-display text-[0.62rem] font-bold tracking-[0.15em]"
                        style={{ color: r.color, borderColor: `${r.color}55`, background: `${r.color}0f` }}
                      >
                        {r.id}
                      </span>
                      {i < RANKS.length - 1 && <ChevronRight size={11} className="text-mute/40" />}
                    </span>
                  ))}
                </div>
              </SystemPanel>
            </motion.div>

            <motion.div variants={rise}>
              <SystemPanel animate={false} title="Nutrition Intel" icon={<Salad size={14} />} className="h-full">
                <p className="text-sm leading-relaxed text-mute">
                  Calorie and macro targets computed from your body, activity and chosen path — with fast meal logging
                  to keep fuel on track.
                </p>
                <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Protein', value: '160 g' },
                    { label: 'Carbs', value: '220 g' },
                    { label: 'Fat', value: '70 g' },
                  ].map((m) => (
                    <div key={m.label} className="rounded border border-line bg-abyss/60 px-2 py-2">
                      <p className="font-display text-sm font-bold text-glow-soft">{m.value}</p>
                      <p className="mt-0.5 text-[0.62rem] tracking-[0.2em] text-mute uppercase">{m.label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-mute/80">General information — not medical or dietary advice.</p>
              </SystemPanel>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="relative px-4 py-16 sm:py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h2
            variants={rise}
            className="text-glow font-display text-xl leading-snug font-black tracking-[0.12em] text-ink uppercase sm:text-3xl"
          >
            The System has noticed you, <span className="text-sky-300">Hunter</span>.
          </motion.h2>
          <motion.p variants={rise} className="mt-4 text-mute">
            Your record begins at E-Rank. Where it ends is up to you.
          </motion.p>
          <motion.div variants={rise} className="mt-8 flex justify-center">
            <GlowButton size="lg" icon={<ArrowRight size={16} />} onClick={() => navigate('/register')}>
              Begin Awakening
            </GlowButton>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="pb-safe relative z-10 border-t border-line/60">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">
          <div className="flex justify-center opacity-70">
            <LogoWordmark size={15} />
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-mute">
            ASCEND provides general fitness information, not medical advice. Consult a physician before starting.
            Ages 18+.
          </p>
          <p className="mt-2 text-[0.68rem] text-mute/70">
            All characters, emblems and artwork in ASCEND are original creations. © {new Date().getFullYear()} ASCEND.
          </p>
        </div>
      </footer>
    </div>
  )
}
