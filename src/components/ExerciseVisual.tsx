import type { Exercise } from '../lib/types'
import {
  BenchScene,
  CurlScene,
  DipScene,
  PlankScene,
  PressScene,
  PullApartScene,
  PulldownScene,
  PullScene,
  PushupScene,
  RowScene,
  SideplankScene,
  SquatScene,
} from './scenes/scenesA'
import {
  BridgeScene,
  BreatheScene,
  BurpeeScene,
  CrunchScene,
  DeadliftScene,
  FootworkScene,
  GuardScene,
  HollowScene,
  JacksScene,
  KickScene,
  KneeScene,
  LungeScene,
  PistolScene,
  PunchScene,
  RopeScene,
  RunScene,
  SlipScene,
  StretchScene,
} from './scenes/scenesB'
import {
  CatcowScene,
  ChildScene,
  DowndogScene,
  FoldstandScene,
  PigeonScene,
  ThreadScene,
  WarriorScene,
} from './scenes/scenesC'

/**
 * Exercise demo visual.
 *
 * Resolution order:
 *   1. http(s) `animation_url`      → hosted clip
 *   2. `image_url`                  → still image
 *   3. exercise NAME                → specific built-in scene (so e.g. a
 *      Romanian Deadlift never plays the generic squat loop)
 *   4. `animation_url` "anim:<key>" → explicit built-in scene
 *   5. category                     → sensible default
 *
 * Built-in scenes (37): pushup · squat · pistol · deadlift · lunge · bridge ·
 * bench · press · pull · pulldown · row · pullapart · curl · dip · plank ·
 * sideplank · hollow · crunch · run · jacks · rope · burpee · punch · kick ·
 * knee · slip · footwork · guard · stretch · breathe · catcow · child ·
 * downdog · pigeon · thread · warrior · foldstand
 */
type VisualExercise = Pick<Exercise, 'name' | 'category' | 'animation_url' | 'image_url'>

const SCENES: Record<string, () => React.ReactElement> = {
  pushup: PushupScene,
  squat: SquatScene,
  pistol: PistolScene,
  deadlift: DeadliftScene,
  lunge: LungeScene,
  bridge: BridgeScene,
  bench: BenchScene,
  press: PressScene,
  pull: PullScene,
  pulldown: PulldownScene,
  row: RowScene,
  pullapart: PullApartScene,
  curl: CurlScene,
  generic: CurlScene,
  dip: DipScene,
  plank: PlankScene,
  sideplank: SideplankScene,
  hollow: HollowScene,
  crunch: CrunchScene,
  run: RunScene,
  jacks: JacksScene,
  rope: RopeScene,
  burpee: BurpeeScene,
  punch: PunchScene,
  kick: KickScene,
  knee: KneeScene,
  slip: SlipScene,
  footwork: FootworkScene,
  guard: GuardScene,
  stretch: StretchScene,
  breathe: BreatheScene,
  catcow: CatcowScene,
  child: ChildScene,
  downdog: DowndogScene,
  pigeon: PigeonScene,
  thread: ThreadScene,
  warrior: WarriorScene,
  foldstand: FoldstandScene,
}

/** Ordered name→scene rules; first hit wins. Order avoids collisions. */
const NAME_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/pistol/, 'pistol'],
  [/bench\s*press|chest\s*press|floor\s*press/, 'bench'],
  [/overhead\s*press|shoulder\s*press|military|\bohp\b/, 'press'],
  [/deadlift/, 'deadlift'],
  [/\bbridge\b|glute\s*bridge|hip\s*thrust/, 'bridge'],
  [/jumping\s*jack|star\s*jump/, 'jacks'],
  [/jump\s*rope|skipping\s*rope|\brope\b/, 'rope'],
  [/burpee/, 'burpee'],
  [/crunch|sit-?up/, 'crunch'],
  [/side\s*plank/, 'sideplank'],
  [/hollow/, 'hollow'],
  [/plank/, 'plank'],
  [/pull\s*-?\s*down/, 'pulldown'],
  [/pull\s*-?\s*apart|face\s*pull/, 'pullapart'],
  [/high\s*knees/, 'run'],
  [/pull\s*-?\s*up|chin\s*-?\s*up/, 'pull'],
  [/\brow\b|seated\s*cable/, 'row'],
  [/curl/, 'curl'],
  [/\bdip\b/, 'dip'],
  [/split\s*squat/, 'lunge'],
  [/lunge/, 'lunge'],
  [/\bsquat\b|leg\s*press/, 'squat'],
  [/push\s*-?\s*up|planche/, 'pushup'],
  [/\bpress\b/, 'press'],
  [/\bjab\b|\bcross\b|shadowbox|punch/, 'punch'],
  [/\bkick\b/, 'kick'],
  [/knee\s*strike|\bknee\b/, 'knee'],
  [/\bslip\b|\bweave\b|\bduck\b/, 'slip'],
  [/footwork|stance\s*switch|shuffle/, 'footwork'],
  [/posture|awareness|self-?defense|guard/, 'guard'],
  [/cat\s*-?\s*cow/, 'catcow'],
  [/child/, 'child'],
  [/downward\s*dog|downdog/, 'downdog'],
  [/pigeon/, 'pigeon'],
  [/thread/, 'thread'],
  [/warrior/, 'warrior'],
  [/forward\s*fold/, 'foldstand'],
]

function keyFor(ex: VisualExercise): string {
  const name = ex.name.toLowerCase()
  for (const [re, key] of NAME_RULES) if (re.test(name)) return key
  const a = ex.animation_url ?? ''
  if (a.startsWith('anim:') && a.slice(5) in SCENES) return a.slice(5)
  switch (ex.category) {
    case 'yoga':
      return 'stretch'
    case 'breath':
      return 'breathe'
    case 'martial':
      return 'punch'
    default:
      return 'curl'
  }
}

export function ExerciseVisual({ exercise, className = '' }: { exercise: VisualExercise; className?: string }) {
  const url = exercise.animation_url
  const isRemote = !!url && /^https?:\/\//.test(url)
  const SceneComp = SCENES[keyFor(exercise)] ?? CurlScene

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
        <SceneComp />
      )}
      <span className="pointer-events-none absolute right-2 bottom-1.5 font-display text-[0.52rem] tracking-[0.3em] text-mute/50 uppercase">
        System Demo
      </span>
    </div>
  )
}
