import { useId } from 'react'

/**
 * The ASCEND mark: an ascending peak inside a broken system-ring.
 * Original vector art — safe to ship anywhere.
 */
export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="16" y1="52" x2="52" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* broken ring */}
      <circle
        cx="32"
        cy="32"
        r="27"
        stroke={`url(#${id}-g)`}
        strokeOpacity="0.5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="112 22 20 22"
        transform="rotate(-56 32 32)"
      />
      {/* ascending peak */}
      <path d="M32 12 L47 39 H39.5 L32 25.5 L24.5 39 H17 Z" fill={`url(#${id}-g)`} />
      {/* echo chevron */}
      <path
        d="M22 47 L32 35.5 L42 47"
        stroke={`url(#${id}-g)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LogoWordmark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size + 8} />
      <span
        className="font-display font-bold tracking-[0.3em] text-ink"
        style={{ fontSize: size * 0.62 }}
      >
        ASCEND
      </span>
    </span>
  )
}
