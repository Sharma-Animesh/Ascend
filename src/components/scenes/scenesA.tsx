import { Burst, COL, Dust, FIG_GLOW, Ground, HD, Jt, Limb, Mus, Scene, Shadow, TOR } from './shared'

/**
 * Upper-body + core demo scenes. All share the 220×150 hologram viewport.
 * Geometry follows the original capsule-limb figures; polish layers
 * (impact bursts, dust puffs, trails) are added per scene.
 */

/** Side-view push-up: pivots at the toes, arm chain flexes; dust on the descent. */
export function PushupScene() {
  const cyc = '1.8s ease-in-out infinite'
  return (
    <Scene label="Push-up demonstration — chest and triceps">
      <Ground />
      <Shadow cx={112} rx={66} />
      <Dust pts={[[62, 131], [73, 131]]} anim="exv-du 1.8s ease-out infinite .82s" />
      <g style={FIG_GLOW}>
        {/* far arm */}
        <Jt x={72} y={130} anim={`exv-pu-fore ${cyc}`}>
          <Limb d="M72 130 L73 111" w={8} c="far" />
          <Jt x={73} y={111} anim={`exv-pu-up ${cyc}`}>
            <Limb d="M73 111 L74 93" w={9} c="far" />
          </Jt>
        </Jt>
        {/* body plank, pivoting at the toes */}
        <Jt x={166} y={128} anim={`exv-pu-body ${cyc}`}>
          <Limb d="M64 92 L92 97.5" w={15} c="cap" />
          <Limb d="M92 97.5 L118 103" w={12} c="cap" />
          <Limb d="M55 90.5 L61 91.5" w={7} />
          <circle cx="48.5" cy="89.5" r="7" {...HD} />
          <Limb d="M118 103 L140 112" w={10.5} />
          <Limb d="M140 112 L160 122" w={9} c="lb2" />
          <Limb d="M160 122 L167 129" w={7} c="lb2" />
          <Mus cx={71} cy={99.5} rx={9.5} ry={5} rot={11} />
        </Jt>
        {/* near arm — rooted at the planted hand */}
        <Jt x={62} y={130} anim={`exv-pu-fore ${cyc}`}>
          <Limb d="M62 130 L63 111" w={8.5} c="lb2" />
          <Jt x={63} y={111} anim={`exv-pu-up ${cyc}`}>
            <Limb d="M63 111 L64 92" w={9.5} />
            <circle cx="64" cy="92" r="5" {...HD} />
            <Mus cx={66} cy={102} rx={3.2} ry={7} rot={-4} />
          </Jt>
        </Jt>
      </g>
      <Burst x={100} y={122} anim="exv-imp 1.8s linear infinite .84s" c="rgba(125,211,252,.7)" />
    </Scene>
  )
}

/** Side-view squat: kinematic chain from the planted foot; dust on the drive. */
export function SquatScene() {
  const cyc = '2s ease-in-out infinite'
  return (
    <Scene label="Squat demonstration — quads and glutes">
      <Ground />
      <Shadow cx={116} rx={32} />
      <ellipse cx="112" cy="124" rx="21" ry="3" fill="none" stroke="rgba(125,211,252,.35)" strokeWidth="1" strokeDasharray="3 4" style={{ animation: 'exv-mpulse 2s ease-in-out infinite' }} />
      <Dust pts={[[104, 131], [124, 131]]} anim="exv-du 2s ease-out infinite 1.18s" />
      <g style={FIG_GLOW}>
        {/* far leg */}
        <Limb d="M106 129.5 L125 129.5" w={6} c="far" />
        <Jt x={113} y={128} anim={`exv-sq-shin ${cyc}`}>
          <Limb d="M113 128 L111 105" w={9} c="far" />
          <Jt x={111} y={105} anim={`exv-sq-thigh ${cyc}`}>
            <Limb d="M111 105 L107 80" w={10.5} c="far" />
          </Jt>
        </Jt>
        {/* near foot stays planted */}
        <Limb d="M111 129.5 L131 129.5" w={6} c="lb2" />
        <Jt x={118} y={128} anim={`exv-sq-shin ${cyc}`}>
          <Limb d="M118 128 L116 105" w={9.5} c="lb2" />
          <Jt x={116} y={105} anim={`exv-sq-thigh ${cyc}`}>
            <Limb d="M116 105 L112 80" w={11} />
            <Mus cx={116.5} cy={91} rx={3.6} ry={8.5} rot={-9} />
            <Mus cx={106.5} cy={82} rx={4.5} ry={3.6} />
            <Jt x={112} y={80} anim={`exv-sq-torso ${cyc}`}>
              <Limb d="M112 80 L110 65" w={14} c="cap" />
              <Limb d="M110 65 L108 53" w={15} c="cap" />
              <Limb d="M108.3 53 L109 47.5" w={7} />
              <circle cx="109.5" cy="43" r="7" {...HD} />
              <Jt x={108} y={55} anim={`exv-sq-arm ${cyc}`}>
                <Limb d="M108 55 L110.5 70" w={8} />
                <Limb d="M110.5 70 L109.5 84" w={7} c="lb2" />
                <circle cx="109.5" cy="86" r="2.6" fill={COL.lb2} />
              </Jt>
            </Jt>
          </Jt>
        </Jt>
      </g>
    </Scene>
  )
}

/** Front-view pull-up: hands fixed on the bar; flash cue at chin-over-bar. */
export function PullScene() {
  const cyc = '1.8s ease-in-out infinite'
  return (
    <Scene label="Pull-up demonstration — lats and biceps">
      <line x1="30" y1="132" x2="190" y2="132" stroke="rgba(56,189,248,0.25)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M62 24 L58 132" stroke="rgba(125,211,252,0.45)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M158 24 L162 132" stroke="rgba(125,211,252,0.45)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <line x1="60" y1="24" x2="160" y2="24" stroke="rgba(125,211,252,0.75)" strokeWidth="4" strokeLinecap="round" />
      {/* kip trail */}
      <path d="M78 70 Q110 118 142 70" fill="none" stroke="rgba(125,211,252,.28)" strokeWidth="2" strokeDasharray="6 10" style={{ animation: 'exv-dash 2.4s linear infinite' }} />
      <line x1="100" y1="14" x2="120" y2="14" stroke="#7dd3fc" strokeWidth="2.4" strokeLinecap="round" style={{ animation: `exv-pl-flash ${cyc}` }} opacity={0} />
      <g style={FIG_GLOW}>
        <g style={{ animation: `exv-pl-body ${cyc}` }}>
          <circle cx="110" cy="53.5" r="7" {...HD} />
          <Limb d="M110 59 L110 63" w={7} />
          <path d="M96 62 Q110 56.5 124 62 L119.5 93 Q110 97.5 100.5 93 Z" {...TOR} />
          <circle cx="95.5" cy="64" r="5.2" {...HD} />
          <circle cx="124.5" cy="64" r="5.2" {...HD} />
          <Mus cx={99.5} cy={77} rx={3.4} ry={7.5} rot={-10} />
          <Mus cx={120.5} cy={77} rx={3.4} ry={7.5} rot={10} />
          <Limb d="M104 95 L116 95" w={9} c="cap" />
          <Limb d="M106 97 L104 113" w={9.5} />
          <Limb d="M104 113 L107.5 127" w={8.5} c="lb2" />
          <Limb d="M114 97 L115.5 113" w={9.5} />
          <Limb d="M115.5 113 L112 127" w={8.5} c="lb2" />
          <Limb d="M107.5 127 L110.5 130.5" w={6} c="lb2" />
          <Limb d="M112 127 L109 130.5" w={6} c="lb2" />
        </g>
        <Jt x={88} y={26} anim={`exv-pl-foreL ${cyc}`}>
          <Limb d="M88 26 L88.9 45.5" w={8} c="lb2" />
          <Jt x={88.9} y={45.5} anim={`exv-pl-upL ${cyc}`}>
            <Limb d="M88.9 45.5 L95 64" w={9} />
            <circle cx="95" cy="64" r="4.5" {...HD} />
            <Mus cx={91.5} cy={55} rx={3} ry={6.5} rot={18} />
          </Jt>
        </Jt>
        <circle cx="88" cy="25" r="3.8" {...HD} />
        <Jt x={132} y={26} anim={`exv-pl-foreR ${cyc}`}>
          <Limb d="M132 26 L131.1 45.5" w={8} c="lb2" />
          <Jt x={131.1} y={45.5} anim={`exv-pl-upR ${cyc}`}>
            <Limb d="M131.1 45.5 L125 64" w={9} />
            <circle cx="125" cy="64" r="4.5" {...HD} />
            <Mus cx={128.5} cy={55} rx={3} ry={6.5} rot={-18} />
          </Jt>
        </Jt>
        <circle cx="132" cy="25" r="3.8" {...HD} />
      </g>
    </Scene>
  )
}

/** Side-view plank: breathing bob, core shimmer wave, hold timer ticks. */
export function PlankScene() {
  return (
    <Scene label="Plank hold demonstration — core">
      <Ground />
      <Shadow cx={104} rx={64} />
      {[40, 52].map((y, i) => (
        <circle key={y} cx="201" cy={y} r="1.8" fill="#7dd3fc" opacity={0} style={{ animation: `exv-pk-tick 1.5s linear infinite ${i * 0.3}s` }} />
      ))}
      <ellipse cx="76" cy="104" rx="6" ry="2.4" fill="#7dd3fc" opacity={0} style={{ animation: 'exv-pk-shim 2.6s linear infinite' }} />
      <g style={{ ...FIG_GLOW, animation: 'exv-pk-bob 2.6s ease-in-out infinite alternate' }}>
        <Limb d="M50 121 L68 119" w={7} c="far" />
        <Limb d="M68 119 L71 99" w={8} c="far" />
        <Limb d="M122 108.5 L144 116.5" w={9.5} c="far" />
        <Limb d="M144 116.5 L163 126" w={8} c="far" />
        <Limb d="M63 97 L92 102" w={15} c="cap" />
        <Limb d="M92 102 L118 107" w={12} c="cap" />
        <Limb d="M56 95 L61.5 96.5" w={7} />
        <circle cx="50" cy="93" r="7" {...HD} />
        <Limb d="M118 107 L141 115" w={10.5} />
        <Limb d="M141 115 L161 124.5" w={9} c="lb2" />
        <Limb d="M161 124.5 L167 130" w={7} c="lb2" />
        <Limb d="M40 121.5 L60 119.5" w={8} c="lb2" />
        <Limb d="M60 119.5 L63 98" w={9} />
        <circle cx="39" cy="121.5" r="3.2" fill={COL.lb2} />
        <Mus cx={96} cy={105.5} rx={11} ry={5} rot={9} />
      </g>
    </Scene>
  )
}

/** Side-view side plank: stacked feet, top arm on hip, oblique glow. */
export function SideplankScene() {
  return (
    <Scene label="Side plank demonstration — obliques">
      <Ground />
      <Shadow cx={110} rx={56} />
      <g style={{ ...FIG_GLOW, animation: 'exv-sp-bob 2.6s ease-in-out infinite alternate' }}>
        {/* stacked feet */}
        <Limb d="M158 111 L165 113" w={5} c="far" />
        <Limb d="M128 101 L157 111" w={9} c="lb2" />
        <Limb d="M157 115 L164 118" w={5} />
        {/* support arm: forearm flat, elbow under shoulder */}
        <Limb d="M78 131 L94 131" w={7} />
        <Limb d="M86 130 L88 108" w={8} />
        {/* body line */}
        <Limb d="M90 106 L124 101" w={12} c="cap" />
        <circle cx="84" cy="95" r="7" {...HD} />
        {/* top arm on hip */}
        <Limb d="M92 104 L112 99" w={7} />
        <circle cx="114" cy="98" r="3" fill={COL.lb2} />
        <Mus cx={108} cy={103} rx={8} ry={3.4} rot={-8} />
      </g>
    </Scene>
  )
}

/** Front-view parallel-bar dip: body sinks between fixed grips. */
export function DipScene() {
  const cyc = '2s ease-in-out infinite'
  return (
    <Scene label="Dip demonstration — triceps and chest">
      <line x1="64" y1="34" x2="64" y2="132" stroke="rgba(125,211,252,.4)" strokeWidth="3" strokeLinecap="round" />
      <line x1="156" y1="34" x2="156" y2="132" stroke="rgba(125,211,252,.4)" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="44" x2="150" y2="44" stroke="rgba(125,211,252,.7)" strokeWidth="4" strokeLinecap="round" />
      <Shadow cx={110} rx={44} />
      {/* fixed arms rooted at the grips */}
      <g style={FIG_GLOW}>
        <Limb d="M84 46 L89 62" w={8} />
        <Limb d="M89 62 L96 80" w={7} c="lb2" />
        <circle cx="90" cy="66" r="3" fill={COL.lb2} />
        <Limb d="M136 46 L131 62" w={8} />
        <Limb d="M131 62 L124 80" w={7} c="lb2" />
        <circle cx="130" cy="66" r="3" fill={COL.lb2} />
        <Mus cx={90} cy={70} rx={2.8} ry={6} rot={14} />
        <Mus cx={130} cy={70} rx={2.8} ry={6} rot={-14} />
        <circle cx="84" cy="44" r="4" {...HD} />
        <circle cx="136" cy="44" r="4" {...HD} />
        {/* rising/falling body */}
        <g style={{ animation: `exv-dp-body ${cyc}` }}>
          <circle cx="110" cy="52" r="7" {...HD} />
          <path d="M98 60 Q110 56 122 60 L119 84 Q110 88 101 84 Z" {...TOR} />
          <Limb d="M103 86 L101 104" w={9} />
          <Limb d="M117 86 L119 104" w={9} />
          <Limb d="M101 104 L107 118" w={8} c="lb2" />
          <Limb d="M119 104 L113 118" w={8} c="lb2" />
          <circle cx="107" cy="120" r="3" fill={COL.lb2} />
          <circle cx="113" cy="120" r="3" fill={COL.lb2} />
          <Mus cx={104} cy={72} rx={3.4} ry={7} rot={-8} />
          <Mus cx={116} cy={72} rx={3.4} ry={7} rot={8} />
        </g>
      </g>
    </Scene>
  )
}

/** Side-view bench press: supine on the pad, bar arcs to the chest and back. */
export function BenchScene() {
  const cyc = '1.9s ease-in-out infinite'
  const bar = (
    <>
      <line x1="58" y1="47" x2="90" y2="47" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
      <circle cx="57" cy="47" r="5.5" fill="#223c55" stroke="#4d7fb5" strokeWidth="1" />
      <circle cx="91" cy="47" r="5.5" fill="#223c55" stroke="#4d7fb5" strokeWidth="1" />
    </>
  )
  return (
    <Scene label="Bench press demonstration — chest and triceps">
      <line x1="38" y1="48" x2="38" y2="131" stroke="rgba(125,211,252,.35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="38" y1="56" x2="46" y2="56" stroke="rgba(125,211,252,.35)" strokeWidth="3" strokeLinecap="round" />
      <rect x="44" y="96" width="106" height="7" rx="3.5" {...TOR} />
      <Limb d="M54 103 L52 130" w={5} c="far" />
      <Limb d="M140 103 L142 130" w={5} c="far" />
      <Shadow cx={100} rx={60} />
      <g style={FIG_GLOW}>
        {/* far arm + bar behind the body */}
        <Limb d="M74 89 L77 69" w={7.5} c="far" />
        <Jt x={77} y={68} anim={`exv-bn-elbow ${cyc}`}>
          <Limb d="M77 68 L78 51" w={6.5} c="far" />
          {bar}
        </Jt>
        {/* body supine on the pad */}
        <circle cx="56" cy="90" r="7" {...HD} />
        <Limb d="M64 92 L116 96" w={13.5} c="cap" />
        <Limb d="M119 97 L136 111" w={10} />
        <Limb d="M137 112 L149 126" w={8} c="lb2" />
        <Limb d="M149 127 L155 130" w={5} c="lb2" />
        <Mus cx={84} cy={98} rx={9} ry={4.4} rot={7} />
        {/* near arm carries the visible bar */}
        <Jt x={70} y={89} anim={`exv-bn-arm ${cyc}`}>
          <Limb d="M70 89 L72 67" w={8.5} />
          <Jt x={72} y={66} anim={`exv-bn-elbow ${cyc}`}>
            <Limb d="M72 66 L73 49" w={8} />
            <circle cx="73" cy="47" r="4" {...HD} />
            {bar}
          </Jt>
        </Jt>
      </g>
    </Scene>
  )
}

/** Side-view overhead press: bar drives from the rack to lockout; knees dip. */
export function PressScene() {
  const cyc = '2s ease-in-out infinite'
  return (
    <Scene label="Overhead press demonstration — shoulders">
      <Ground />
      <Shadow cx={108} rx={30} />
      <g style={FIG_GLOW}>
        {/* far leg */}
        <Limb d="M112 128 L113 109" w={8} c="far" />
        <Limb d="M113 109 L111 88" w={9} c="far" />
        {/* near leg with knee dip */}
        <Jt x={105} y={107} anim={`exv-pr-knS ${cyc}`}>
          <Limb d="M104 128 L105 108" w={9} c="lb2" />
        </Jt>
        <Jt x={107} y={86} anim={`exv-pr-knT ${cyc}`}>
          <Limb d="M105 107 L107 87" w={11} />
        </Jt>
        <Limb d="M100 129 L116 129" w={6} c="lb2" />
        {/* torso + head */}
        <Limb d="M107 85 L110 60" w={13.5} c="cap" />
        <Limb d="M110 59 L111 53" w={6.5} />
        <circle cx="112" cy="46" r="7" {...HD} />
        <Mus cx={110} cy={59} rx={3.2} ry={5} />
        {/* pressing arm chain + barbell */}
        <Jt x={109} y={57} anim={`exv-pr-arm ${cyc}`}>
          <Limb d="M109 57 L113 37" w={9} />
          <Jt x={113} y={36} anim={`exv-pr-elbow ${cyc}`}>
            <Limb d="M113 36 L114 19" w={8} />
            <circle cx="114" cy="17" r="4" {...HD} />
            <line x1="98" y1="16" x2="130" y2="16" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
            <circle cx="97" cy="16" r="4.8" fill="#223c55" stroke="#4d7fb5" strokeWidth="1" />
            <circle cx="131" cy="16" r="4.8" fill="#223c55" stroke="#4d7fb5" strokeWidth="1" />
          </Jt>
        </Jt>
      </g>
    </Scene>
  )
}

/** Front-view lat pulldown: wide bar pulls from overhead to the chest. */
export function PulldownScene() {
  const cyc = '1.9s ease-in-out infinite'
  return (
    <Scene label="Lat pulldown demonstration — lats">
      <line x1="60" y1="18" x2="160" y2="18" stroke="rgba(125,211,252,.3)" strokeWidth="2" strokeDasharray="8 8" style={{ animation: 'exv-dash 3s linear infinite' }} />
      <Shadow cx={110} rx={40} />
      <g style={FIG_GLOW}>
        {/* kneeling shins */}
        <Limb d="M96 129 L124 129" w={8} c="lb2" />
        {/* torso */}
        <path d="M98 68 Q110 63 122 68 L118 112 Q110 116 102 112 Z" {...TOR} />
        <circle cx="110" cy="58" r="7" {...HD} />
        {/* pulling unit: arms + bar travel together */}
        <g style={{ animation: `exv-pd-pull ${cyc}` }}>
          <Limb d="M98 64 L100 46" w={8} />
          <Limb d="M122 64 L120 46" w={8} />
          <Limb d="M100 46 L100 29" w={7} c="lb2" />
          <Limb d="M120 46 L120 29" w={7} c="lb2" />
          <circle cx="100" cy="28" r="4" {...HD} />
          <circle cx="120" cy="28" r="4" {...HD} />
          <line x1="84" y1="27" x2="136" y2="27" stroke="#7dd3fc" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="83" cy="27" r="2.5" fill="#7dd3fc" />
          <circle cx="137" cy="27" r="2.5" fill="#7dd3fc" />
        </g>
        <Mus cx={101} cy={74} rx={3.4} ry={6} rot={-12} />
        <Mus cx={119} cy={74} rx={3.4} ry={6} rot={12} />
      </g>
    </Scene>
  )
}

/** Side-view seated cable row: torso leans back as the handle comes to the ribs. */
export function RowScene() {
  const cyc = '2s ease-in-out infinite'
  return (
    <Scene label="Seated row demonstration — lats and mid-back">
      <rect x="148" y="118" width="44" height="10" rx="2" fill="rgba(56,189,248,.08)" stroke="rgba(56,189,248,.25)" strokeWidth="1" />
      <Shadow cx={110} rx={52} />
      <g style={FIG_GLOW}>
        {/* braced legs */}
        <circle cx="150" cy="121" r="3" fill={COL.lb2} />
        <Limb d="M150 120 L134 112" w={8} c="lb2" />
        <Limb d="M133 112 L112 114" w={10} />
        {/* leaning torso */}
        <Jt x={111} y={114} anim={`exv-rw-torso ${cyc}`}>
          <Limb d="M111 113 L103 84" w={13} c="cap" />
          <circle cx="101" cy="77" r="7" {...HD} />
          {/* reaching arm; forearm curls the handle home */}
          <Limb d="M104 86 L122 94" w={8} />
          <Jt x={123} y={95} anim={`exv-rw-fore ${cyc}`}>
            <Limb d="M123 95 L141 99" w={7} c="lb2" />
            <circle cx="143" cy="100" r="4" {...HD} />
            <line x1="138" y1="100" x2="148" y2="100" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
          </Jt>
        </Jt>
        {/* cable to the machine */}
        <line
          x1="146"
          y1="100"
          x2="206"
          y2="92"
          stroke="rgba(125,211,252,.55)"
          strokeWidth="2"
          strokeDasharray="4 4"
          style={{ animation: `exv-rw-cab ${cyc}, exv-dash 1.4s linear infinite` }}
        />
        <Mus cx={106} cy={94} rx={3.4} ry={5.4} rot={18} />
      </g>
    </Scene>
  )
}

/** Front-view band pull-apart: straight arms open; slack band snaps taut. */
export function PullApartScene() {
  const cyc = '2.2s ease-in-out infinite'
  return (
    <Scene label="Band pull-apart demonstration — rear delts and upper back">
      <Shadow cx={110} rx={34} />
      <ellipse cx="110" cy="86" rx="26" ry="46" fill="rgba(167,139,250,.07)" />
      <g style={FIG_GLOW}>
        <circle cx="110" cy="32" r="7" {...HD} />
        <path d="M98 42 Q110 38 122 42 L119 74 Q110 78 101 74 Z" {...TOR} />
        <Limb d="M103 76 L117 76" w={8} c="cap" />
        {/* bands cross-fade between slack curve and taut line */}
        <path d="M84 59 Q110 72 136 59" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" style={{ animation: `exv-pa-bA ${cyc}` }} />
        <line x1="76" y1="55" x2="144" y2="55" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" style={{ animation: `exv-pa-bB ${cyc}` }} opacity={0} />
        <Jt x={96} y={50} anim={`exv-pa-la ${cyc}`}>
          <Limb d="M96 50 L84 59" w={7.5} />
          <circle cx="83" cy="59" r="3.5" {...HD} />
        </Jt>
        <Jt x={124} y={50} anim={`exv-pa-ra ${cyc}`}>
          <Limb d="M124 50 L136 59" w={7.5} />
          <circle cx="137" cy="59" r="3.5" {...HD} />
        </Jt>
        <Mus cx={99} cy={52} rx={3} ry={3} />
        <Mus cx={121} cy={52} rx={3} ry={3} />
      </g>
    </Scene>
  )
}

/** Standing biceps curl with dumbbell and peak-contraction flex pop. */
export function CurlScene() {
  const curl = 'exv-gn-fore 2s ease-in-out infinite alternate'
  return (
    <Scene label="Biceps curl demonstration — biceps and forearms">
      <Ground />
      <Shadow cx={102} rx={30} />
      <ellipse cx="102" cy="86" rx="27" ry="50" fill="rgba(56,189,248,0.09)" style={{ animation: 'exv-gn-sheen 3s ease-in-out infinite' }} />
      <g style={{ filter: 'drop-shadow(0 0 6px rgba(125,211,252,0.55))' }}>
        <Limb d="M88 130 L104 130" w={6} c="far" />
        <Limb d="M95 86 L96 109" w={10} c="far" />
        <Limb d="M96 109 L95 129" w={8.5} c="far" />
        <Limb d="M97 58 L96 77" w={7.5} c="far" />
        <Jt x={96} y={77} anim={curl}>
          <Limb d="M96 77 L99 94" w={6.5} c="far" />
          <circle cx="99.5" cy="95.5" r="4" fill={COL.far} />
          {/* far-hand dumbbell */}
          <line x1="92" y1="99" x2="107" y2="92" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" opacity=".85" />
          <circle cx="91" cy="99.5" r="2.6" fill="#223c55" stroke="#4d7fb5" />
          <circle cx="108" cy="91.5" r="2.6" fill="#223c55" stroke="#4d7fb5" />
        </Jt>
        <Limb d="M96 130 L111 130" w={6} c="lb2" />
        <Limb d="M99 86 L100 109" w={10.5} />
        <Limb d="M100 109 L99 129" w={9} c="lb2" />
        <Limb d="M99 86 L100 72" w={13.5} c="cap" />
        <Limb d="M100 72 L102 55" w={15} c="cap" />
        <Limb d="M102.8 54 L103.8 49.5" w={7} />
        <circle cx="105" cy="45" r="7" {...HD} />
        <Limb d="M105 58 L111 77" w={8.5} />
        {/* peak-contraction flex pop on the working biceps */}
        <ellipse cx="105" cy="65" rx="4" ry="6" fill="url(#exvMus)" opacity=".8" style={{ transformOrigin: '105px 65px', animation: 'exv-gn-flex 2s ease-in-out infinite', filter: 'drop-shadow(0 0 6px rgba(249,115,22,.8))' }} />
        <Jt x={111} y={77} anim={curl}>
          <Limb d="M111 77 L113.5 95" w={7.5} c="lb2" />
          <circle cx="114" cy="96.5" r="4.6" fill="#223c55" stroke="#4d7fb5" strokeWidth="1" />
          <circle cx="114" cy="96.5" r="1.6" fill="#4d7fb5" />
        </Jt>
      </g>
    </Scene>
  )
}
