import { motion } from 'framer-motion'
import { levelFromXp } from '../../lib/game'

interface XPBarProps {
  xp: number
  compact?: boolean
  className?: string
}

/** Animated XP progress bar for the current level. */
export function XPBar({ xp, compact = false, className = '' }: XPBarProps) {
  const { level, into, needed, pct } = levelFromXp(xp)
  return (
    <div className={className}>
      {!compact && (
        <div className="mb-1 flex items-baseline justify-between text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
          <span className="text-glow-soft">LV. {level}</span>
          <span className="text-mute">
            {into} / {needed} XP
          </span>
        </div>
      )}
      <div className={`relative overflow-hidden rounded-full bg-abyss ${compact ? 'h-1.5' : 'h-2.5'} border border-line/70`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400"
          style={{ boxShadow: '0 0 10px rgba(56,189,248,0.7)' }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, pct * 100)}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}
