import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      {icon && <div className="text-mute/70">{icon}</div>}
      <p className="font-display text-sm font-bold tracking-[0.2em] text-mute uppercase">{title}</p>
      {hint && <p className="max-w-xs text-sm text-mute/80">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
