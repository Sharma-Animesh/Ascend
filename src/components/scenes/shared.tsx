import type { ReactNode } from 'react'

/**
 * Shared building blocks for the animated "System hologram" exercise demos.
 * All scenes live in a 220×150 viewBox with the ground line at y=132.
 */

export const COL = {
  lb: '#35597f', // near limb (proximal)
  lb2: '#2f5074', // near limb (distal)
  far: '#22394f', // far-side limb
  cap: '#2a4a6e', // torso capsule
} as const

export const HD = { fill: '#35597f', stroke: '#4d7fb5', strokeWidth: 1 } as const
export const TOR = { fill: '#2a4a6e', stroke: '#4d7fb5', strokeWidth: 1 } as const
export const FIG_GLOW = { filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.45))' } as const

export type Pt = readonly [number, number]

const MUS_STYLE = {
  filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.8))',
  animation: 'exv-mpulse 2s ease-in-out infinite',
} as const

/** Capsule limb segment: a round-capped stroke. */
export function Limb({ d, w, c = 'lb' }: { d: string; w: number; c?: keyof typeof COL }) {
  return <path d={d} stroke={COL[c]} strokeWidth={w} strokeLinecap="round" fill="none" />
}

/** Warm muscle-highlight overlay (orange→red gradient, pulsing glow). */
export function Mus({ cx, cy, rx, ry, rot = 0 }: { cx: number; cy: number; rx: number; ry: number; rot?: number }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined}
      fill="url(#exvMus)"
      opacity={0.9}
      style={MUS_STYLE}
    />
  )
}

/** Articulated joint: children rotate around (x, y) driven by a CSS animation. */
export function Jt({ x, y, anim, children }: { x: number; y: number; anim: string; children: ReactNode }) {
  return <g style={{ transformOrigin: `${x}px ${y}px`, animation: anim }}>{children}</g>
}

export function Ground() {
  return (
    <line x1="14" y1="132" x2="206" y2="132" stroke="rgba(56,189,248,0.25)" strokeWidth="2" strokeLinecap="round" />
  )
}

export function Shadow({ cx, rx }: { cx: number; rx: number }) {
  return <ellipse cx={cx} cy={132} rx={rx} ry={3} fill="rgba(56,189,248,0.08)" />
}

/** Impact burst: four expanding rays + core dot, driven by `exv-imp`. */
export function Burst({ x, y, anim, c = 'rgba(251,191,36,0.9)' }: { x: number; y: number; anim: string; c?: string }) {
  return (
    <g style={{ transformOrigin: `${x}px ${y}px`, animation: anim, opacity: 0 }}>
      {[0, 45, 90, 135].map((a) => (
        <line
          key={a}
          x1={x - 6}
          y1={y}
          x2={x + 6}
          y2={y}
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${a} ${x} ${y})`}
        />
      ))}
      <circle cx={x} cy={y} r={2.6} fill={c} />
    </g>
  )
}

/** Dust puffs rising from ground contact points, driven by `exv-du`. */
export function Dust({ pts, anim, stag = 0 }: { pts: readonly Pt[]; anim: string; stag?: number }) {
  return (
    <>
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={2.6}
          fill="#bae6fd"
          style={{ transformOrigin: `${x}px ${y}px`, animation: `${anim} ${i * stag}s`, opacity: 0 }}
        />
      ))}
    </>
  )
}

/**
 * Every @keyframes used by any demo scene, injected once per SVG.
 * Inline-SVG <style> is document-global, hence the strict `exv-` prefixing.
 */
const KEYFRAMES = `
@keyframes exv-mpulse{0%,100%{opacity:.95}50%{opacity:.5}}
@keyframes exv-dash{to{stroke-dashoffset:-60}}
@keyframes exv-imp{0%{transform:scale(.25);opacity:0}10%{opacity:1}38%,100%{transform:scale(1.25);opacity:0}}
@keyframes exv-du{0%{transform:translateY(2px) scale(.4);opacity:.55}70%{opacity:.22}100%{transform:translateY(-10px) scale(1.15);opacity:0}}
/* push-up */
@keyframes exv-pu-body{0%,100%{transform:rotate(0deg)}45%,58%{transform:rotate(-9deg)}}
@keyframes exv-pu-fore{0%,100%{transform:rotate(0deg)}45%,58%{transform:rotate(62deg)}}
@keyframes exv-pu-up{0%,100%{transform:rotate(0deg)}45%,58%{transform:rotate(-109deg)}}
/* squat */
@keyframes exv-sq-shin{0%,100%{transform:rotate(0deg)}45%,58%{transform:rotate(22deg)}}
@keyframes exv-sq-thigh{0%,100%{transform:rotate(0deg)}45%,58%{transform:rotate(-96deg)}}
@keyframes exv-sq-torso{0%,100%{transform:rotate(0deg)}45%,58%{transform:rotate(117deg)}}
@keyframes exv-sq-arm{0%,100%{transform:rotate(0deg)}45%,58%{transform:rotate(-133deg)}}
/* pull-up */
@keyframes exv-pl-body{0%,100%{transform:translateY(0)}22.5%{transform:translateY(-17.5px)}45%,58%{transform:translateY(-35px)}79%{transform:translateY(-17.5px)}}
@keyframes exv-pl-foreL{0%,100%{transform:rotate(0deg)}22.5%{transform:rotate(40deg)}45%,58%{transform:rotate(14.3deg)}79%{transform:rotate(40deg)}}
@keyframes exv-pl-upL{0%,100%{transform:rotate(0deg)}22.5%{transform:rotate(-96.6deg)}45%,58%{transform:rotate(-141.5deg)}79%{transform:rotate(-96.6deg)}}
@keyframes exv-pl-foreR{0%,100%{transform:rotate(0deg)}22.5%{transform:rotate(-40deg)}45%,58%{transform:rotate(-14.3deg)}79%{transform:rotate(-40deg)}}
@keyframes exv-pl-upR{0%,100%{transform:rotate(0deg)}22.5%{transform:rotate(96.6deg)}45%,58%{transform:rotate(141.5deg)}79%{transform:rotate(96.6deg)}}
@keyframes exv-pl-flash{0%,44%,60%,100%{opacity:0}47%,56%{opacity:.95}}
/* plank */
@keyframes exv-pk-bob{from{transform:translateY(0)}to{transform:translateY(-2.5px)}}
@keyframes exv-pk-shim{0%{transform:translateX(0);opacity:0}12%{opacity:.5}88%{opacity:.5}100%{transform:translateX(36px);opacity:0}}
@keyframes exv-pk-tick{0%,32%,100%{opacity:0}8%,22%{opacity:.9}}
/* run */
@keyframes exv-rn-thigh{0%{transform:rotate(-32deg)}25%{transform:rotate(6deg)}50%{transform:rotate(26deg)}75%{transform:rotate(-28deg)}100%{transform:rotate(-32deg)}}
@keyframes exv-rn-shin{0%{transform:rotate(40deg)}25%{transform:rotate(12deg)}50%{transform:rotate(20deg)}65%{transform:rotate(95deg)}75%{transform:rotate(105deg)}100%{transform:rotate(40deg)}}
@keyframes exv-rn-arm{0%,100%{transform:rotate(30deg)}50%{transform:rotate(-38deg)}}
@keyframes exv-rn-bob{from{transform:translateY(0)}to{transform:translateY(-3px)}}
/* seated stretch */
@keyframes exv-st-fold{from{transform:rotate(-2deg)}to{transform:rotate(46deg)}}
@keyframes exv-st-arm{from{transform:rotate(0deg)}to{transform:rotate(-18deg)}}
/* breathe */
@keyframes exv-br-ring{0%{transform:scale(1);stroke:#38bdf8}40%{transform:scale(1.22);stroke:#38bdf8}42%{stroke:#a78bfa}55%{transform:scale(1.22);stroke:#a78bfa}58%{stroke:#93c5fd}96%{stroke:#93c5fd}100%{transform:scale(1);stroke:#38bdf8}}
@keyframes exv-br-ring2{0%{transform:scale(1);stroke:#38bdf8}40%{transform:scale(1.3);stroke:#38bdf8}42%{stroke:#a78bfa}55%{transform:scale(1.3);stroke:#a78bfa}58%{stroke:#93c5fd}96%{stroke:#93c5fd}100%{transform:scale(1);stroke:#38bdf8}}
@keyframes exv-br-torso{0%,100%{transform:scale(1)}40%,55%{transform:scale(1.05)}}
@keyframes exv-br-tin{0%,36%{opacity:1}42%,94%{opacity:0}100%{opacity:1}}
@keyframes exv-br-thold{0%,37%{opacity:0}43%,53%{opacity:1}59%,100%{opacity:0}}
@keyframes exv-br-tex{0%,54%{opacity:0}60%,93%{opacity:1}99%,100%{opacity:0}}
@keyframes exv-br-rise{0%,5%{transform:translateY(0);opacity:0}12%{opacity:.65}38%,100%{transform:translateY(-30px);opacity:0}}
/* punch */
@keyframes exv-px-torso{0%,62%,100%{transform:rotate(0deg)}25%,40%{transform:rotate(7deg)}}
@keyframes exv-px-up{0%,68%,100%{transform:rotate(0deg)}25%,40%{transform:rotate(-40deg)}56%{transform:rotate(3deg)}}
@keyframes exv-px-fore{0%,68%,100%{transform:rotate(0deg)}25%,40%{transform:rotate(112deg)}56%{transform:rotate(-6deg)}}
@keyframes exv-px-hit{0%,20%,50%,100%{opacity:0}27%,42%{opacity:.85}}
@keyframes exv-px-shake{0%,23%,31%,100%{transform:translateX(0)}25%{transform:translateX(1.6px)}28%{transform:translateX(-1.2px)}}
/* biceps curl (generic) */
@keyframes exv-gn-fore{from{transform:rotate(0deg)}to{transform:rotate(-118deg)}}
@keyframes exv-gn-sheen{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes exv-gn-flex{0%,36%,64%,100%{transform:scale(1)}48%,54%{transform:scale(1.3)}}
/* bench press */
@keyframes exv-bn-arm{0%,100%{transform:rotate(0deg)}40%,56%{transform:rotate(38deg)}}
@keyframes exv-bn-elbow{0%,100%{transform:rotate(0deg)}40%,56%{transform:rotate(-58deg)}}
/* overhead press */
@keyframes exv-pr-arm{0%,100%{transform:rotate(0deg)}36%,56%{transform:rotate(-118deg)}}
@keyframes exv-pr-elbow{0%,100%{transform:rotate(0deg)}36%,56%{transform:rotate(96deg)}}
@keyframes exv-pr-knS{0%,28%,72%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(-7deg)}}
@keyframes exv-pr-knT{0%,28%,72%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(6deg)}}
/* romanian deadlift */
@keyframes exv-dl-hinge{0%,100%{transform:rotate(0deg)}40%,58%{transform:rotate(62deg)}}
/* lunge */
@keyframes exv-lg-drop{0%,100%{transform:translateY(0)}42%,58%{transform:translateY(9px)}}
@keyframes exv-lg-ft{0%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(-26deg)}}
@keyframes exv-lg-fs{0%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(38deg)}}
@keyframes exv-lg-rt{0%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(20deg)}}
@keyframes exv-lg-rs{0%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(-34deg)}}
/* glute bridge */
@keyframes exv-gb-lift{0%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(15deg)}}
@keyframes exv-gb-th{0%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(11deg)}}
@keyframes exv-gb-sh{0%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(-9deg)}}
/* jumping jacks */
@keyframes exv-jj-la{0%,50%,100%{transform:rotate(0deg)}25%,75%{transform:rotate(-166deg)}}
@keyframes exv-jj-ra{0%,50%,100%{transform:rotate(0deg)}25%,75%{transform:rotate(166deg)}}
@keyframes exv-jj-ll{0%,50%,100%{transform:rotate(0deg)}25%,75%{transform:rotate(-20deg)}}
@keyframes exv-jj-rl{0%,50%,100%{transform:rotate(0deg)}25%,75%{transform:rotate(20deg)}}
@keyframes exv-jj-jump{0%,50%,100%{transform:translateY(0)}25%,75%{transform:translateY(-7px)}}
/* hollow hold */
@keyframes exv-hb-rock{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}
/* side plank */
@keyframes exv-sp-bob{from{transform:translateY(0)}to{transform:translateY(-3px)}}
/* dip */
@keyframes exv-dp-body{0%,100%{transform:translateY(0)}44%,60%{transform:translateY(16px)}}
@keyframes exv-dp-up{0%,100%{transform:rotate(0deg)}44%,60%{transform:rotate(32deg)}}
@keyframes exv-dp-fore{0%,100%{transform:rotate(0deg)}44%,60%{transform:rotate(-74deg)}}
/* pistol squat */
@keyframes exv-ps-drop{0%,100%{transform:translateY(0)}44%,60%{transform:translateY(12px)}}
@keyframes exv-ps-th{0%,100%{transform:rotate(0deg)}44%,60%{transform:rotate(28deg)}}
@keyframes exv-ps-sh{0%,100%{transform:rotate(0deg)}44%,60%{transform:rotate(-24deg)}}
@keyframes exv-ps-torso{0%,100%{transform:rotate(0deg)}44%,60%{transform:rotate(10deg)}}
/* lat pulldown */
@keyframes exv-pd-pull{0%,100%{transform:translateY(0)}40%,58%{transform:translateY(26px)}}
/* seated row */
@keyframes exv-rw-torso{0%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(14deg)}}
@keyframes exv-rw-fore{0%,100%{transform:rotate(0deg)}42%,58%{transform:rotate(-78deg)}}
@keyframes exv-rw-cab{0%,100%{opacity:1}42%,58%{opacity:.12}}
/* band pull-apart */
@keyframes exv-pa-la{0%,100%{transform:rotate(0deg)}44%,60%{transform:rotate(-15deg)}}
@keyframes exv-pa-ra{0%,100%{transform:rotate(0deg)}44%,60%{transform:rotate(15deg)}}
@keyframes exv-pa-bA{0%,100%{opacity:1}44%,60%{opacity:0}}
@keyframes exv-pa-bB{0%,100%{opacity:0}44%,60%{opacity:1}}
/* front kick */
@keyframes exv-fk-th{0%,54%,100%{transform:rotate(0deg)}62%,80%{transform:rotate(8deg)}}
@keyframes exv-fk-sh{0%,54%{transform:rotate(0deg)}62%,80%{transform:rotate(-95deg)}90%{transform:rotate(-18deg)}100%{transform:rotate(0deg)}}
/* knee strike */
@keyframes exv-kn-th{0%,100%{transform:rotate(0deg)}32%,58%{transform:rotate(-92deg)}}
@keyframes exv-kn-sh{0%,100%{transform:rotate(0deg)}32%,58%{transform:rotate(70deg)}}
@keyframes exv-kn-ar{0%,100%{transform:rotate(0deg)}32%,58%{transform:rotate(36deg)}}
/* slip */
@keyframes exv-sl-weave{0%,100%{transform:translateX(-12px) rotate(-5deg)}50%{transform:translateX(12px) rotate(5deg)}}
@keyframes exv-sl-jab{from{transform:translateX(-120px);opacity:0}12%{opacity:.8}82%{opacity:.8}to{transform:translateX(180px);opacity:0}}
/* footwork */
@keyframes exv-fw-hop{from{transform:translateY(0)}to{transform:translateY(-4px)}}
@keyframes exv-fw-sl{from{transform:translateX(-5px)}to{transform:translateX(5px)}}
/* crunch */
@keyframes exv-cr-crunch{0%,100%{transform:rotate(0deg)}34%,55%{transform:rotate(-40deg)}}
/* burpee */
@keyframes exv-bp-y{0%{transform:translateY(0)}18%{transform:translateY(13px)}30%,45%{transform:translateY(20px)}55%{transform:translateY(13px)}68%{transform:translateY(0)}76%,88%{transform:translateY(-13px)}100%{transform:translateY(0)}}
@keyframes exv-bp-torso{0%{transform:rotate(0deg)}18%{transform:rotate(38deg)}30%,45%{transform:rotate(78deg)}55%{transform:rotate(38deg)}68%,100%{transform:rotate(0deg)}}
@keyframes exv-bp-legs{0%,20%{transform:translateX(0)}28%,46%{transform:translateX(24px)}54%,100%{transform:translateX(0)}}
@keyframes exv-bp-arms{0%,66%{transform:rotate(0deg)}74%,86%{transform:rotate(-160deg)}94%,100%{transform:rotate(0deg)}}
/* jump rope */
@keyframes exv-rp-hop{from{transform:translateY(0)}to{transform:translateY(-6px)}}
@keyframes exv-rp-e1{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.28)}}
@keyframes exv-rp-sweep{from{transform:translateX(-34px)}to{transform:translateX(34px)}}
@keyframes exv-rp-wrist{to{transform:rotate(360deg)}}
/* cat-cow */
@keyframes exv-cc-cat{0%,100%{opacity:1}45%,55%{opacity:0}}
@keyframes exv-cc-cow{0%,100%{opacity:0}45%,55%{opacity:1}}
/* child's pose */
@keyframes exv-ch-bob{from{transform:translateY(0)}to{transform:translateY(-1.6px)}}
@keyframes exv-ch-aura{from{transform:scale(.95);opacity:.5}to{transform:scale(1.06);opacity:.85}}
/* downward dog */
@keyframes exv-dd-pedal{0%,45%,100%{transform:rotate(0deg)}62%{transform:rotate(-12deg)}}
/* pigeon */
@keyframes exv-pg-sink{from{transform:translateY(0)}to{transform:translateY(2.2px)}}
/* thread the needle */
@keyframes exv-tt-arm{0%,28%{transform:rotate(0deg)}44%,64%{transform:rotate(74deg)}84%,100%{transform:rotate(0deg)}}
@keyframes exv-tt-dip{0%,28%{transform:rotate(0deg)}44%,64%{transform:rotate(-4deg)}84%,100%{transform:rotate(0deg)}}
/* warrior II */
@keyframes exv-wr-sway{from{transform:rotate(-1.4deg)}to{transform:rotate(1.4deg)}}
/* standing forward fold */
@keyframes exv-fd-hinge{0%,100%{transform:rotate(0deg)}42%,60%{transform:rotate(76deg)}}
/* guard stance */
@keyframes exv-gd-bounce{from{transform:translateY(0)}to{transform:translateY(-2px)}}
@keyframes exv-gd-ping{0%{transform:scale(.35);opacity:.75}75%,100%{transform:scale(1);opacity:0}}
@media (prefers-reduced-motion: reduce){.exv-scene *{animation:none!important}}
`

/** Standard hologram viewport wrapper; injects the shared keyframes once per scene. */
export function Scene({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 220 150" className="exv-scene h-full w-full" role="img" aria-label={label}>
      <style>{KEYFRAMES}</style>
      <defs>
        <linearGradient id="exvMus" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  )
}
