// Awarding XP / stats and keeping streaks. Single entry point so every
// feature page levels the character consistently.
import { supabase } from '../lib/supabase'
import { levelFromXp, POINTS_PER_LEVEL, rankForLevel, TITLE_RULES } from '../lib/game'
import type { StatKey, Stats } from '../lib/types'
import { useAuth } from './auth'
import { useUi } from './ui'

export interface AwardResult {
  xpGained: number
  leveledUp: boolean
  rankedUp: boolean
  newLevel: number
  newRankLabel: string
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)
}

/**
 * Award XP (and optional stat bumps) to the signed-in character.
 * Persists to the database, updates the store, and fires level/rank-up
 * celebrations through the UI store automatically.
 */
export async function awardXp(xpGained: number, statRewards?: Partial<Record<StatKey, number>>): Promise<AwardResult | null> {
  const { character, setCharacter } = useAuth.getState()
  if (!character) return null

  const oldLevel = levelFromXp(character.xp).level
  const newXp = character.xp + Math.max(0, Math.round(xpGained))
  const { level: newLevel } = levelFromXp(newXp)
  const leveledUp = newLevel > oldLevel

  const oldRank = rankForLevel(oldLevel)
  const newRank = rankForLevel(newLevel)
  const rankedUp = newRank.id !== oldRank.id

  const stats: Stats = { ...character.stats }
  if (statRewards) {
    for (const [k, v] of Object.entries(statRewards)) {
      stats[k as StatKey] = (stats[k as StatKey] ?? 0) + (v ?? 0)
    }
  }

  // Streak: increments on the first activity of a new day; a gap of more
  // than 2 days resets it (built-in tolerance = rest days without shame).
  const today = todayStr()
  let { streak, longest_streak } = character
  if (character.last_activity_date !== today) {
    const gap = character.last_activity_date ? daysBetween(character.last_activity_date, today) : Infinity
    streak = gap <= 2 ? streak + 1 : 1
    longest_streak = Math.max(longest_streak, streak)
  }

  const unspent = character.unspent_points + (leveledUp ? (newLevel - oldLevel) * POINTS_PER_LEVEL : 0)

  const titles = [...character.titles]
  for (const rule of TITLE_RULES) {
    if (!titles.includes(rule.title) && rule.check({ level: newLevel, streak, longest_streak })) {
      titles.push(rule.title)
    }
  }

  const patch = {
    xp: newXp,
    level: newLevel,
    rank: newRank.id,
    stats,
    unspent_points: unspent,
    streak,
    longest_streak,
    last_activity_date: today,
    titles,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('character_profiles')
    .update(patch)
    .eq('user_id', character.user_id)
    .select()
    .maybeSingle()
  if (error) throw error
  if (data) setCharacter(data as never)

  const { celebrate } = useUi.getState()
  if (rankedUp) celebrate({ kind: 'rankup', level: newLevel, rankLabel: newRank.label, xpGained })
  else if (leveledUp) celebrate({ kind: 'levelup', level: newLevel, rankLabel: newRank.label, xpGained })

  return { xpGained, leveledUp, rankedUp, newLevel, newRankLabel: newRank.label }
}

/** Spend an unspent stat point on a chosen stat. */
export async function allocateStatPoint(stat: StatKey): Promise<void> {
  const { character, setCharacter } = useAuth.getState()
  if (!character || character.unspent_points <= 0) return
  const stats: Stats = { ...character.stats, [stat]: (character.stats[stat] ?? 0) + 1 }
  const { data, error } = await supabase
    .from('character_profiles')
    .update({ stats, unspent_points: character.unspent_points - 1, updated_at: new Date().toISOString() })
    .eq('user_id', character.user_id)
    .select()
    .maybeSingle()
  if (error) throw error
  if (data) setCharacter(data as never)
}
