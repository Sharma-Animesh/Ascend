import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SystemPanelProps {
  title?: string
  icon?: ReactNode
  /** Extra element rendered on the right of the header row */
  action?: ReactNode
  children: ReactNode
  className?: string
  /** Fade-up entrance animation (on by default) */
  animate?: boolean
  padding?: boolean
}

/** A glassmorphic "System window" — the core surface of the ASCEND UI. */
export function SystemPanel({
  title,
  icon,
  action,
  children,
  className = '',
  animate = true,
  padding = true,
}: SystemPanelProps) {
  const Wrapper = animate ? motion.section : 'section'
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
      }
    : {}
  return (
    <Wrapper
      {...(motionProps as object)}
      className={`glass clip-system scanlines relative overflow-hidden rounded-lg ${padding ? 'p-4 sm:p-5' : ''} ${className}`}
    >
      {title && (
        <header className={`relative z-[2] mb-3 ${padding ? '' : 'p-4 pb-0 sm:p-5 sm:pb-0'}`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-[0.72rem] font-bold tracking-[0.28em] text-glow-soft uppercase text-glow">
              {icon}
              {title}
            </h2>
            {action}
          </div>
          <div className="shimmer-line mt-2.5" />
        </header>
      )}
      <div className="relative z-[2]">{children}</div>
    </Wrapper>
  )
}
