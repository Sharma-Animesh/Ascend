import { useId, useState } from 'react'

/**
 * Full-body original anime-style hunter art per archetype (distinct physiques).
 * - phantom: very lean and wiry, low ready stance, messy spikes, twin dagger hilts
 * - blade: athletic V-taper, upright confident stance, swept-back hair
 * - vanguard: broad shoulders, heavy flared arms, defined chest
 * - titan: massive silhouette, thick neck, heaviest limbs, planted stance
 * - ascetic: slender meditative posture, folded hands, long ponytail, A-line robe
 * Deterministic SVG (no randomness). Unknown archetype falls back to blade.
 */

const BODY = '#2a4a6e'
const LIMB = '#2c4d72'
const EDGE = '#4c81b8'
const HAIR = '#2d5078'
const ROBE = '#24405f'
const EYE = '#bfeaff'

type Pt = readonly [number, number]
type WispPt = readonly [number, number, number]

const lineD = (pts: readonly Pt[]) => 'M ' + pts.map((p) => p.join(',')).join(' L ')

/** Capsule limb: rim outline stroke underneath, body-tone core stroke on top. */
function Limb({ pts, w }: { pts: readonly Pt[]; w: number }) {
  const d = lineD(pts)
  return (
    <>
      <path d={d} fill="none" stroke={EDGE} strokeWidth={w + 2.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={LIMB} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

/** Two-segment arm with a thicker upper arm than forearm (muscular builds). */
function Arm2({ a, b, c, wU, wL }: { a: Pt; b: Pt; c: Pt; wU: number; wL: number }) {
  return (
    <>
      <Limb pts={[a, b]} w={wU} />
      <Limb pts={[b, c]} w={wL} />
    </>
  )
}

/** Filled torso with shoulder -> waist taper -> hip. Half-widths sh/wa/hp at y coords. */
function torsoD(sh: number, shy: number, wa: number, way: number, hp: number, hpy: number, tl = 4): string {
  return (
    `M ${70 - sh},${shy + 2} ` +
    `Q 70,${shy - tl} ${70 + sh},${shy + 2} ` +
    `C ${70 + sh - 2},${shy + 18} ${70 + wa + 2},${way - 12} ${70 + wa},${way} ` +
    `L ${70 + hp},${hpy} ` +
    `Q 70,${hpy + 8} ${70 - hp},${hpy} ` +
    `L ${70 - wa},${way} ` +
    `C ${70 - wa - 2},${way - 12} ${70 - sh + 2},${shy + 18} ${70 - sh},${shy + 2} Z`
  )
}

function Head({ cy, r, hair }: { cy: number; r: number; hair: string }) {
  const ey = cy + 1.5
  return (
    <>
      <circle cx={70} cy={cy} r={r} fill={BODY} stroke={EDGE} strokeWidth={1.1} />
      <path d={hair} fill={HAIR} stroke={EDGE} strokeWidth={0.9} />
      <g style={{ filter: 'drop-shadow(0 0 3px #38bdf8)' }}>
        <circle cx={65.6} cy={ey} r={1.7} fill={EYE} />
        <circle cx={74.4} cy={ey} r={1.7} fill={EYE} />
      </g>
    </>
  )
}

/** Floating accent aura particles. */
function Wisps({ accent, pts }: { accent: string; pts: readonly WispPt[] }) {
  return (
    <>
      {pts.map(([x, y, r], i) => (
        <circle
          key={i}
          className={`ca-wisp${i === 1 ? ' ca-w2' : i === 2 ? ' ca-w3' : ''}`}
          cx={x}
          cy={y}
          r={r}
          fill={accent}
          opacity={0.6}
          style={{ filter: 'blur(.4px)' }}
        />
      ))}
    </>
  )
}

type FigureProps = { a: string; gid: string }

/* ---------- PHANTOM: lean, wiry, low ready stance ---------- */
function Phantom({ a, gid }: FigureProps) {
  const hair =
    'M60,50 Q54,44 55,36 L47,31 L56,32 L53,21 L62,28 L64,16 L70,26 L75,14 L78,25 ' +
    'L86,18 L83,29 L91,28 L85,37 Q87,43 83,49 Q81,36 70,34 Q61,35 60,42 Z'
  return (
    <>
      <Wisps accent={a} pts={[[40, 76, 2], [102, 60, 1.6], [48, 44, 1.4]]} />
      <Limb pts={[[63, 110], [56, 146], [52, 190]]} w={8.5} />
      <Limb pts={[[77, 110], [84, 146], [88, 190]]} w={8.5} />
      <Limb pts={[[52, 191], [43, 194]]} w={5.5} />
      <Limb pts={[[88, 191], [97, 194]]} w={5.5} />
      <Limb pts={[[55, 69], [46, 88], [51, 107]]} w={7} />
      <Limb pts={[[85, 69], [94, 88], [89, 107]]} w={7} />
      {/* twin dagger hilts at the hips */}
      <Limb pts={[[56, 104], [45, 110]]} w={4.5} />
      <Limb pts={[[84, 104], [95, 110]]} w={4.5} />
      <circle cx={45} cy={110} r={1.6} fill={a} opacity={0.9} />
      <circle cx={95} cy={110} r={1.6} fill={a} opacity={0.9} />
      <Limb pts={[[70, 55], [70, 63]]} w={6} />
      <path d={torsoD(16, 66, 8.5, 104, 10.5, 112)} fill={`url(#${gid})`} stroke={EDGE} strokeWidth={1.1} />
      <path d="M61,109 Q70,113 79,109" stroke={EDGE} strokeWidth={1.2} fill="none" opacity={0.45} />
      <circle cx={70} cy={111} r={1.3} fill={a} opacity={0.9} />
      <Head cy={44} r={11} hair={hair} />
    </>
  )
}

/* ---------- BLADE: athletic V-taper, upright ---------- */
function Blade({ a, gid }: FigureProps) {
  const hair =
    'M59,31 Q56,18 67,12 Q79,7 88,15 Q95,13 100,19 Q94,21 92,25 Q99,26 102,32 ' +
    'Q95,33 90,31 Q93,39 88,43 Q85,32 79,27 Q73,23 65,25 Q60,27 59,33 Z'
  return (
    <>
      <Wisps accent={a} pts={[[40, 64, 2], [102, 50, 1.6], [46, 34, 1.4]]} />
      <Limb pts={[[62, 103], [59, 149], [57, 195]]} w={11} />
      <Limb pts={[[78, 103], [81, 149], [83, 195]]} w={11} />
      <Limb pts={[[57, 196], [47, 199]]} w={6.5} />
      <Limb pts={[[83, 196], [93, 199]]} w={6.5} />
      <Limb pts={[[49, 61], [43, 80], [40, 98]]} w={9} />
      <Limb pts={[[91, 61], [97, 80], [100, 98]]} w={9} />
      <Limb pts={[[70, 42], [70, 53]]} w={7} />
      <path d={torsoD(23, 56, 10.5, 96, 13, 103)} fill={`url(#${gid})`} stroke={EDGE} strokeWidth={1.1} />
      <path d="M64,58 L70,65 L76,58" stroke={EDGE} strokeWidth={1.2} fill="none" opacity={0.5} />
      <path d="M59,100 Q70,104 81,100" stroke={EDGE} strokeWidth={1.2} fill="none" opacity={0.45} />
      <circle cx={70} cy={102} r={1.3} fill={a} opacity={0.9} />
      <Head cy={30} r={12} hair={hair} />
    </>
  )
}

/* ---------- VANGUARD: broad, muscular, arms flared ---------- */
function Vanguard({ a, gid }: FigureProps) {
  const hair =
    'M58,28 Q55,19 60,13 L58,5 L66,10 L71,2 L75,10 L83,4 L83,12 L91,9 L87,17 ' +
    'L94,19 Q88,23 85,28 Q78,17 68,17 Q60,18 58,28 Z'
  return (
    <>
      <Wisps accent={a} pts={[[34, 68, 2.2], [108, 54, 1.8], [42, 38, 1.4]]} />
      <Limb pts={[[61, 103], [56, 150], [54, 196]]} w={13} />
      <Limb pts={[[79, 103], [84, 150], [86, 196]]} w={13} />
      <Limb pts={[[54, 197], [43, 200]]} w={7} />
      <Limb pts={[[86, 197], [97, 200]]} w={7} />
      <Arm2 a={[46, 60]} b={[35, 81]} c={[39, 102]} wU={14} wL={11} />
      <Arm2 a={[94, 60]} b={[105, 81]} c={[101, 102]} wU={14} wL={11} />
      <Limb pts={[[70, 40], [70, 50]]} w={9} />
      <path d={torsoD(27, 55, 12, 96, 15, 103)} fill={`url(#${gid})`} stroke={EDGE} strokeWidth={1.1} />
      <path d="M58,67 Q70,74 82,67" stroke={EDGE} strokeWidth={1.2} fill="none" opacity={0.5} />
      <path d="M70,77 L70,92" stroke={EDGE} strokeWidth={1} fill="none" opacity={0.35} />
      <path d="M60,100 Q70,104 80,100" stroke={EDGE} strokeWidth={1.2} fill="none" opacity={0.45} />
      <circle cx={70} cy={102} r={1.3} fill={a} opacity={0.9} />
      <Head cy={28} r={12} hair={hair} />
    </>
  )
}

/* ---------- TITAN: massive, widest, planted ---------- */
function Titan({ a, gid }: FigureProps) {
  const hair = 'M57,17 Q58,5 70,4 Q82,5 83,17 Q77,9 70,9 Q63,9 57,17 Z'
  return (
    <>
      <Wisps accent={a} pts={[[28, 74, 2.4], [114, 58, 2], [36, 40, 1.6]]} />
      <Limb pts={[[58, 108], [49, 152], [45, 196]]} w={17} />
      <Limb pts={[[82, 108], [91, 152], [95, 196]]} w={17} />
      <Limb pts={[[45, 197], [33, 201]]} w={8.5} />
      <Limb pts={[[95, 197], [107, 201]]} w={8.5} />
      <Arm2 a={[42, 59]} b={[30, 87]} c={[32, 112]} wU={18} wL={15} />
      <Arm2 a={[98, 59]} b={[110, 87]} c={[108, 112]} wU={18} wL={15} />
      <Limb pts={[[70, 31], [70, 47]]} w={14} />
      <path d={torsoD(32, 54, 17, 100, 20, 108, 2)} fill={`url(#${gid})`} stroke={EDGE} strokeWidth={1.1} />
      <path d="M55,66 Q70,73 85,66" stroke={EDGE} strokeWidth={1.2} fill="none" opacity={0.5} />
      <path d="M55,104 Q70,109 85,104" stroke={EDGE} strokeWidth={1.3} fill="none" opacity={0.45} />
      <circle cx={70} cy={106.5} r={1.5} fill={a} opacity={0.9} />
      <Head cy={21} r={13} hair={hair} />
    </>
  )
}

/* ---------- ASCETIC: slender, robed, ponytail ---------- */
function Ascetic({ a, gid }: FigureProps) {
  const hair = 'M58,32 Q55,16 70,13 Q85,16 82,32 Q80,20 70,19 Q60,20 58,32 Z'
  return (
    <>
      <Wisps accent={a} pts={[[44, 60, 1.8], [98, 46, 1.5], [50, 30, 1.3]]} />
      {/* long tied-back ponytail behind the body */}
      <path
        d="M76,14 Q93,25 91,54 Q89,84 95,110 Q96,116 91,115 Q83,90 84,60 Q84,34 71,20 Z"
        fill={HAIR}
        stroke={EDGE}
        strokeWidth={0.8}
      />
      <path d="M85,42 l5,2" stroke={a} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
      {/* A-line robe */}
      <path d="M59,92 Q70,88 81,92 L92,194 Q70,202 48,194 Z" fill={ROBE} stroke={EDGE} strokeWidth={1} />
      <Limb pts={[[62, 197], [57, 199]]} w={5} />
      <Limb pts={[[78, 197], [83, 199]]} w={5} />
      <Limb pts={[[55, 60], [54, 80], [66, 93]]} w={8} />
      <Limb pts={[[85, 60], [86, 80], [74, 93]]} w={8} />
      <circle cx={70} cy={94} r={4.5} fill={LIMB} stroke={EDGE} strokeWidth={1} />
      <Limb pts={[[70, 42], [70, 53]]} w={6} />
      <path d={torsoD(16.5, 56, 9.5, 94, 11, 98)} fill={`url(#${gid})`} stroke={EDGE} strokeWidth={1.1} />
      <path d="M60,95 Q70,99 80,95" stroke={a} strokeWidth={1.5} fill="none" opacity={0.6} />
      <Head cy={30} r={11.5} hair={hair} />
    </>
  )
}

const FIGURES = {
  phantom: { accent: '#4ade80', shadowRx: 28, Figure: Phantom },
  blade: { accent: '#38bdf8', shadowRx: 30, Figure: Blade },
  vanguard: { accent: '#e879f9', shadowRx: 34, Figure: Vanguard },
  titan: { accent: '#f87171', shadowRx: 42, Figure: Titan },
  ascetic: { accent: '#a78bfa', shadowRx: 28, Figure: Ascetic },
} as const

type ArchetypeId = keyof typeof FIGURES

const STYLE = `
@keyframes ca-breathe { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.01) } }
@keyframes ca-wispf { 0%,100% { transform: translateY(0); opacity: .35 } 50% { transform: translateY(-7px); opacity: .9 } }
@keyframes ca-enter { 0% { transform: translateY(16px) scale(.9); opacity: 0 } 55% { opacity: 1 } 78% { transform: translateY(-3px) scale(1.015) } 100% { transform: translateY(0) scale(1); opacity: 1 } }
@keyframes ca-ring { 0%,100% { transform: scaleX(.72); opacity: .2 } 50% { transform: scaleX(1.06); opacity: .55 } }
@keyframes ca-orbit { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
.ca-breathe { animation: ca-breathe 4s ease-in-out infinite; transform-origin: 70px 204px; }
.ca-wisp { animation: ca-wispf 6s ease-in-out infinite; }
.ca-w2 { animation-delay: -2s; animation-duration: 7s; }
.ca-w3 { animation-delay: -4s; animation-duration: 5.2s; }
.ca-enter { animation: ca-enter .8s cubic-bezier(.22,1,.36,1) both; transform-origin: 70px 204px; }
.ca-ring { animation: ca-ring 3.4s ease-in-out infinite; transform-origin: 70px 207px; }
.ca-orbit { animation: ca-orbit 11s linear infinite; transform-origin: 70px 112px; }
@media (prefers-reduced-motion: reduce) { .ca-breathe, .ca-wisp, .ca-enter, .ca-ring, .ca-orbit { animation: none; } }
`

export function CharacterArt({
  archetype,
  size = 220,
  className = '',
}: {
  archetype: string
  size?: number
  className?: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const arch: ArchetypeId = archetype in FIGURES ? (archetype as ArchetypeId) : 'blade'
  const { accent, shadowRx, Figure } = FIGURES[arch]
  const gid = `ca-grad-${arch}-${uid}`

  // Licensed / commissioned / AI-generated art dropped into
  // public/characters/<archetype>.png automatically replaces the built-in
  // vector figure (see public/characters/README.md for licensing rules).
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  if (!imgFailed) {
    return (
      <span className={`relative inline-block ${className}`} style={{ width: size * 0.65, height: size }}>
        {!imgLoaded && <BuiltInFigure size={size} arch={arch} accent={accent} shadowRx={shadowRx} Figure={Figure} gid={gid} />}
        <img
          src={`/characters/${arch}.png`}
          alt={`${arch} character`}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            display: imgLoaded ? 'block' : 'none',
            filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.3))',
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
        />
      </span>
    )
  }
  return <BuiltInFigure size={size} arch={arch} accent={accent} shadowRx={shadowRx} Figure={Figure} gid={gid} className={className} />
}

function BuiltInFigure({
  size,
  arch,
  accent,
  shadowRx,
  Figure,
  gid,
  className = '',
}: {
  size: number
  arch: string
  accent: string
  shadowRx: number
  Figure: (p: FigureProps) => ReturnType<typeof Blade>
  gid: string
  className?: string
}) {
  return (
    <svg
      width={size * 0.65}
      height={size}
      viewBox="0 0 140 220"
      className={className}
      role="img"
      aria-label={`${arch} character`}
    >
      <style>{STYLE}</style>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35597f" />
          <stop offset="1" stopColor="#223f61" />
        </linearGradient>
      </defs>
      {/* ground glow + pulsing aura ring */}
      <ellipse cx={70} cy={207} rx={shadowRx} ry={5} fill={accent} opacity={0.12} />
      <ellipse cx={70} cy={207} rx={shadowRx * 0.55} ry={3} fill={accent} opacity={0.14} />
      <ellipse
        cx={70}
        cy={207}
        rx={shadowRx * 1.15}
        ry={6}
        fill="none"
        stroke={accent}
        strokeWidth={1.2}
        className="ca-ring"
      />
      {/* orbiting energy motes */}
      <g className="ca-orbit">
        <circle cx={70 + shadowRx * 1.05} cy={112} r={2.1} fill={accent} opacity={0.75} style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
        <circle cx={70 - shadowRx * 0.95} cy={148} r={1.5} fill="#7dd3fc" opacity={0.6} style={{ filter: 'drop-shadow(0 0 3px #38bdf8)' }} />
      </g>
      <g className="ca-enter">
        <g className="ca-breathe" style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,.45))' }}>
          <Figure a={accent} gid={gid} />
        </g>
      </g>
    </svg>
  )
}
