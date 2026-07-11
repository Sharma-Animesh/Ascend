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
  if (!exercises.length) return []

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
  const { data: created, error: insErr } = await supabase.from('quests').insert(toInsert).select()
  if (insErr) throw insErr
  return (created ?? []) as Quest[]
}
