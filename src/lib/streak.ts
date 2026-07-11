// Streak Grove math: how the tree grows with the streak and how it fades
// when the Hunter is away. Pure functions — the visual lives in
// components/StreakTree.tsx.
import type { CharacterProfile } from './types'

export type TreeHealth = 'healthy' | 'thirsty' | 'withered' | 'dormant'

export interface GroveState {
  health: TreeHealth
  /** Streak to display (0 once the tree has withered). */
  streak: number
  /** 0..1 — size of the main tree. */
  growth: number
  /** Trees in the grove (1..4). Extra trees join at 100, 150, 200. */
  trees: number
  stageName: string
  message: string
  daysSinceActivity: number | null
  /** Next milestone streak and its label, if any. */
  nextMilestone: { at: number; label: string } | null
}

export const GROVE_MILESTONES: Array<{ at: number; label: string }> = [
  { at: 7, label: 'Young Tree' },
  { at: 21, label: 'Flourishing Tree' },
  { at: 51, label: 'Grand Tree' },
  { at: 100, label: 'Sacred Grove — second tree' },
  { at: 150, label: 'Third tree joins' },
  { at: 200, label: 'Fourth tree joins' },
]

export function stageName(streak: number): string {
  if (streak <= 0) return 'Seed'
  if (streak < 7) return 'Sapling'
  if (streak < 21) return 'Young Tree'
  if (streak < 51) return 'Flourishing Tree'
  if (streak < 100) return 'Grand Tree'
  return 'Sacred Grove'
}

/**
 * Whole days between the last activity date (YYYY-MM-DD) and today.
 * Uses UTC date strings to match how awardXp/quests record activity days.
 */
export function daysSinceActivity(lastActivityDate: string | null): number | null {
  if (!lastActivityDate) return null
  const utcDay = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))
  const then = utcDay(lastActivityDate)
  if (Number.isNaN(then)) return null
  const today = utcDay(new Date().toISOString().slice(0, 10))
  return Math.round((today - then) / 86_400_000)
}

/**
 * The streak number to DISPLAY anywhere in the UI. The database value only
 * resets lazily on the next awardXp, so once the grace window has passed the
 * stored streak is stale — show 0, matching the withered grove.
 */
export function effectiveStreak(
  character: Pick<CharacterProfile, 'streak' | 'last_activity_date'>,
): number {
  const ds = daysSinceActivity(character.last_activity_date)
  if (ds === null || ds > 2) return 0
  return Math.max(0, character.streak)
}

function growthFor(streak: number): number {
  // sqrt easing: visible growth early, giant by 100.
  return Math.sqrt(Math.min(1, Math.max(0, streak) / 100))
}

function treesFor(streak: number): number {
  if (streak < 100) return 1
  return Math.min(4, 2 + Math.floor((streak - 100) / 50))
}

export function groveState(
  character: Pick<CharacterProfile, 'streak' | 'last_activity_date'>,
): GroveState {
  const ds = daysSinceActivity(character.last_activity_date)
  const raw = Math.max(0, character.streak)

  const milestoneAfter = (s: number) => GROVE_MILESTONES.find((m) => m.at > s) ?? null

  // Never trained yet.
  if (ds === null || raw === 0) {
    return {
      health: 'dormant',
      streak: 0,
      growth: 0,
      trees: 1,
      stageName: 'Seed',
      message: 'Complete a quest today to plant your sapling.',
      daysSinceActivity: ds,
      nextMilestone: milestoneAfter(0),
    }
  }

  // Beyond the 2-day grace window: the tree has withered; the next quest replants.
  if (ds > 2) {
    return {
      health: 'withered',
      streak: 0,
      growth: growthFor(raw),
      trees: treesFor(raw),
      stageName: 'Withered',
      message: `Your ${stageName(raw).toLowerCase()} has withered after ${ds} days away. Complete a quest to plant a new sapling — the forest remembers what you grew once.`,
      daysSinceActivity: ds,
      nextMilestone: milestoneAfter(0),
    }
  }

  // Missed yesterday (grace day): the leaves turn gold.
  if (ds === 2) {
    return {
      health: 'thirsty',
      streak: raw,
      growth: growthFor(raw),
      trees: treesFor(raw),
      stageName: stageName(raw),
      message: 'The leaves are turning gold. Train today and your tree drinks again — miss it, and the grove starts over.',
      daysSinceActivity: ds,
      nextMilestone: milestoneAfter(raw),
    }
  }

  return {
    health: 'healthy',
    streak: raw,
    growth: growthFor(raw),
    trees: treesFor(raw),
    stageName: stageName(raw),
    message:
      raw >= 100
        ? treesFor(raw) >= 4
          ? 'Your grove stands complete. Legendary discipline, Hunter.'
          : 'A sacred grove. Every 50 days another tree takes root.'
        : 'Your discipline is alive. It grows a little every single day.',
    daysSinceActivity: ds,
    nextMilestone: milestoneAfter(raw),
  }
}
