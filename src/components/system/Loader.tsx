import { LogoMark } from './Logo'

/** Full-screen loading state in System style. */
export function Loader({ label = 'SYNCHRONIZING' }: { label?: string }) {
  return (
    <div className="grid-bg flex min-h-dvh flex-col items-center justify-center gap-5 bg-void">
      <div className="relative">
        <div
          className="absolute -inset-3 animate-spin rounded-full border border-transparent border-t-sky-400/70 border-r-sky-400/20"
          style={{ animationDuration: '1.1s' }}
        />
        <LogoMark size={52} className="animate-pulse-glow" />
      </div>
      <p className="font-display text-[0.62rem] font-bold tracking-[0.45em] text-mute uppercase">{label}…</p>
    </div>
  )
}

/** Inline spinner for panel-level loading. */
export function InlineLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-mute">
      <span
        className="h-4 w-4 animate-spin rounded-full border border-transparent border-t-sky-400 border-r-sky-400/30"
        style={{ animationDuration: '0.9s' }}
      />
      {label && <span className="text-xs font-semibold tracking-[0.25em] uppercase">{label}</span>}
    </div>
  )
}
