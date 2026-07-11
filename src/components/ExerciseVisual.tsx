import type { Exercise } from '../lib/types'

/**
 * Exercise demo visual. If the exercise has a hosted clip/image it renders that;
 * otherwise it renders an original, animated "System hologram" figure keyed by
 * `animation_url` ("anim:<key>") or inferred from the category.
 *
 * Built-in keys: pushup · squat · pull · plank · run · stretch · breathe · punch · generic
 */
type VisualExercise = Pick<Exercise, 'name' | 'category' | 'animation_url' | 'image_url'>

const C = {
  body: '#7dd3fc',
  dim: 'rgba(125,211,252,0.35)',
  ground: 'rgba(56,189,248,0.25)',
  glow: 'drop-shadow(0 0 5px rgba(56,189,248,0.8))',
}

function keyFor(ex: VisualExercise): string {
  const a = ex.animation_url ?? ''
  if (a.startsWith('anim:')) return a.slice(5)
  switch (ex.category) {
    case 'yoga':
      return 'stretch'
    case 'breath':
      return 'breathe'
    case 'martial':
      return 'punch'
    case 'calisthenics':
      return 'pull'
    default:
      return 'generic'
  }
}

const KEYFRAMES = `
@keyframes exv-rock { from { transform: rotate(0deg); } to { transform: rotate(9deg); } }
@keyframes exv-sink { from { transform: translateY(0); } to { transform: translateY(13px); } }
@keyframes exv-swapA { 0%, 49.9% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes exv-swapB { 0%, 49.9% { opacity: 0; } 50%, 100% { opacity: 1; } }
@keyframes exv-rise { from { transform: translateY(0); } to { transform: translateY(-13px); } }
@keyframes exv-breathe { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.3); opacity: 0.45; } }
@keyframes exv-breathe2 { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.5); opacity: 0.15; } }
@keyframes exv-fold { from { transform: rotate(0deg); } to { transform: rotate(52deg); } }
@keyframes exv-jab { 0%, 100% { transform: scaleX(0.55); } 45%, 60% { transform: scaleX(1); } }
@keyframes exv-bob { from { transform: translateY(0); } to { transform: translateY(-3px); } }
@keyframes exv-dash { to { stroke-dashoffset: -60; } }
@keyframes exv-pulse { 0%, 100% { opacity: 0.85; } 50% { opacity: 0.35; } }
`

function Ground() {
  return <line x1="18" y1="122" x2="182" y2="122" stroke={C.ground} strokeWidth="2" strokeLinecap="round" />
}

function Scene({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" role="img" aria-label={label}>
      <style>{KEYFRAMES}</style>
      {children}
    </svg>
  )
}

const FIG = { stroke: C.body, strokeWidth: 3.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }

function PushupScene() {
  return (
    <Scene label="Push-up demonstration">
      <Ground />
      <g style={{ transformOrigin: '155px 118px', animation: 'exv-rock 1.6s ease-in-out infinite alternate', filter: C.glow }}>
        <circle cx="56" cy="93" r="7" {...FIG} />
        <path d="M64 97 L120 110 L155 118" {...FIG} />
        <path d="M74 99 L74 120" {...FIG} />
        <path d="M92 103 L94 120" {...FIG} />
      </g>
    </Scene>
  )
}

function SquatScene() {
  return (
    <Scene label="Squat demonstration">
      <Ground />
      <g style={{ filter: C.glow }}>
        {/* torso group sinks */}
        <g style={{ animation: 'exv-sink 1.7s ease-in-out infinite alternate' }}>
          <circle cx="100" cy="36" r="7" {...FIG} />
          <path d="M100 44 L100 78" {...FIG} />
          <path d="M100 52 L128 58" {...FIG} />
          <path d="M100 52 L72 58" {...FIG} />
        </g>
        {/* legs crossfade straight <-> bent */}
        <g style={{ animation: 'exv-swapA 3.4s linear infinite' }}>
          <path d="M100 78 L92 100 L92 121" {...FIG} />
          <path d="M100 78 L108 100 L108 121" {...FIG} />
        </g>
        <g style={{ animation: 'exv-swapB 3.4s linear infinite' }}>
          <path d="M100 91 L80 100 L84 121" {...FIG} />
          <path d="M100 91 L120 100 L116 121" {...FIG} />
        </g>
      </g>
    </Scene>
  )
}

function PullScene() {
  return (
    <Scene label="Pull-up demonstration">
      <line x1="55" y1="26" x2="145" y2="26" stroke={C.ground} strokeWidth="3" strokeLinecap="round" />
      <line x1="55" y1="26" x2="50" y2="122" stroke={C.dim} strokeWidth="2" />
      <line x1="145" y1="26" x2="150" y2="122" stroke={C.dim} strokeWidth="2" />
      <g style={{ animation: 'exv-rise 1.5s ease-in-out infinite alternate', filter: C.glow }}>
        <path d="M84 30 L96 56" {...FIG} />
        <path d="M116 30 L104 56" {...FIG} />
        <circle cx="100" cy="50" r="7" {...FIG} />
        <path d="M100 58 L100 88" {...FIG} />
        <path d="M100 88 L92 108" {...FIG} />
        <path d="M100 88 L108 108" {...FIG} />
      </g>
    </Scene>
  )
}

function PlankScene() {
  return (
    <Scene label="Plank hold demonstration">
      <Ground />
      <g style={{ animation: 'exv-bob 2.6s ease-in-out infinite alternate', filter: C.glow }}>
        <circle cx="52" cy="92" r="7" {...FIG} />
        <path d="M60 96 L118 104 L156 118" {...FIG} />
        <path d="M72 98 L70 120" {...FIG} />
      </g>
      <circle cx="100" cy="70" r="52" fill="none" stroke={C.dim} strokeWidth="1.5" strokeDasharray="6 8" style={{ animation: 'exv-pulse 2.6s ease-in-out infinite' }} />
    </Scene>
  )
}

function RunScene() {
  return (
    <Scene label="Running demonstration">
      <Ground />
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={26}
          y1={62 + i * 18}
          x2={54}
          y2={62 + i * 18}
          stroke={C.dim}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="14 46"
          style={{ animation: `exv-dash 0.9s linear infinite`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
      <g style={{ animation: 'exv-bob 0.45s ease-in-out infinite alternate', filter: C.glow }}>
        <circle cx="112" cy="42" r="7" {...FIG} />
        <path d="M110 50 L102 82" {...FIG} />
        <g style={{ animation: 'exv-swapA 0.7s linear infinite' }}>
          <path d="M102 82 L122 96 L124 118" {...FIG} />
          <path d="M102 82 L84 100 L74 114" {...FIG} />
          <path d="M108 56 L130 66" {...FIG} />
          <path d="M108 56 L88 68" {...FIG} />
        </g>
        <g style={{ animation: 'exv-swapB 0.7s linear infinite' }}>
          <path d="M102 82 L86 98 L92 118" {...FIG} />
          <path d="M102 82 L118 96 L134 106" {...FIG} />
          <path d="M108 56 L86 64" {...FIG} />
          <path d="M108 56 L128 70" {...FIG} />
        </g>
      </g>
    </Scene>
  )
}

function StretchScene() {
  return (
    <Scene label="Forward fold stretch demonstration">
      <Ground />
      <g style={{ filter: C.glow }}>
        <path d="M96 118 L156 118" {...FIG} />
        <g style={{ transformOrigin: '96px 116px', animation: 'exv-fold 2.8s ease-in-out infinite alternate' }}>
          <path d="M96 116 L96 66" {...FIG} />
          <circle cx="96" cy="58" r="7" {...FIG} />
          <path d="M96 76 L118 88" {...FIG} />
        </g>
      </g>
    </Scene>
  )
}

function BreatheScene() {
  return (
    <Scene label="Breathing exercise demonstration">
      <g style={{ transformOrigin: '100px 74px' }}>
        <circle cx="100" cy="74" r="26" fill="none" stroke={C.body} strokeWidth="2" style={{ transformOrigin: '100px 74px', animation: 'exv-breathe 6s ease-in-out infinite', filter: C.glow }} />
        <circle cx="100" cy="74" r="38" fill="none" stroke={C.dim} strokeWidth="1.5" style={{ transformOrigin: '100px 74px', animation: 'exv-breathe2 6s ease-in-out infinite' }} />
      </g>
      <circle cx="100" cy="64" r="6" {...FIG} />
      <path d="M100 71 L100 86 M90 92 L100 86 L110 92 M86 80 L100 76 L114 80" {...FIG} strokeWidth={3} />
    </Scene>
  )
}

function PunchScene() {
  return (
    <Scene label="Striking technique demonstration">
      <Ground />
      <g style={{ filter: C.glow }}>
        <circle cx="86" cy="44" r="7" {...FIG} />
        <path d="M88 52 L92 84" {...FIG} />
        <path d="M92 84 L80 102 L76 120" {...FIG} />
        <path d="M92 84 L108 100 L112 120" {...FIG} />
        {/* rear guard arm */}
        <path d="M89 58 L74 66" {...FIG} />
        {/* jabbing arm */}
        <g style={{ transformOrigin: '90px 57px', animation: 'exv-jab 1.1s ease-in-out infinite' }}>
          <path d="M90 57 L146 52" {...FIG} />
        </g>
      </g>
    </Scene>
  )
}

function GenericScene() {
  return (
    <Scene label="Exercise">
      <polygon
        points="100,28 140,51 140,97 100,120 60,97 60,51"
        fill="none"
        stroke={C.body}
        strokeWidth="2.5"
        style={{ animation: 'exv-pulse 2.4s ease-in-out infinite', filter: C.glow }}
      />
      <path d="M78 74 L122 74 M84 62 L84 86 M116 62 L116 86 M72 68 L72 80 M128 68 L128 80" {...FIG} strokeWidth={4} />
    </Scene>
  )
}

const SCENES: Record<string, () => React.ReactElement> = {
  pushup: PushupScene,
  squat: SquatScene,
  pull: PullScene,
  plank: PlankScene,
  run: RunScene,
  stretch: StretchScene,
  breathe: BreatheScene,
  punch: PunchScene,
  generic: GenericScene,
}

export function ExerciseVisual({ exercise, className = '' }: { exercise: VisualExercise; className?: string }) {
  const url = exercise.animation_url
  const isRemote = !!url && /^https?:\/\//.test(url)

  return (
    <div
      className={`grid-bg relative overflow-hidden rounded-lg border border-line/70 bg-abyss/80 ${className}`}
      style={{ aspectRatio: '10 / 7' }}
    >
      {isRemote ? (
        <video src={url!} autoPlay loop muted playsInline className="h-full w-full object-cover" />
      ) : exercise.image_url ? (
        <img src={exercise.image_url} alt={exercise.name} className="h-full w-full object-cover" />
      ) : (
        (SCENES[keyFor(exercise)] ?? GenericScene)()
      )}
      <span className="pointer-events-none absolute right-2 bottom-1.5 font-display text-[0.52rem] tracking-[0.3em] text-mute/50 uppercase">
        System Demo
      </span>
    </div>
  )
}
