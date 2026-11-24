import { COL, FIG_GLOW, Ground, HD, Jt, Limb, Mus, Scene, Shadow, TOR } from './shared'

/**
 * Mobility / yoga demo scenes — slower, calmer loops.
 */

/** Cat-Cow: spinal arch and sag cross-fade while the head follows. */
export function CatcowScene() {
  return (
    <Scene label="Cat-cow demonstration — spinal mobility">
      <Ground />
      <Shadow cx={100} rx={46} />
      <g style={FIG_GLOW}>
        {/* shared base: arms, thighs, shins */}
        <Limb d="M74 127 L78 108" w={8} c="lb2" />
        <Limb d="M70 128 L80 129" w={5} />
        <Limb d="M116 127 L112 108" w={10} />
        <Limb d="M118 128 L132 129" w={7} c="lb2" />
        {/* CAT: rounded spine, head dropped */}
        <g style={{ animation: 'exv-cc-cat 3.6s ease-in-out infinite' }}>
          <path d="M112 108 Q95 94 78 108" fill="none" stroke={COL.cap} strokeWidth="9" strokeLinecap="round" />
          <circle cx="72" cy="114" r="6.5" {...HD} />
          <circle cx="96" cy="99" r="1.4" fill="#f97316" opacity=".85" style={{ filter: 'drop-shadow(0 0 3px rgba(249,115,22,.8))' }} />
        </g>
        {/* COW: sagging spine, head lifted */}
        <g style={{ animation: 'exv-cc-cow 3.6s ease-in-out infinite' }}>
          <path d="M112 108 Q95 120 78 108" fill="none" stroke={COL.cap} strokeWidth="9" strokeLinecap="round" />
          <circle cx="71" cy="100" r="6.5" {...HD} />
          <circle cx="95" cy="116" r="1.4" fill="#f97316" opacity=".85" style={{ filter: 'drop-shadow(0 0 3px rgba(249,115,22,.8))' }} />
        </g>
      </g>
    </Scene>
  )
}

/** Child's pose: folded rest with a slow breathing aura. */
export function ChildScene() {
  return (
    <Scene label="Child's pose demonstration — rest and recovery">
      <Ground />
      <Shadow cx={76} rx={44} />
      <ellipse cx="82" cy="106" rx="30" ry="22" fill="rgba(56,189,248,.06)" style={{ transformOrigin: '82px 110px', animation: 'exv-ch-aura 3.6s ease-in-out infinite alternate' }} />
      <g style={{ ...FIG_GLOW, animation: 'exv-ch-bob 3.6s ease-in-out infinite alternate' }}>
        {/* folded legs */}
        <Limb d="M108 120 L112 128" w={9} />
        <Limb d="M112 128 L96 129" w={8} c="lb2" />
        {/* folded torso + resting head */}
        <Limb d="M104 119 L76 115" w={13} c="cap" />
        <circle cx="67" cy="113" r="6.5" {...HD} />
        {/* arms stretched ahead */}
        <Limb d="M74 113 L52 122" w={6.5} />
        <Limb d="M52 122 L44 127" w={5.5} c="lb2" />
        <circle cx="42" cy="128" r="2.5" fill={COL.lb2} />
      </g>
    </Scene>
  )
}

/** Downward dog: inverted V with pedaling heels. */
export function DowndogScene() {
  return (
    <Scene label="Downward dog demonstration — shoulders and hamstrings">
      <Ground />
      <Shadow cx={110} rx={52} />
      <g style={FIG_GLOW}>
        {/* hands planted */}
        <Limb d="M62 129 L74 129" w={5} c="lb2" />
        <Limb d="M68 126 L84 96" w={10} c="lb2" />
        <circle cx="79" cy="104" r="6" {...HD} />
        {/* torso line to the apex */}
        <Limb d="M84 96 L108 72" w={13} c="cap" />
        {/* legs with pedaling calves */}
        <Limb d="M108 72 L136 98" w={11} />
        <Jt x={137} y={99} anim="exv-dd-pedal 1.8s ease-in-out infinite">
          <Limb d="M138 99 L146 121" w={9} c="lb2" />
          <circle cx="148" cy="124" r="3" fill={COL.lb2} />
        </Jt>
        <Jt x={134} y={97} anim="exv-dd-pedal 1.8s ease-in-out infinite -.9s">
          <Limb d="M133 98 L140 119" w={8} c="far" />
          <circle cx="142" cy="122" r="3" fill={COL.far} />
        </Jt>
        <Mus cx={122} cy={86} rx={4} ry={7} rot={40} />
        <Mus cx={87} cy={94} rx={4} ry={4.5} />
      </g>
    </Scene>
  )
}

/** Pigeon pose: front leg folded, rear leg extended, hips melting. */
export function PigeonScene() {
  return (
    <Scene label="Pigeon pose demonstration — hip opener">
      <Ground />
      <Shadow cx={112} rx={50} />
      <g style={{ ...FIG_GLOW, animation: 'exv-pg-sink 3.2s ease-in-out infinite alternate' }}>
        {/* front leg folded under */}
        <Limb d="M100 106 L82 116" w={10} />
        <Limb d="M82 116 L98 126" w={8} c="lb2" />
        {/* rear leg extended back */}
        <Limb d="M103 107 L134 115" w={9} c="far" />
        <Limb d="M134 115 L156 122" w={8} c="lb2" />
        <Limb d="M156 123 L162 126" w={4.5} c="lb2" />
        {/* upright torso propped on straight arms */}
        <Limb d="M100 105 L96 80" w={13} c="cap" />
        <circle cx="95" cy="73" r="7" {...HD} />
        <Limb d="M96 82 L88 118" w={7} />
        <circle cx="87" cy="120" r="3" {...HD} />
        <Limb d="M98 84 L92 116" w={6} c="far" />
        <Mus cx={99} cy={107} rx={5} ry={4} />
      </g>
    </Scene>
  )
}

/** Thread the needle: reaching arm sweeps under the chest; shoulder dips. */
export function ThreadScene() {
  const cyc = '2.8s ease-in-out infinite'
  return (
    <Scene label="Thread the needle demonstration — shoulder mobility">
      <Ground />
      <Shadow cx={100} rx={46} />
      <g style={FIG_GLOW}>
        {/* kneeling base */}
        <Limb d="M74 127 L78 108" w={8} c="lb2" />
        <Limb d="M70 128 L80 129" w={5} />
        <Limb d="M116 127 L112 108" w={10} />
        <Limb d="M118 128 L132 129" w={7} c="lb2" />
        {/* upper body dips as the arm threads */}
        <g style={{ transformOrigin: '95px 108px', animation: `exv-tt-dip ${cyc}` }}>
          <path d="M112 108 Q95 105 78 108" fill="none" stroke={COL.cap} strokeWidth="9" strokeLinecap="round" />
          <circle cx="72" cy="104" r="6.5" {...HD} />
          {/* support arm */}
          <Limb d="M78 109 L74 127" w={7.5} />
          {/* threading arm sweeps under */}
          <Jt x={78} y={108} anim={`exv-tt-arm ${cyc}`}>
            <Limb d="M78 108 L90 96" w={7.5} />
            <circle cx="92" cy="94" r="3" {...HD} />
          </Jt>
          <Mus cx={88} cy={104} rx={4.5} ry={3.4} />
        </g>
      </g>
    </Scene>
  )
}

/** Warrior II: grounded wide stance, energy flowing out through both arms. */
export function WarriorScene() {
  return (
    <Scene label="Warrior II demonstration — legs and shoulder endurance">
      <Ground />
      <Shadow cx={110} rx={54} />
      <ellipse cx="84" cy="130" rx="14" ry="1.8" fill="rgba(56,189,248,.12)" />
      <ellipse cx="136" cy="130" rx="14" ry="1.8" fill="rgba(56,189,248,.12)" />
      <g style={{ ...FIG_GLOW, transformOrigin: '110px 127px', animation: 'exv-wr-sway 4.2s ease-in-out infinite alternate' }}>
        {/* left leg straight */}
        <Limb d="M104 82 L84 108" w={9.5} />
        <Limb d="M84 108 L83 127" w={8} c="lb2" />
        <Limb d="M77 128 L89 128" w={4.5} c="lb2" />
        {/* right knee bent over the ankle */}
        <Limb d="M116 82 L134 100" w={10} />
        <Limb d="M134 100 L135 126" w={8.5} c="lb2" />
        <Limb d="M129 128 L141 128" w={4.5} c="lb2" />
        {/* torso + focused gaze */}
        <path d="M98 62 Q110 58 122 62 L119 82 Q110 86 101 82 Z" {...TOR} />
        <circle cx="110" cy="52" r="7" {...HD} />
        <circle cx="113" cy="51" r="1.1" fill="#bfeaff" style={{ filter: 'drop-shadow(0 0 2px #38bdf8)' }} />
        {/* T arms with flowing energy */}
        <Limb d="M96 60 L66 56" w={7} />
        <Limb d="M124 60 L154 56" w={7} />
        <line x1="94" y1="59" x2="68" y2="55.5" stroke="#7dd3fc" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 6" style={{ animation: 'exv-dash 1.6s linear infinite' }} />
        <line x1="126" y1="59" x2="152" y2="55.5" stroke="#7dd3fc" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 6" style={{ animation: 'exv-dash 1.6s linear infinite' }} />
        <circle cx="64" cy="55" r="3" {...HD} />
        <circle cx="156" cy="55" r="3" {...HD} />
        <Mus cx={124} cy={91} rx={3.8} ry={7} rot={-38} />
      </g>
    </Scene>
  )
}

/** Standing forward fold: slow hinge down to hanging, then roll up. */
export function FoldstandScene() {
  return (
    <Scene label="Standing forward fold demonstration — hamstrings and back">
      <Ground />
      <Shadow cx={107} rx={28} />
      <g style={FIG_GLOW}>
        {/* standing legs */}
        <Limb d="M100 129 L114 129" w={6} c="lb2" />
        <Limb d="M102 128 L103 108" w={9} c="lb2" />
        <Limb d="M103 107 L105 88" w={11} />
        <Mus cx={104} cy={98} rx={3.4} ry={8} rot={-4} />
        {/* hinging upper body */}
        <Jt x={106} y={88} anim="exv-fd-hinge 4.5s ease-in-out infinite alternate">
          <Limb d="M106 87 L104 62" w={13.5} c="cap" />
          <Limb d="M104 61 L104 55" w={6.5} />
          <circle cx="104" cy="48" r="7" {...HD} />
          <Limb d="M105 63 L107 80" w={7.5} />
          <Limb d="M107 80 L108 96" w={6.5} c="lb2" />
          <circle cx="108" cy="98" r="3" fill={COL.lb2} />
        </Jt>
      </g>
    </Scene>
  )
}
