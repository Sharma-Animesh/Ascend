import { Burst, COL, Dust, FIG_GLOW, Ground, HD, Jt, Limb, Mus, Scene, Shadow, TOR } from './shared'

/**
 * Cardio, combat and lower-body demo scenes.
 */

/** Side-view run cycle with afterimage ghost trail and foot-strike dust. */
export function RunScene() {
  const leg = 'exv-rn-thigh 0.8s linear infinite'
  const shin = 'exv-rn-shin 0.8s linear infinite'
  const arm = 'exv-rn-arm 0.8s ease-in-out infinite'
  const half = ' -0.4s'
  return (
    <Scene label="Running demonstration — quads and calves">
      <Ground />
      {[58, 76, 94].map((y, i) => (
        <line
          key={y}
          x1={22}
          y1={y}
          x2={52}
          y2={y}
          stroke="rgba(125,211,252,0.35)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="14 46"
          style={{ animation: 'exv-dash 0.9s linear infinite', animationDelay: `${i * 0.15}s` }}
        />
      ))}
      <Shadow cx={110} rx={42} />
      <Dust pts={[[100, 131], [116, 131]]} anim="exv-du 0.8s ease-out infinite" stag={0.4} />
      <g style={{ animation: 'exv-rn-bob 0.4s ease-in-out infinite alternate' }}>
        <g style={FIG_GLOW} transform="rotate(7 110 88)">
          {/* ghost afterimage of the near leg */}
          <g opacity={0.22}>
            <Jt x={108} y={82} anim={leg + ' -.08s'}>
              <Limb d="M108 82 L108 106" w={10.5} c="far" />
              <Jt x={108} y={106} anim={shin + ' -.08s'}>
                <Limb d="M108 106 L108 128" w={9} c="far" />
                <Limb d="M108 128 L116 130" w={6.5} c="far" />
              </Jt>
            </Jt>
          </g>
          <Jt x={111} y={54} anim={arm + half}>
            <Limb d="M111 54 L108 72" w={7.5} c="far" />
            <Limb d="M108 72 L120 67" w={6.5} c="far" />
            <circle cx="121.5" cy="66.5" r="2.8" fill={COL.far} />
          </Jt>
          <Jt x={104} y={82} anim={leg}>
            <Limb d="M104 82 L104 106" w={10} c="far" />
            <Jt x={104} y={106} anim={shin}>
              <Limb d="M104 106 L104 128" w={8.5} c="far" />
              <Limb d="M104 128 L112 130" w={6} c="far" />
            </Jt>
          </Jt>
          <Limb d="M108 82 L112 68" w={13} c="cap" />
          <Limb d="M112 68 L116 52" w={14} c="cap" />
          <Limb d="M116.5 51 L118.5 46.5" w={7} />
          <circle cx="120" cy="42.5" r="7" {...HD} />
          <Jt x={108} y={82} anim={leg + half}>
            <Limb d="M108 82 L108 106" w={10.5} />
            <Mus cx={110} cy={94} rx={3.4} ry={8} />
            <Jt x={108} y={106} anim={shin + half}>
              <Limb d="M108 106 L108 128" w={9} c="lb2" />
              <Limb d="M108 128 L116 130" w={6.5} c="lb2" />
              <Mus cx={106} cy={114.5} rx={2.8} ry={6} />
            </Jt>
          </Jt>
          <Jt x={117} y={54} anim={arm}>
            <Limb d="M117 54 L114 72" w={8} />
            <Limb d="M114 72 L127 67" w={7} c="lb2" />
            <circle cx="128.5" cy="66.5" r="3" fill={COL.lb2} />
          </Jt>
        </g>
      </g>
    </Scene>
  )
}

/** Front-view jumping jacks: arms clap overhead while legs bound apart. */
export function JacksScene() {
  const cyc = '.9s ease-in-out infinite'
  return (
    <Scene label="Jumping jacks demonstration — full body cardio">
      <Shadow cx={110} rx={40} />
      {/* overhead clap sparkle */}
      <g stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity={0} style={{ animation: `exv-px-hit ${cyc} linear` }}>
        <line x1="110" y1="9" x2="110" y2="19" />
        <line x1="105" y1="14" x2="115" y2="14" />
      </g>
      <Dust pts={[[96, 131], [124, 131]]} anim="exv-du .9s ease-out infinite" stag={0.45} />
      <g style={{ ...FIG_GLOW, animation: `exv-jj-jump ${cyc}` }}>
        <circle cx="110" cy="34" r="7" {...HD} />
        <Limb d="M110 41 L110 45" w={6} />
        <path d="M96 46 Q110 41 124 46 L120 80 Q110 84 100 80 Z" {...TOR} />
        <Limb d="M103 82 L117 82" w={8} c="cap" />
        {/* left limbs */}
        <Jt x={96} y={50} anim={`exv-jj-la ${cyc}`}>
          <Limb d="M96 50 L88 68" w={7.5} />
          <Limb d="M88 68 L84 84" w={6.5} c="lb2" />
          <circle cx="83" cy="86" r="3" {...HD} />
        </Jt>
        <Jt x={104} y={82} anim={`exv-jj-ll ${cyc}`}>
          <Limb d="M104 82 L101 104" w={8.5} />
          <Limb d="M101 104 L99 126" w={7.5} c="lb2" />
          <Limb d="M97 127 L105 128" w={4.5} c="lb2" />
        </Jt>
        {/* right limbs */}
        <Jt x={124} y={50} anim={`exv-jj-ra ${cyc}`}>
          <Limb d="M124 50 L132 68" w={7.5} />
          <Limb d="M132 68 L136 84" w={6.5} c="lb2" />
          <circle cx="137" cy="86" r="3" {...HD} />
        </Jt>
        <Jt x={116} y={82} anim={`exv-jj-rl ${cyc}`}>
          <Limb d="M116 82 L119 104" w={8.5} />
          <Limb d="M119 104 L121 126" w={7.5} c="lb2" />
          <Limb d="M115 128 L123 127" w={4.5} c="lb2" />
        </Jt>
      </g>
    </Scene>
  )
}

/** Front-view jump rope: fast hops, spinning wrists, phase-offset rope loops. */
export function RopeScene() {
  return (
    <Scene label="Jump rope demonstration — calves and endurance">
      {/* ground sweep shadow */}
      <line x1="76" y1="131" x2="98" y2="131" stroke="rgba(56,189,248,.3)" strokeWidth="2" strokeLinecap="round" style={{ transformOrigin: '110px 131px', animation: 'exv-rp-sweep .52s ease-in-out infinite alternate' }} />
      {/* rope loops */}
      <ellipse cx="110" cy="86" rx="46" ry="42" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5 7" opacity=".5" style={{ transformOrigin: '110px 86px', animation: 'exv-rp-e1 .52s ease-in-out infinite' }} />
      <ellipse cx="110" cy="86" rx="46" ry="42" fill="none" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="5 7" opacity=".35" style={{ transformOrigin: '110px 86px', animation: 'exv-rp-e1 .52s ease-in-out infinite -.26s' }} />
      <g style={{ ...FIG_GLOW, animation: 'exv-rp-hop .52s ease-in-out infinite alternate' }}>
        <circle cx="110" cy="40" r="7" {...HD} />
        <path d="M100 48 Q110 44 120 48 L118 78 Q110 81 102 78 Z" {...TOR} />
        {/* arms with spinning wrists */}
        <Limb d="M98 58 L92 74" w={7} />
        <Limb d="M122 58 L128 74" w={7} />
        <Limb d="M92 74 L90 85" w={6} c="lb2" />
        <Limb d="M128 74 L130 85" w={6} c="lb2" />
        <g style={{ transformOrigin: '90px 86px', animation: 'exv-rp-wrist .52s linear infinite' }}>
          <Limb d="M90 86 L95 90" w={3.5} />
        </g>
        <g style={{ transformOrigin: '130px 86px', animation: 'exv-rp-wrist .52s linear infinite' }}>
          <Limb d="M130 86 L135 82" w={3.5} />
        </g>
        <circle cx="90" cy="86" r="3" fill={COL.lb2} />
        <circle cx="130" cy="86" r="3" fill={COL.lb2} />
        {/* legs together */}
        <Limb d="M105 82 L103 112" w={8.5} />
        <Limb d="M115 82 L117 112" w={8.5} />
        <Limb d="M103 112 L102 127" w={7.5} c="lb2" />
        <Limb d="M117 112 L118 127" w={7.5} c="lb2" />
        <Limb d="M99 128 L107 128" w={4.5} c="lb2" />
        <Limb d="M113 128 L121 128" w={4.5} c="lb2" />
        <Mus cx={104} cy={118} rx={2.6} ry={5} />
        <Mus cx={116} cy={118} rx={2.6} ry={5} />
      </g>
    </Scene>
  )
}

/** Multi-phase burpee: crouch → plank thrust → jump with arms overhead. */
export function BurpeeScene() {
  const cyc = '2.4s ease-in-out infinite'
  return (
    <Scene label="Burpee demonstration — full body conditioning">
      <Ground />
      <Shadow cx={110} rx={46} />
      <Dust pts={[[92, 131], [128, 131]]} anim="exv-du 2.4s ease-out infinite" stag={1.44} />
      <g style={{ animation: `exv-bp-y ${cyc}` }}>
        <g style={FIG_GLOW}>
          {/* legs shoot back into the plank */}
          <g style={{ animation: `exv-bp-legs ${cyc}` }}>
            <Limb d="M106 88 L110 110" w={10} />
            <Limb d="M110 110 L108 128" w={8.5} c="lb2" />
            <Limb d="M104 129 L114 129" w={5} c="lb2" />
            <Mus cx={109} cy={99} rx={3.4} ry={8} rot={-8} />
          </g>
          {/* torso hinges from upright to plank-flat */}
          <Jt x={108} y={88} anim={`exv-bp-torso ${cyc}`}>
            <Limb d="M108 87 L104 62" w={13} c="cap" />
            <circle cx="103" cy="55" r="7" {...HD} />
            <Jt x={105} y={64} anim={`exv-bp-arms ${cyc}`}>
              <Limb d="M105 64 L112 78" w={7.5} />
              <Limb d="M112 78 L118 92" w={6.5} c="lb2" />
              <circle cx="119" cy="94" r="3" {...HD} />
            </Jt>
          </Jt>
        </g>
      </g>
    </Scene>
  )
}

/** Side-view boxing jab-cross with impact burst and recoil shake. */
export function PunchScene() {
  const cyc = '1.1s ease-in-out infinite'
  return (
    <Scene label="Striking demonstration — shoulders, arms and core">
      <Ground />
      <Shadow cx={106} rx={42} />
      <g style={{ animation: 'exv-px-hit 1.1s linear infinite' }} stroke="rgba(125,211,252,0.8)" strokeWidth="2" strokeLinecap="round">
        <line x1="152" y1="48" x2="160" y2="44" />
        <line x1="155" y1="56" x2="164" y2="56" />
        <line x1="152" y1="64" x2="160" y2="68" />
      </g>
      <g style={{ animation: 'exv-px-shake 1.1s linear infinite' }}>
        <g style={FIG_GLOW}>
          <Limb d="M78 130 L92 130" w={6} c="lb2" />
          <Limb d="M122 130 L136 130" w={6} c="lb2" />
          <Limb d="M101 88 L93 109" w={10.5} />
          <Limb d="M93 109 L85.5 128" w={9} c="lb2" />
          <Limb d="M101 88 L115 109" w={10.5} />
          <Limb d="M115 109 L127.5 128" w={9} c="lb2" />
          <Jt x={101} y={88} anim={`exv-px-torso ${cyc}`}>
            <Limb d="M101 88 L103 76" w={14} c="cap" />
            <Limb d="M103 76 L107 58" w={15} c="cap" />
            <Limb d="M107.8 57 L109.3 52.5" w={7} />
            <circle cx="110.5" cy="48" r="7" {...HD} />
            <Limb d="M106 60 L117 71" w={8} />
            <Limb d="M117 71 L113.5 56" w={7} c="lb2" />
            <circle cx="113" cy="53.5" r="3.4" fill={COL.lb2} />
            <Jt x={107} y={59} anim={`exv-px-up ${cyc}`}>
              <Limb d="M107 59 L119 68" w={8.5} />
              <Mus cx={109.5} cy={60} rx={4.8} ry={3.8} />
              <Mus cx={114} cy={64.5} rx={6} ry={2.8} rot={37} />
              <Jt x={119} y={68} anim={`exv-px-fore ${cyc}`}>
                <Limb d="M119 68 L123 54" w={7.5} c="lb2" />
                <circle cx="124" cy="51.5" r="3.8" {...HD} />
              </Jt>
            </Jt>
          </Jt>
        </g>
      </g>
      <Burst x={150} y={52} anim="exv-imp 1.1s linear infinite .28s" />
    </Scene>
  )
}

/** Front kick: chamber → snap extension into a pad, then retract. */
export function KickScene() {
  const cyc = '1.3s ease-in-out infinite'
  return (
    <Scene label="Front kick demonstration — hips and quads">
      {/* target pad */}
      <circle cx="152" cy="72" r="9" fill="rgba(167,139,250,.12)" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="152" y1="81" x2="152" y2="130" stroke="rgba(167,139,250,.35)" strokeWidth="3" strokeLinecap="round" />
      <Ground />
      <Shadow cx={104} rx={38} />
      <Burst x={146} y={73} anim={`exv-imp ${cyc} .82s`} c="rgba(196,181,253,.9)" />
      <g style={FIG_GLOW}>
        {/* support leg */}
        <Limb d="M84 129 L96 129" w={5} c="lb2" />
        <Limb d="M88 128 L94 108" w={8.5} c="lb2" />
        <Limb d="M94 108 L102 88" w={10} />
        {/* kicking chain: chambered thigh, snapping shin */}
        <Jt x={104} y={86} anim={`exv-fk-th ${cyc}`}>
          <Limb d="M104 86 L122 80" w={9.5} />
          <Jt x={122} y={80} anim={`exv-fk-sh ${cyc}`}>
            <Limb d="M122 80 L119 93" w={7.5} c="lb2" />
            <circle cx="118" cy="95" r="3" fill={COL.lb2} />
          </Jt>
        </Jt>
        {/* leaning torso + guard hands */}
        <Limb d="M102 86 L98 62" w={12.5} c="cap" />
        <circle cx="97" cy="55" r="7" {...HD} />
        <Limb d="M100 64 L112 70" w={7} />
        <Limb d="M112 70 L107 81" w={6} c="lb2" />
        <circle cx="106" cy="83" r="3" fill={COL.lb2} />
        <Limb d="M102 66 L113 75" w={6} c="far" />
        <Mus cx={104} cy={94} rx={3.2} ry={7} rot={-12} />
      </g>
    </Scene>
  )
}

/** Knee strike: hip drives the knee skyward while the arms pull down. */
export function KneeScene() {
  const cyc = '1.15s ease-in-out infinite'
  return (
    <Scene label="Knee strike demonstration — hip flexors and core">
      <Ground />
      <Shadow cx={102} rx={36} />
      <g style={{ ...FIG_GLOW, animation: 'exv-gd-bounce .58s ease-in-out infinite alternate' }}>
        {/* support leg */}
        <Limb d="M84 129 L96 129" w={5} c="lb2" />
        <Limb d="M88 128 L94 108" w={8.5} c="lb2" />
        <Limb d="M94 108 L102 88" w={10} />
        {/* driving knee */}
        <Jt x={104} y={86} anim={`exv-kn-th ${cyc}`}>
          <Limb d="M104 86 L112 106" w={10} />
          <Jt x={112} y={106} anim={`exv-kn-sh ${cyc}`}>
            <Limb d="M112 106 L110 125" w={8} c="lb2" />
            <circle cx="109" cy="127" r="3" fill={COL.lb2} />
          </Jt>
        </Jt>
        {/* torso + pulling arms */}
        <Limb d="M102 85 L100 61" w={12.5} c="cap" />
        <circle cx="99" cy="54" r="7" {...HD} />
        <Jt x={101} y={63} anim={`exv-kn-ar ${cyc}`}>
          <Limb d="M101 63 L112 70" w={7.5} />
          <Limb d="M112 70 L108 82" w={6} c="lb2" />
          <circle cx="107" cy="84" r="3" fill={COL.lb2} />
        </Jt>
        <Limb d="M100 65 L111 73" w={6} c="far" />
        <Mus cx={106} cy={92} rx={3.6} ry={6} rot={-30} />
      </g>
    </Scene>
  )
}

/** Defensive slip: head and guard weave off the incoming line. */
export function SlipScene() {
  return (
    <Scene label="Slip drill demonstration — reaction and footwork">
      <Ground />
      <Shadow cx={108} rx={36} />
      {/* incoming strike that misses */}
      <line x1="26" y1="44" x2="70" y2="44" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 6" opacity={0} style={{ animation: 'exv-sl-jab 1.4s linear infinite' }} />
      {/* whoosh arc above the head path */}
      <path d="M92 26 Q110 18 128 26" fill="none" stroke="rgba(125,211,252,.3)" strokeWidth="1.5" strokeDasharray="4 6" style={{ animation: 'exv-dash 1.4s linear infinite' }} />
      <g style={{ ...FIG_GLOW, animation: 'exv-sl-weave 1.4s ease-in-out infinite', transformOrigin: '110px 84px' }}>
        <circle cx="110" cy="36" r="7" {...HD} />
        <path d="M98 46 Q110 42 122 46 L119 78 Q110 82 101 78 Z" {...TOR} />
        {/* high guard */}
        <Limb d="M100 60 L92 48" w={7} />
        <circle cx="91" cy="45" r="3.5" {...HD} />
        <Limb d="M120 60 L128 48" w={7} />
        <circle cx="129" cy="45" r="3.5" {...HD} />
        <Mus cx={104} cy={62} rx={3} ry={5} rot={-14} />
        <Mus cx={116} cy={62} rx={3} ry={5} rot={14} />
      </g>
      {/* static base legs */}
      <g style={FIG_GLOW}>
        <Limb d="M100 128 L106 84" w={9} c="lb2" />
        <Limb d="M120 128 L114 84" w={9} c="lb2" />
        <Limb d="M94 129 L106 129" w={5} c="lb2" />
        <Limb d="M114 129 L126 129" w={5} c="lb2" />
      </g>
    </Scene>
  )
}

/** Footwork drill: rapid shuffle steps with alternating dust kicks. */
export function FootworkScene() {
  return (
    <Scene label="Footwork drill demonstration — agility">
      <Ground />
      <Shadow cx={106} rx={40} />
      <Dust pts={[[92, 131], [120, 131]]} anim="exv-du .85s ease-out infinite" stag={0.425} />
      <g style={{ ...FIG_GLOW, animation: 'exv-fw-hop .42s ease-in-out infinite alternate' }}>
        {/* scissoring legs */}
        <g style={{ transformOrigin: '105px 89px', animation: 'exv-fw-sl .85s ease-in-out infinite alternate' }}>
          <Limb d="M98 108 L105 89" w={9.5} />
          <Limb d="M92 128 L98 108" w={8.5} />
          <Limb d="M88 129 L98 129" w={5} />
        </g>
        <g style={{ transformOrigin: '105px 89px', animation: 'exv-fw-sl .85s ease-in-out infinite alternate -.425s' }}>
          <Limb d="M112 108 L105 89" w={9.5} c="far" />
          <Limb d="M116 128 L112 108" w={8.5} c="far" />
          <Limb d="M112 129 L122 129" w={5} c="far" />
        </g>
        {/* light upper body */}
        <Limb d="M104 88 L102 62" w={12} c="cap" />
        <circle cx="101" cy="55" r="7" {...HD} />
        <Limb d="M103 66 L112 76" w={7} />
        <Limb d="M112 76 L118 86" w={6} c="lb2" />
        <Limb d="M102 67 L110 74" w={5.5} c="far" />
      </g>
    </Scene>
  )
}

/** Guard stance: subtle bounce with an awareness ping around the head. */
export function GuardScene() {
  return (
    <Scene label="Guard stance demonstration — readiness">
      <Ground />
      <Shadow cx={104} rx={36} />
      <circle cx="101" cy="54" r="17" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={0} style={{ transformOrigin: '101px 54px', animation: 'exv-gd-ping 2.6s ease-out infinite' }} />
      <g style={{ ...FIG_GLOW, animation: 'exv-gd-bounce .9s ease-in-out infinite alternate' }}>
        <Limb d="M96 128 L100 110" w={8.5} c="lb2" />
        <Limb d="M100 110 L104 90" w={9.5} />
        <Limb d="M116 128 L112 108" w={8.5} c="far" />
        <Limb d="M112 108 L106 89" w={9.5} c="far" />
        <Limb d="M92 129 L104 129" w={5} c="lb2" />
        <Limb d="M112 129 L122 129" w={5} c="far" />
        <Limb d="M104 88 L102 66" w={12.5} c="cap" />
        <circle cx="101" cy="59" r="7" {...HD} />
        {/* high fists */}
        <Limb d="M102 68 L112 61" w={7} />
        <circle cx="114" cy="59" r="3.5" {...HD} />
        <Limb d="M100 70 L110 65" w={6} c="far" />
        <circle cx="112" cy="63" r="3" fill={COL.far} />
      </g>
    </Scene>
  )
}

/** Ab crunch: shoulders peel up toward the knees; abs stripe-glow. */
export function CrunchScene() {
  return (
    <Scene label="Crunch demonstration — abdominals">
      <Ground />
      <Shadow cx={102} rx={52} />
      <g style={FIG_GLOW}>
        {/* planted lower body */}
        <Limb d="M136 127 L140 130" w={5} c="lb2" />
        <Limb d="M135 126 L124 108" w={8} c="lb2" />
        <Limb d="M124 108 L106 114" w={10} />
        {/* curling torso about the hips */}
        <Jt x={105} y={114} anim="exv-cr-crunch 1.6s ease-in-out infinite">
          <Limb d="M104 112 L72 116" w={13} c="cap" />
          <circle cx="63" cy="117" r="7" {...HD} />
          {/* hands at the temples */}
          <Limb d="M76 112 L86 106" w={6} />
          <circle cx="88" cy="104" r="3" {...HD} />
          {/* ab stripes */}
          <line x1="88" y1="110.5" x2="88" y2="118" stroke="#f97316" strokeWidth="1.6" opacity=".8" style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,.8))', animation: 'exv-mpulse 1.6s ease-in-out infinite' }} />
          <line x1="96" y1="109.5" x2="96" y2="118.5" stroke="#f97316" strokeWidth="1.6" opacity=".8" style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,.8))', animation: 'exv-mpulse 1.6s ease-in-out infinite .3s' }} />
          <Mus cx={92} cy={114} rx={8} ry={4} rot={-6} />
        </Jt>
      </g>
    </Scene>
  )
}

/** Hollow body hold: banana shape rocking on the core. */
export function HollowScene() {
  return (
    <Scene label="Hollow hold demonstration — deep core">
      <Shadow cx={110} rx={44} />
      <ellipse cx="110" cy="124" rx="40" ry="2.6" fill="none" stroke="rgba(125,211,252,.25)" strokeWidth="1" strokeDasharray="3 5" />
      <g style={{ ...FIG_GLOW, transformOrigin: '112px 100px', animation: 'exv-hb-rock 1.9s ease-in-out infinite alternate' }}>
        {/* extended arms past the head */}
        <Limb d="M76 92 L57 83" w={6.5} />
        <circle cx="55" cy="82" r="3" {...HD} />
        <circle cx="71" cy="90" r="7" {...HD} />
        <Limb d="M80 94 L112 102" w={13} c="cap" />
        <Limb d="M115 102 L147 94" w={8.5} />
        <circle cx="150" cy="93" r="2.5" fill={COL.lb2} />
        <Mus cx={99} cy={100} rx={11} ry={4.4} />
        <Mus cx={132} cy={98} rx={4} ry={3} rot={-14} />
      </g>
    </Scene>
  )
}

/** Glute bridge: hips lift to a straight line, glutes fire at the top. */
export function BridgeScene() {
  const cyc = '2.1s ease-in-out infinite'
  return (
    <Scene label="Glute bridge demonstration — glutes and hamstrings">
      <Ground />
      <Shadow cx={104} rx={48} />
      <g style={FIG_GLOW}>
        {/* grounded head/shoulders/arms */}
        <circle cx="63" cy="121" r="7" {...HD} />
        <Limb d="M80 118 L94 115" w={6.5} />
        <Limb d="M94 115 L102 118" w={5.5} c="lb2" />
        {/* lifting chain rotates about the shoulders */}
        <Jt x={76} y={118} anim={`exv-gb-lift ${cyc}`}>
          <Limb d="M76 117 L104 105" w={13} c="cap" />
          <Jt x={106} y={104} anim={`exv-gb-th ${cyc}`}>
            <Limb d="M108 104 L124 111" w={9.5} />
            <Jt x={125} y={112} anim={`exv-gb-sh ${cyc}`}>
              <Limb d="M126 112 L133 126" w={7.5} c="lb2" />
              <Limb d="M133 127 L140 129" w={5} c="lb2" />
            </Jt>
          </Jt>
          <Mus cx={107} cy={103} rx={5} ry={4} />
        </Jt>
      </g>
    </Scene>
  )
}

/** Romanian deadlift: hip hinge with the bar sweeping down the shins. */
export function DeadliftScene() {
  const cyc = '2.2s ease-in-out infinite'
  return (
    <Scene label="Romanian deadlift demonstration — hamstrings and glutes">
      <Ground />
      <Shadow cx={106} rx={34} />
      <g style={FIG_GLOW}>
        {/* planted legs */}
        <Limb d="M96 129 L114 129" w={6} c="lb2" />
        <Limb d="M100 128 L102 108" w={9} c="lb2" />
        <Limb d="M102 107 L103 87" w={11} />
        <Mus cx={102} cy={97} rx={3.6} ry={8.5} rot={-4} />
        {/* hinging upper body carries the bar */}
        <Jt x={103} y={86} anim={`exv-dl-hinge ${cyc}`}>
          <Limb d="M103 85 L107 61" w={13.5} c="cap" />
          <line x1="104" y1="82" x2="106" y2="66" stroke="rgba(125,211,252,.4)" strokeWidth="1.5" strokeLinecap="round" />
          <Limb d="M107 60 L108 54" w={6.5} />
          <circle cx="109" cy="47" r="7" {...HD} />
          <Limb d="M106 63 L105 77" w={8.5} />
          <Limb d="M105 77 L104 88" w={7.5} c="lb2" />
          <circle cx="104" cy="90" r="3.5" {...HD} />
          <line x1="86" y1="91" x2="122" y2="91" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
          <circle cx="85" cy="91" r="6.5" fill="#223c55" stroke="#4d7fb5" strokeWidth="1" />
          <circle cx="123" cy="91" r="6.5" fill="#223c55" stroke="#4d7fb5" strokeWidth="1" />
        </Jt>
      </g>
    </Scene>
  )
}

/** Reverse lunge: rises from the split stance, both knees extending. */
export function LungeScene() {
  const cyc = '2.1s ease-in-out infinite'
  return (
    <Scene label="Reverse lunge demonstration — quads and glutes">
      <Ground />
      <Shadow cx={104} rx={40} />
      <Dust pts={[[80, 131], [126, 131]]} anim="exv-du 2.1s ease-out infinite" stag={1.05} />
      <g style={{ ...FIG_GLOW, animation: `exv-lg-drop ${cyc}` }}>
        {/* front leg (extended at top, folding at the bottom) */}
        <Limb d="M74 129 L86 129" w={5} />
        <Jt x={94} y={106} anim={`exv-lg-fs ${cyc}`}>
          <Limb d="M80 127 L94 106" w={8.5} />
          <Jt x={104} y={86} anim={`exv-lg-ft ${cyc}`}>
            <Limb d="M94 106 L104 86" w={10} />
            <Mus cx={99} cy={96} rx={3.4} ry={8} rot={-20} />
          </Jt>
        </Jt>
        {/* rear leg */}
        <Jt x={105} y={85} anim={`exv-lg-rt ${cyc}`}>
          <Limb d="M105 85 L124 97" w={9.5} c="far" />
          <Jt x={125} y={98} anim={`exv-lg-rs ${cyc}`}>
            <Limb d="M125 98 L129 123" w={8} c="far" />
            <Limb d="M127 126 L134 129" w={5} c="far" />
          </Jt>
        </Jt>
        {/* upright torso + hanging arms */}
        <Limb d="M105 85 L106 60" w={13} c="cap" />
        <circle cx="107" cy="53" r="7" {...HD} />
        <Limb d="M104 62 L100 80" w={7.5} />
        <Limb d="M100 80 L98 96" w={6.5} c="lb2" />
        <circle cx="98" cy="98" r="3" fill={COL.lb2} />
      </g>
    </Scene>
  )
}

/** Pistol squat: single-leg descent with the other leg locked out front. */
export function PistolScene() {
  const cyc = '2.2s ease-in-out infinite'
  return (
    <Scene label="Pistol squat demonstration — single-leg strength">
      <Ground />
      <Shadow cx={104} rx={38} />
      <g style={FIG_GLOW}>
        {/* heel wedge under the working foot */}
        <path d="M90 130 L99 130 L99 123 Z" fill={COL.lb2} opacity=".55" />
        {/* support leg folds beneath */}
        <Jt x={100} y={128} anim={`exv-ps-sh ${cyc}`}>
          <Limb d="M100 128 L106 106" w={9} c="lb2" />
          <Jt x={106} y={106} anim={`exv-ps-th ${cyc}`}>
            <Limb d="M106 106 L102 84" w={10.5} />
            <Mus cx={104} cy={95} rx={3.6} ry={8.5} rot={-6} />
          </Jt>
        </Jt>
        {/* rising mass: torso + locked-out leg + reaching arms */}
        <g style={{ animation: `exv-ps-drop ${cyc}` }}>
          <Jt x={102} y={83} anim={`exv-ps-torso ${cyc}`}>
            <Limb d="M102 83 L98 58" w={13} c="cap" />
            <circle cx="96" cy="51" r="7" {...HD} />
            <Limb d="M100 60 L120 66" w={7.5} />
            <Limb d="M120 66 L132 70" w={6.5} c="lb2" />
            <circle cx="134" cy="71" r="3" fill={COL.lb2} />
          </Jt>
          <Limb d="M102 84 L128 86" w={10} />
          <Limb d="M128 86 L144 84" w={8} c="lb2" />
          <circle cx="147" cy="83" r="2.5" fill={COL.lb2} />
        </g>
      </g>
    </Scene>
  )
}

/** Seated forward fold with breath-synced reach. */
export function StretchScene() {
  return (
    <Scene label="Seated forward fold stretch — hamstrings">
      <Ground />
      <Shadow cx={118} rx={48} />
      <g style={FIG_GLOW}>
        <Limb d="M86 123 L124 121.5" w={11} />
        <Limb d="M124 121.5 L156 124" w={9} c="lb2" />
        <Limb d="M156 124 L159 114.5" w={7} c="lb2" />
        <Mus cx={104} cy={126.5} rx={11} ry={3.2} />
        <Limb d="M86 123 L85 112" w={14} c="cap" />
        <Jt x={85} y={113} anim="exv-st-fold 3s ease-in-out infinite alternate">
          <Limb d="M85 113 L82 84" w={13.5} c="cap" />
          <Limb d="M81.8 84 L81.3 79" w={7} />
          <circle cx="81" cy="74" r="7" {...HD} />
          <Jt x={83} y={89} anim="exv-st-arm 3s ease-in-out infinite alternate">
            <Limb d="M83 89 L96 102" w={7.5} />
            <Limb d="M96 102 L109 111" w={6.5} c="lb2" />
            <circle cx="110.5" cy="112" r="2.6" fill={COL.lb2} />
          </Jt>
        </Jt>
      </g>
    </Scene>
  )
}

/** Guided breathing: expanding rings, phase captions, rising particles. */
export function BreatheScene() {
  const txt = {
    fontFamily: 'Orbitron, sans-serif',
    fontSize: 10,
    letterSpacing: 4,
    textAnchor: 'middle' as const,
  }
  const ring = '10s ease-in-out infinite'
  return (
    <Scene label="Breathing exercise — inhale, hold, exhale">
      {[[-14, 0], [8, 1.2], [-4, 2.2]].map(([dx, d], i) => (
        <circle key={i} cx={110 + dx} cy={104} r={1.6} fill="#7dd3fc" opacity={0} style={{ animation: `exv-br-rise 10s linear infinite ${d}s` }} />
      ))}
      <circle cx="110" cy="84" r="30" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.55" style={{ transformOrigin: '110px 84px', animation: `exv-br-ring ${ring}` }} />
      <circle cx="110" cy="84" r="42" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.3" style={{ transformOrigin: '110px 84px', animation: `exv-br-ring2 ${ring}` }} />
      <ellipse cx="110" cy="123" rx="32" ry="3" fill="rgba(56,189,248,0.10)" />
      <g style={FIG_GLOW}>
        <Limb d="M103 99 L79 110.5" w={10} />
        <Limb d="M117 99 L141 110.5" w={10} />
        <Limb d="M79 110.5 L108 117.5" w={8} c="lb2" />
        <Limb d="M141 110.5 L112 117.5" w={8} c="lb2" />
        <g style={{ transformOrigin: '110px 97px', animation: `exv-br-torso ${ring}` }}>
          <path d="M96.5 66 Q110 60.5 123.5 66 L120.5 96 Q110 100.5 99.5 96 Z" {...TOR} />
          <Limb d="M110 60 L110 64" w={7} />
          <circle cx="110" cy="54.5" r="7.3" {...HD} />
        </g>
        <Limb d="M97.5 68 L89.5 87" w={7.5} />
        <Limb d="M89.5 87 L85.5 107" w={6.5} c="lb2" />
        <circle cx="85" cy="109" r="2.6" fill={COL.lb2} />
        <Limb d="M122.5 68 L130.5 87" w={7.5} />
        <Limb d="M130.5 87 L134.5 107" w={6.5} c="lb2" />
        <circle cx="135" cy="109" r="2.6" fill={COL.lb2} />
      </g>
      <text x="110" y="26" {...txt} fill="#38bdf8" style={{ animation: 'exv-br-tin 10s linear infinite' }}>
        INHALE
      </text>
      <text x="110" y="26" {...txt} fill="#a78bfa" style={{ animation: 'exv-br-thold 10s linear infinite' }}>
        HOLD
      </text>
      <text x="110" y="26" {...txt} fill="#93c5fd" style={{ animation: 'exv-br-tex 10s linear infinite' }}>
        EXHALE
      </text>
    </Scene>
  )
}
