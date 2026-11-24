// Daily quest generation. Deterministic-ish per day, driven by the user's
// archetype/class focus, level and available equipment.
import { supabase } from './supabase'
import { archetypeById, classById } from './game'
import type { CharacterProfile, Difficulty, Exercise, Quest, QuestObjective, StatKey } from './types'

function difficultyForLevel(level: number): Difficulty {
  if (level >= 18) return 'advanced'
  if (level >= 8) return 'intermediate'
  return 'beginner'
}

/** Simple seeded shuffle so the same user gets the same quests within one day. */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function daySeed(userId: string): number {
  const day = new Date().toISOString().slice(0, 10)
  let h = 0
  for (const ch of userId + day) h = (h * 31 + ch.charCodeAt(0)) % 1_000_000
  return h + 1
}

function objectiveFor(ex: Exercise): QuestObjective {
  let target: string | undefined
  if (ex.duration_sec) {
    target = ex.duration_sec >= 90 ? `${Math.round(ex.duration_sec / 60)} min` : `${ex.duration_sec} sec`
  } else if (ex.default_sets && ex.default_reps) {
    target = `${ex.default_sets} × ${ex.default_reps}`
  }
  return { id: ex.id, label: ex.name, exercise_id: ex.id, target, done: false }
}

// ---------- Daily Challenge ----------
// A fixed baseline every trainee receives daily ("10 push-ups, 20 sit-ups,
// 1 km run" style). Quantities scale with level tier; the task mix switches
// with the Ascendant's training focus (class first, then archetype).

type ChallengeFocus = 'balanced' | 'strength' | 'agility' | 'martial' | 'calm'

const CLASS_FOCUS: Record<string, ChallengeFocus> = {
  berserker: 'strength',
  monk: 'calm',
  shadow: 'martial',
  assassin: 'agility',
  ranger: 'balanced',
}

const ARCH_FOCUS: Record<string, ChallengeFocus> = {
  titan: 'strength',
  vanguard: 'strength',
  ascetic: 'calm',
  phantom: 'agility',
  blade: 'balanced',
}

interface ChallengeTask {
  label: string
  /** target per tier: [beginner, intermediate, advanced] */
  amounts: [string, string, string]
  stat: StatKey
}

const CHALLENGE_TASKS: Record<ChallengeFocus, ChallengeTask[]> = {
  balanced: [
    { label: 'Push-ups', amounts: ['× 10', '× 20', '× 35'], stat: 'STR' },
    { label: 'Sit-ups', amounts: ['× 20', '× 35', '× 50'], stat: 'END' },
    { label: 'Run or brisk walk', amounts: ['1 km', '2 km', '3 km'], stat: 'VIT' },
  ],
  strength: [
    { label: 'Push-ups', amounts: ['× 15', '× 25', '× 40'], stat: 'STR' },
    { label: 'Bodyweight squats', amounts: ['× 20', '× 35', '× 50'], stat: 'STR' },
    { label: 'Sit-ups', amounts: ['× 20', '× 30', '× 45'], stat: 'END' },
    { label: 'Brisk walk or run', amounts: ['1 km', '1.5 km', '2 km'], stat: 'VIT' },
  ],
  agility: [
    { label: 'Jumping jacks', amounts: ['× 30', '× 50', '× 80'], stat: 'AGI' },
    { label: 'Push-ups', amounts: ['× 10', '× 15', '× 25'], stat: 'STR' },
    { label: 'Run', amounts: ['1.5 km', '2.5 km', '4 km'], stat: 'VIT' },
  ],
  martial: [
    { label: 'Shadowboxing', amounts: ['3 min', '5 min', '8 min'], stat: 'TEC' },
    { label: 'Bodyweight squats', amounts: ['× 15', '× 30', '× 45'], stat: 'STR' },
    { label: 'Sit-ups', amounts: ['× 20', '× 30', '× 45'], stat: 'END' },
    { label: 'Run', amounts: ['1 km', '2 km', '3 km'], stat: 'VIT' },
  ],
  calm: [
    { label: 'Yoga flow', amounts: ['10 min', '15 min', '20 min'], stat: 'FLX' },
    { label: 'Breathing practice (seated)', amounts: ['5 min', '8 min', '10 min'], stat: 'BRE' },
    { label: 'Mindful walk', amounts: ['1 km', '2 km', '3 km'], stat: 'VIT' },
  ],
}

const CHALLENGE_XP: Record<Difficulty, number> = { beginner: 40, intermediate: 60, advanced: 85 }
const TIER_INDEX: Record<Difficulty, 0 | 1 | 2> = { beginner: 0, intermediate: 1, advanced: 2 }

function buildDailyChallenge(character: CharacterProfile, today: string): Record<string, unknown> {
  const tier = difficultyForLevel(character.level)
  const focus = CLASS_FOCUS[character.class ?? ''] ?? ARCH_FOCUS[character.archetype ?? ''] ?? 'balanced'
  const tasks = CHALLENGE_TASKS[focus]
  const idx = TIER_INDEX[tier]
  const stat_rewards: Partial<Record<StatKey, number>> = {}
  for (const t of tasks) stat_rewards[t.stat] = (stat_rewards[t.stat] ?? 0) + 1
  return {
    user_id: character.user_id,
    type: 'daily',
    title: 'Daily Challenge',
    description: `The System's baseline discipline — ${tier} tier. Clear it to keep your streak alive; your grove grows with every day trained.`,
    objectives: tasks.map((t, i) => ({ id: `c${i}`, label: t.label, target: t.amounts[idx], done: false })),
    xp_reward: CHALLENGE_XP[tier],
    stat_rewards,
    quest_date: today,
  }
}

function equipmentOk(ex: Exercise, available: string[]): boolean {
  if (!ex.equipment.length) return true
  if (available.includes('full gym')) return true
  return ex.equipment.every((e) => e === 'none' || available.includes(e))
}

/**
 * Ensure today's daily quests exist for the user; generates and inserts them when missing.
 * Returns all of today's quests (existing or newly created).
 */
export async function ensureDailyQuests(character: CharacterProfile, equipment: string[]): Promise<Quest[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data: existing, error } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', character.user_id)
    .eq('quest_date', today)
    .order('created_at')
  if (error) throw error
  if (existing && existing.length > 0) return existing as Quest[]

  const { data: pool, error: exErr } = await supabase.from('exercises').select('*').eq('published', true)
  if (exErr) throw exErr
  const exercises = (pool ?? []) as Exercise[]

  const arch = archetypeById(character.archetype)
  const cls = classById(character.class)
  const focusCategories = [...new Set([...(arch?.categories ?? []), ...(cls?.categories ?? ['home'])])]
  const diff = difficultyForLevel(character.level)
  const allowedDiffs: Difficulty[] =
    diff === 'advanced' ? ['advanced', 'intermediate'] : diff === 'intermediate' ? ['intermediate', 'beginner'] : ['beginner']

  const seed = daySeed(character.user_id)
  const usable = exercises.filter((e) => allowedDiffs.includes(e.difficulty) && equipmentOk(e, equipment))

  // Main training directive: 4-5 exercises from focus categories
  const mainPool = usable.filter((e) => focusCategories.includes(e.category) && e.category !== 'breath')
  const main = seededShuffle(mainPool.length >= 4 ? mainPool : usable.filter((e) => e.category !== 'breath'), seed).slice(0, 5)

  // Discipline: one breath/yoga recovery objective
  const calmPool = usable.filter((e) => e.category === 'breath' || e.category === 'yoga')
  const calm = seededShuffle(calmPool, seed + 7).slice(0, 2)

  const statSum = (list: Exercise[]) => {
    const rewards: Partial<Record<StatKey, number>> = {}
    for (const e of list) rewards[e.stat_focus] = (rewards[e.stat_focus] ?? 0) + 1
    return rewards
  }

  const toInsert = [
    buildDailyChallenge(character, today),
    main.length && {
      user_id: character.user_id,
      type: 'daily',
      title: 'Daily Training Directive',
      description: 'The System has assigned today’s training. Complete all objectives to claim your reward.',
      objectives: main.map(objectiveFor),
      xp_reward: main.reduce((s, e) => s + e.base_xp, 0) + 30,
      stat_rewards: statSum(main),
      quest_date: today,
    },
    calm.length && {
      user_id: character.user_id,
      type: 'daily',
      title: 'Inner Discipline',
      description: 'Recover and regulate. Breath and mobility keep the vessel ready.',
      objectives: calm.map(objectiveFor),
      xp_reward: calm.reduce((s, e) => s + e.base_xp, 0) + 15,
      stat_rewards: statSum(calm),
      quest_date: today,
    },
  ].filter(Boolean) as Array<Record<string, unknown>>

  if (!toInsert.length) return []
  // Idempotent insert: a unique index on (user_id, quest_date, title) makes
  // concurrent dashboard loads (second device, StrictMode double-mount) safe.
  const { error: insErr } = await supabase
    .from('quests')
    .upsert(toInsert, { onConflict: 'user_id,quest_date,title', ignoreDuplicates: true })
  if (insErr) throw insErr
  // Re-read: another client may have won the race for some rows.
  const { data: created, error: reErr } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', character.user_id)
    .eq('quest_date', today)
    .order('created_at')
  if (reErr) throw reErr
  return (created ?? []) as Quest[]
}
