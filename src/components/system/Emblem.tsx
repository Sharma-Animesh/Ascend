import type { LucideIcon } from 'lucide-react'
import {
  Axe,
  Crosshair,
  Flower2,
  Ghost,
  Moon,
  Mountain,
  Shield,
  Sword,
  Wind,
  Zap,
} from 'lucide-react'

/** Original emblem sigils for classes & archetypes: icon in a glowing hex ring. */
const EMBLEMS: Record<string, { icon: LucideIcon; color: string }> = {
  // archetypes
  phantom: { icon: Ghost, color: '#4ade80' },
  blade: { icon: Sword, color: '#38bdf8' },
  vanguard: { icon: Shield, color: '#e879f9' },
  titan: { icon: Mountain, color: '#f87171' },
  ascetic: { icon: Flower2, color: '#a78bfa' },
  // classes
  assassin: { icon: Zap, color: '#4ade80' },
  berserker: { icon: Axe, color: '#f87171' },
  monk: { icon: Wind, color: '#38bdf8' },
  ranger: { icon: Crosshair, color: '#fbbf24' },
  shadow: { icon: Moon, color: '#a78bfa' },
}

export function Emblem({
  id,
  size = 56,
  active = false,
  className = '',
}: {
  id: string
  size?: number
  active?: boolean
  className?: string
}) {
  const def = EMBLEMS[id] ?? EMBLEMS.blade
  const Icon = def.icon
  const hexPoints = '50,4 90,27 90,73 50,96 10,73 10,27'
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0" aria-hidden>
        <polygon
          points={hexPoints}
          fill={active ? `${def.color}1f` : 'rgba(10,17,32,0.85)'}
          stroke={def.color}
          strokeOpacity={active ? 1 : 0.45}
          strokeWidth={active ? 3 : 2}
          style={active ? { filter: `drop-shadow(0 0 8px ${def.color}aa)` } : undefined}
        />
        <polygon points={hexPoints} fill="none" stroke={def.color} strokeOpacity="0.15" strokeWidth="7" />
      </svg>
      <Icon
        size={size * 0.42}
        color={def.color}
        strokeWidth={2.2}
        style={active ? { filter: `drop-shadow(0 0 6px ${def.color})` } : undefined}
      />
    </span>
  )
}
