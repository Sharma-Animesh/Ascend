import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'ghost' | 'danger' | 'gold'
type Size = 'sm' | 'md' | 'lg'

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  full?: boolean
  icon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-sky-500/90 to-blue-600/90 text-white border border-sky-300/40 shadow-[0_0_18px_rgba(56,189,248,0.35)] hover:shadow-[0_0_26px_rgba(56,189,248,0.55)] hover:from-sky-400/90 hover:to-blue-500/90',
  ghost:
    'bg-abyss/60 text-glow-soft border border-line hover:border-sky-400/50 hover:text-sky-200 hover:shadow-[0_0_14px_rgba(56,189,248,0.2)]',
  danger:
    'bg-red-950/50 text-red-300 border border-red-500/40 hover:bg-red-900/50 hover:shadow-[0_0_16px_rgba(248,113,113,0.3)]',
  gold: 'bg-gradient-to-r from-amber-500/90 to-yellow-600/90 text-abyss border border-amber-300/50 shadow-[0_0_18px_rgba(251,191,36,0.35)] hover:shadow-[0_0_26px_rgba(251,191,36,0.55)]',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[0.7rem]',
  md: 'px-5 py-2.5 text-[0.78rem]',
  lg: 'px-7 py-3.5 text-[0.88rem]',
}

export function GlowButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  full = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: GlowButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-display font-bold tracking-[0.2em] uppercase transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}
