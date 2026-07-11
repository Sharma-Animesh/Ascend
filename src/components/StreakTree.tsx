import { Flame, Trophy } from 'lucide-react'
import type { CharacterProfile } from '../lib/types'
import { groveState, type TreeHealth } from '../lib/streak'

/**
 * The Streak Grove: a procedurally drawn tree that grows from sapling to giant
 * with the daily streak, gains companion trees past 100 days, turns gold on a
 * missed day and withers after the grace window. Original vector art.
 */

const FOLIAGE: Record<Exclude<TreeHealth, 'dormant'>, string[]> = {
  healthy: ['#16a34a', '#22c55e', '#4ade80'],
  thirsty: ['#d97706', '#f59e0b', '#fbbf24'],
  withered: [],
}

const TRUNK: Record<TreeHealth, string> = {
  healthy: '#6b4f35',
  thirsty: '#6b5535',
  withered: '#57534e',
  dormant: '#4d5a3f',
}

const GLOW: Record<TreeHealth, string> = {
  healthy: 'drop-shadow(0 0 6px rgba(74,222,128,0.4))',
  thirsty: 'drop-shadow(0 0 6px rgba(251,191,36,0.45))',
  withered: 'none',
  dormant: 'drop-shadow(0 0 5px rgba(74,222,128,0.5))',
}

const KEYFRAMES = `
@keyframes grove-sway { from { transform: rotate(-1.3deg); } to { transform: rotate(1.3deg); } }
@keyframes grove-fall { 0% { transform: translate(0,0); opacity: 0.95; } 100% { transform: translate(9px,46px); opacity: 0; } }
@keyframes grove-rise { 0% { transform: translateY(0); opacity: 0; } 25% { opacity: 0.9; } 100% { transform: translateY(-34px); opacity: 0; } }
`

/** deterministic wobble so trees look organic but stable across renders */
const wob = (seed: number, i: number) => Math.sin(seed * 12.9898 + i * 78.233) * 0.5

function Sprout({ x, baseY }: { x: number; baseY: number }) {
  return (
    <g style={{ filter: GLOW.dormant }}>
      <path d={`M ${x} ${baseY} q -1 -7 0 -13`} stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx={x - 4.5} cy={baseY - 13} rx="5" ry="2.6" fill="#22c55e" transform={`rotate(-28 ${x - 4.5} ${baseY - 13})`} />
      <ellipse cx={x + 4.5} cy={baseY - 15} rx="5" ry="2.6" fill="#4ade80" transform={`rotate(24 ${x + 4.5} ${baseY - 15})`} />
    </g>
  )
}

function Tree({
  x,
  baseY,
  t,
  health,
  seed,
  swayDelay,
}: {
  x: number
  baseY: number
  /** 0..1 growth */
  t: number
  health: TreeHealth
  seed: number
  swayDelay: number
}) {
  if (health === 'dormant' || t <= 0.02) return <Sprout x={x} baseY={baseY} />

  const H = 22 + t * 92
  const baseW = 3.2 + t * 6
  const topW = Math.max(1.6, baseW * 0.35)
  const lean = (seed % 2 === 0 ? 1 : -1) * 2.5 * t
  const crownR = 7 + t * 16
  const nBranches = Math.max(1, Math.round(1 + t * 3.6))
  const foliage = FOLIAGE[health as Exclude<TreeHealth, 'dormant'>] ?? []
  const trunk = TRUNK[health]
  const topX = x + lean
  const topY = baseY - H

  const branches = Array.from({ length: nBranches }, (_, i) => {
    const hf = nBranches === 1 ? 0.72 : 0.5 + 0.4 * (i / (nBranches - 1))
    const side = (i % 2 === 0 ? -1 : 1) * (seed % 2 === 0 ? 1 : -1)
    const sx = x + lean * hf
    const sy = baseY - H * hf
    const len = (10 + t * 22) * (1 - 0.28 * (i / nBranches)) * (1 + wob(seed, i) * 0.3)
    const ex = sx + side * len
    const ey = sy - len * (0.5 + wob(seed, i + 9) * 0.2)
    return { sx, sy, ex, ey, side, len, i }
  })

  return (
    <g>
      <ellipse cx={x} cy={baseY + 2} rx={14 + t * 26} ry={3.5} fill="rgba(56,189,248,0.08)" />
      <g
        style={{
          transformOrigin: `${x}px ${baseY}px`,
          animation: health === 'withered' ? 'none' : `grove-sway ${5.4 + seed}s ease-in-out ${swayDelay}s infinite alternate`,
        }}
      >
        {/* trunk */}
        <path
          d={`M ${x - baseW / 2} ${baseY} Q ${x - baseW / 2 + lean * 0.4} ${baseY - H * 0.55} ${topX - topW / 2} ${topY}
              L ${topX + topW / 2} ${topY} Q ${x + baseW / 2 + lean * 0.4} ${baseY - H * 0.55} ${x + baseW / 2} ${baseY} Z`}
          fill={trunk}
        />
        {/* branches */}
        {branches.map((b) => (
          <g key={b.i}>
            <path
              d={`M ${b.sx} ${b.sy} Q ${b.sx + b.side * b.len * 0.5} ${b.sy - b.len * 0.12} ${b.ex} ${b.ey}`}
              stroke={trunk}
              strokeWidth={Math.max(1.2, 2.6 - b.i * 0.3)}
              fill="none"
              strokeLinecap="round"
            />
            {health === 'withered' && (
              <path
                d={`M ${b.ex} ${b.ey} l ${b.side * 5} ${-4} M ${b.ex} ${b.ey} l ${b.side * 2} ${-6.5}`}
                stroke={trunk}
                strokeWidth="1.1"
                fill="none"
                strokeLinecap="round"
              />
            )}
          </g>
        ))}
        {/* foliage */}
        {foliage.length > 0 && (
          <g style={{ filter: GLOW[health] }}>
            {branches.map((b) => (
              <g key={b.i}>
                <circle cx={b.ex} cy={b.ey - 2} r={crownR * (0.5 + 0.12 * wob(seed, b.i + 3))} fill={foliage[b.i % foliage.length]} />
                <circle cx={b.ex - b.side * crownR * 0.3} cy={b.ey - crownR * 0.35} r={crownR * 0.36} fill={foliage[(b.i + 1) % foliage.length]} />
              </g>
            ))}
            <circle cx={topX} cy={topY - crownR * 0.35} r={crownR} fill={foliage[1]} />
            <circle cx={topX - crownR * 0.75} cy={topY + crownR * 0.15} r={crownR * 0.66} fill={foliage[0]} />
            <circle cx={topX + crownR * 0.75} cy={topY + crownR * 0.1} r={crownR * 0.6} fill={foliage[2 % foliage.length]} />
          </g>
        )}
      </g>

      {/* falling gold leaves on the grace day */}
      {health === 'thirsty' &&
        [0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={topX + (i - 1) * crownR * 0.7}
            cy={topY + crownR * 0.4}
            r="2"
            fill="#fbbf24"
            style={{ animation: `grove-fall ${2.4 + i * 0.5}s ease-in ${i * 0.7}s infinite` }}
          />
        ))}
      {/* fallen leaves at the roots of a withered tree */}
      {health === 'withered' &&
        [0, 1, 2, 3].map((i) => (
          <circle key={i} cx={x + (i - 1.5) * 9 + wob(seed, i) * 6} cy={baseY - 1} r="1.8" fill="#78716c" opacity="0.7" />
        ))}
      {/* spirit motes on a thriving tree */}
      {health === 'healthy' && t > 0.35 &&
        [0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={topX + (i - 1) * crownR * 0.8}
            cy={topY}
            r="1.6"
            fill="#7dd3fc"
            style={{ animation: `grove-rise ${3 + i * 0.8}s ease-out ${i * 1.1}s infinite` }}
          />
        ))}
    </g>
  )
}

const GROVE_SPOTS = [
  { x: 170, scale: 1 },
  { x: 84, scale: 0.62 },
  { x: 262, scale: 0.72 },
  { x: 122, scale: 0.5 },
]

export function StreakTree({
  character,
}: {
  character: Pick<CharacterProfile, 'streak' | 'longest_streak' | 'last_activity_date'>
}) {
  const g = groveState(character)
  const baseY = 158

  const streakColor =
    g.health === 'healthy' ? 'text-success' : g.health === 'thirsty' ? 'text-gold' : 'text-mute'

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* grove */}
      <div className="grid-bg relative min-w-0 flex-1 overflow-hidden rounded-lg border border-line/70 bg-abyss/70">
        <svg viewBox="0 0 340 176" className="h-auto w-full" role="img" aria-label={`Streak grove: ${g.stageName}, ${g.streak} day streak`}>
          <style>{KEYFRAMES}</style>
          <line x1="16" y1={baseY + 2} x2="324" y2={baseY + 2} stroke="rgba(56,189,248,0.18)" strokeWidth="1.5" strokeLinecap="round" />
          {GROVE_SPOTS.slice(0, g.trees).map((spot, i) => (
            <Tree
              key={i}
              x={spot.x}
              baseY={baseY}
              t={g.growth * spot.scale}
              health={g.health}
              seed={i + 1}
              swayDelay={i * 0.9}
            />
          ))}
        </svg>
        <span className="pointer-events-none absolute right-2 bottom-1.5 font-display text-[0.52rem] tracking-[0.3em] text-mute/50 uppercase">
          Streak Grove
        </span>
      </div>

      {/* status */}
      <div className="w-full shrink-0 space-y-3 sm:w-56">
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`font-display text-4xl font-black tracking-wider ${streakColor}`}>{g.streak}</span>
            <span className="text-[0.7rem] font-bold tracking-[0.2em] text-mute uppercase">day streak</span>
          </div>
          <span
            className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 font-display text-[0.6rem] font-bold tracking-[0.22em] uppercase ${
              g.health === 'healthy'
                ? 'border-emerald-400/50 text-emerald-300'
                : g.health === 'thirsty'
                  ? 'border-amber-400/50 text-amber-300'
                  : 'border-line text-mute'
            }`}
          >
            {g.stageName}
          </span>
        </div>

        <p className="text-[0.82rem] leading-snug text-mute">{g.message}</p>

        {g.nextMilestone && g.health !== 'withered' && (
          <div>
            <div className="mb-1 flex items-center justify-between text-[0.62rem] font-bold tracking-[0.16em] text-mute uppercase">
              <span className="flex items-center gap-1">
                <Flame size={11} className="text-orange-300" /> {g.nextMilestone.label}
              </span>
              <span>
                {g.streak}/{g.nextMilestone.at}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full border border-line/60 bg-void">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
                style={{ width: `${Math.min(100, (g.streak / g.nextMilestone.at) * 100)}%`, boxShadow: '0 0 8px rgba(74,222,128,0.5)' }}
              />
            </div>
          </div>
        )}

        {character.longest_streak > 0 && (
          <p className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.16em] text-mute uppercase">
            <Trophy size={12} className="text-gold" /> Best: {character.longest_streak} days
          </p>
        )}
      </div>
    </div>
  )
}
