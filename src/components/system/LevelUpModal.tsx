import { AnimatePresence, motion } from 'framer-motion'
import { ChevronsUp, Crown } from 'lucide-react'
import { useUi } from '../../store/ui'
import { GlowButton } from './GlowButton'

/** Full-screen celebration overlay for level-ups / rank-ups. Mount once in the app layout. */
export function LevelUpModal() {
  const { celebration, dismissCelebration } = useUi()
  const isRank = celebration?.kind === 'rankup'

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-void/85 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissCelebration}
        >
          {/* rising particles */}
          {Array.from({ length: 22 }).map((_, i) => {
            const left = (i * 37) % 100
            const delay = (i % 7) * 0.18
            const drift = ((i * 13) % 40) - 20
            return (
              <motion.span
                key={i}
                className="pointer-events-none absolute bottom-0 h-1.5 w-1.5 rounded-full"
                style={{
                  left: `${left}%`,
                  background: isRank ? '#fbbf24' : '#38bdf8',
                  boxShadow: `0 0 8px ${isRank ? '#fbbf24' : '#38bdf8'}`,
                }}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: -640, x: drift, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.6 + (i % 5) * 0.35, delay, repeat: Infinity, ease: 'linear' }}
              />
            )
          })}

          <motion.div
            className="glass clip-system glow-border relative w-full max-w-sm p-8 text-center"
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -6, 6, 0] }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{
                borderColor: isRank ? '#fbbf24' : '#38bdf8',
                boxShadow: `0 0 30px ${isRank ? 'rgba(251,191,36,0.5)' : 'rgba(56,189,248,0.5)'}`,
              }}
            >
              {isRank ? <Crown size={30} color="#fbbf24" /> : <ChevronsUp size={32} color="#38bdf8" />}
            </motion.div>

            <p className="font-display text-[0.66rem] font-bold tracking-[0.4em] text-mute uppercase">
              {isRank ? 'Rank Ascension' : 'The System acknowledges you'}
            </p>
            <h1
              className={`mt-2 font-display text-4xl font-black tracking-widest ${isRank ? 'text-gold text-glow-gold' : 'text-glow-soft text-glow'}`}
            >
              {isRank ? celebration.rankLabel : `LEVEL ${celebration.level}`}
            </h1>
            {celebration.xpGained ? (
              <p className="mt-3 text-sm font-semibold text-mute">
                +{celebration.xpGained} XP earned{isRank ? ` — you are now ${celebration.rankLabel}` : ''}
              </p>
            ) : null}

            <GlowButton variant={isRank ? 'gold' : 'primary'} full className="mt-6" onClick={dismissCelebration}>
              Continue
            </GlowButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
