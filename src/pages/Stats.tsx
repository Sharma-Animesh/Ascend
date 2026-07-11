import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ChevronDown, Flame, Hexagon, Info, Plus, Sparkles, Trophy, UserCircle2 } from 'lucide-react'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { SystemPanel } from '../components/system/SystemPanel'
import { GlowButton } from '../components/system/GlowButton'
import { XPBar } from '../components/system/XPBar'
import { Emblem } from '../components/system/Emblem'
import { InlineLoader } from '../components/system/Loader'
import { EmptyState } from '../components/system/EmptyState'
import { useAuth } from '../store/auth'
import { allocateStatPoint } from '../store/progress'
import { RANKS, STAT_KEYS, STAT_META, archetypeById, classById, rankById } from '../lib/game'
import type { StatKey } from '../lib/types'
import {
  AXIS_TICK,
  CHART_CYAN,
  CHART_GRID,
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
} from '../components/charts/chartTheme'

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

export default function Stats() {
  const { character, loading } = useAuth()
  const [pendingStat, setPendingStat] = useState<StatKey | null>(null)
  const [allocError, setAllocError] = useState<string | null>(null)
  const [growthOpen, setGrowthOpen] = useState(false)

  if (loading) {
    return (
      <div className="py-16">
        <InlineLoader label="Synchronizing" />
      </div>
    )
  }

  if (!character) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <SystemPanel title="Status Window">
          <EmptyState
            icon={<UserCircle2 size={30} />}
            title="No character detected"
            hint="Complete the Awakening and the System will forge your Hunter profile."
          />
        </SystemPanel>
      </div>
    )
  }

  const cls = classById(character.class)
  const arch = archetypeById(character.archetype)
  const rank = rankById(character.rank)
  const nextRank = RANKS.find((r) => r.minLevel > character.level)
  const rankPct = nextRank
    ? Math.min(1, Math.max(0, (character.level - rank.minLevel) / (nextRank.minLevel - rank.minLevel)))
    : 1

  // Optimistic view: while a point is committing, show it already spent.
  const statValue = (k: StatKey) => (character.stats[k] ?? 0) + (pendingStat === k ? 1 : 0)
  const remaining = Math.max(0, character.unspent_points - (pendingStat ? 1 : 0))
  const radarData = STAT_KEYS.map((k) => ({ stat: k, value: statValue(k) }))
  const radarMax = Math.max(10, ...radarData.map((d) => d.value))
  const totalPower = radarData.reduce((sum, d) => sum + d.value, 0)

  const handleAllocate = async (key: StatKey) => {
    if (character.unspent_points <= 0 || pendingStat) return
    setPendingStat(key)
    setAllocError(null)
    try {
      await allocateStatPoint(key)
    } catch {
      setAllocError('The System could not commit that point. Check your connection and try again.')
    } finally {
      setPendingStat(null)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="font-display text-lg font-black tracking-[0.3em] text-glow-soft uppercase text-glow">
          Status Window
        </h1>
        <p className="mt-0.5 text-sm text-mute">The System's official record of your ascent, Hunter.</p>
      </motion.div>

      {/* ---------- Character header ---------- */}
      <SystemPanel title="Hunter Profile" icon={<UserCircle2 size={13} />}>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {cls && <Emblem id={cls.id} size={56} active />}
                {arch && <Emblem id={arch.id} size={56} active />}
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm font-bold tracking-[0.16em] text-ink uppercase">
                  {cls?.name ?? 'Classless'}
                </div>
                <div className="text-xs font-semibold text-mute">
                  {arch ? `${arch.name} — ${arch.build}` : 'Archetype unassigned'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[0.6rem] font-bold tracking-[0.3em] text-mute uppercase">Lv.</span>
                <span className="font-display text-4xl leading-none font-black text-glow-soft text-glow sm:text-5xl">
                  {character.level}
                </span>
              </div>
              <span
                className="rounded-full border px-2.5 py-1 font-display text-[0.62rem] font-bold tracking-[0.2em] uppercase"
                style={{ borderColor: `${rank.color}66`, color: rank.color, background: `${rank.color}14` }}
              >
                {rank.label}
              </span>
            </div>
          </div>

          <XPBar xp={character.xp} />

          <div>
            <div className="mb-1 flex items-baseline justify-between text-[0.62rem] font-bold tracking-[0.2em] uppercase">
              <span className="text-mute">Rank Progress</span>
              {nextRank ? (
                <span style={{ color: nextRank.color }}>
                  Rank {nextRank.id} at Lv.{nextRank.minLevel}
                </span>
              ) : (
                <span className="text-gold text-glow-gold">Apex rank attained</span>
              )}
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full border border-line/70 bg-abyss">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                style={{ boxShadow: '0 0 10px rgba(167,139,250,0.7)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(3, rankPct * 100)}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-1.5 text-sm font-bold text-orange-300">
              <Flame size={15} />
              {character.streak} day streak
            </span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-mute">
              <Trophy size={14} className="text-gold" />
              Longest {character.longest_streak}
            </span>
          </div>

          {character.titles.length > 0 && (
            <motion.div variants={listVariants} initial="hidden" animate="show" className="flex flex-wrap gap-1.5">
              {character.titles.map((t) => (
                <motion.span
                  key={t}
                  variants={itemVariants}
                  className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 font-display text-[0.58rem] font-bold tracking-[0.18em] text-gold uppercase text-glow-gold"
                >
                  {t}
                </motion.span>
              ))}
            </motion.div>
          )}
        </div>
      </SystemPanel>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* ---------- Stat radar ---------- */}
        <SystemPanel
          title="Stat Radar"
          icon={<Hexagon size={13} />}
          action={
            <span className="font-display text-[0.62rem] font-bold tracking-[0.2em] text-glow-soft uppercase">
              PWR {totalPower}
            </span>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="74%">
              <PolarGrid stroke={CHART_GRID} />
              <PolarAngleAxis dataKey="stat" tick={AXIS_TICK} />
              <PolarRadiusAxis domain={[0, radarMax]} tick={false} axisLine={false} />
              <Radar
                name="Value"
                dataKey="value"
                stroke={CHART_CYAN}
                strokeWidth={2}
                fill="rgba(56,189,248,0.25)"
                dot={{ r: 4, fill: CHART_CYAN, fillOpacity: 1 }}
              />
              <Tooltip
                contentStyle={TOOLTIP_CONTENT_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                labelFormatter={(label) => STAT_META[label as StatKey]?.label ?? String(label)}
                cursor={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </SystemPanel>

        {/* ---------- Stat allocation ---------- */}
        <SystemPanel title="Stat Allocation" icon={<Sparkles size={13} />}>
          <div
            className={`mb-4 flex items-center justify-between gap-3 rounded-md px-3.5 py-2.5 ${
              remaining > 0 ? 'glow-border animate-pulse-glow bg-sky-500/10' : 'border border-line bg-abyss/40'
            }`}
          >
            <span className="font-display text-[0.62rem] font-bold tracking-[0.24em] text-glow-soft uppercase">
              Stat points available:
            </span>
            <span
              className={`font-display text-2xl leading-none font-black ${
                remaining > 0 ? 'text-glow-soft text-glow' : 'text-mute'
              }`}
            >
              {remaining}
            </span>
          </div>

          <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-2">
            {STAT_KEYS.map((k) => {
              const meta = STAT_META[k]
              return (
                <motion.li
                  key={k}
                  variants={itemVariants}
                  className="flex min-h-[52px] items-center gap-3 rounded-md border border-line/60 bg-abyss/40 px-3 py-2"
                >
                  <span
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}90` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="font-display text-[0.66rem] font-bold tracking-[0.18em] uppercase"
                        style={{ color: meta.color }}
                      >
                        {k}
                      </span>
                      <span className="truncate text-sm font-semibold text-ink">{meta.label}</span>
                    </div>
                    <p className="truncate text-xs text-mute">{meta.desc}</p>
                  </div>
                  <span className="w-9 shrink-0 text-right font-display text-xl font-black text-glow-soft">
                    {statValue(k)}
                  </span>
                  {character.unspent_points > 0 && (
                    <GlowButton
                      size="sm"
                      className="h-11 w-11 shrink-0"
                      aria-label={`Increase ${meta.label}`}
                      icon={<Plus size={16} />}
                      onClick={() => void handleAllocate(k)}
                      disabled={pendingStat !== null}
                      loading={pendingStat === k}
                    />
                  )}
                </motion.li>
              )
            })}
          </motion.ul>

          {allocError && <p className="mt-3 text-xs font-semibold text-danger">{allocError}</p>}
        </SystemPanel>
      </div>

      {/* ---------- How stats grow ---------- */}
      <SystemPanel
        title="How Stats Grow"
        icon={<Info size={13} />}
        action={
          <button
            type="button"
            onClick={() => setGrowthOpen((o) => !o)}
            aria-expanded={growthOpen}
            aria-label={growthOpen ? 'Collapse stat guide' : 'Expand stat guide'}
            className="-my-2.5 flex h-11 w-11 items-center justify-center rounded-md text-mute transition hover:text-ink sm:hidden"
          >
            <ChevronDown size={17} className={`transition-transform duration-300 ${growthOpen ? 'rotate-180' : ''}`} />
          </button>
        }
      >
        {!growthOpen && (
          <p className="text-xs text-mute sm:hidden">
            Tap the arrow to see how the System measures each attribute.
          </p>
        )}
        <div className={`${growthOpen ? 'grid' : 'hidden'} grid-cols-1 gap-2.5 sm:grid sm:grid-cols-2`}>
          {STAT_KEYS.map((k) => {
            const meta = STAT_META[k]
            return (
              <div key={k} className="flex items-start gap-2.5 rounded-md border border-line/50 bg-abyss/30 px-3 py-2.5">
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
                />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-ink">{meta.label}</span>
                    <span className="font-display text-[0.58rem] font-bold tracking-[0.2em] text-mute uppercase">{k}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-mute">{meta.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </SystemPanel>
    </div>
  )
}
