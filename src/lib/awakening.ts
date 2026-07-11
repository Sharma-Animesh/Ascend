// Pure helpers for THE AWAKENING onboarding wizard. No React, no side effects.
import type { Stats } from './types'
import { DEFAULT_STATS, archetypeById, classById } from './game'

// ---------- Health screen (PAR-Q style) ----------

export const HEALTH_FLAGS = [
  {
    key: 'heart_condition',
    label: 'Heart condition',
    desc: 'A doctor has said you have a heart condition and should only do physician-approved activity.',
  },
  {
    key: 'chest_pain',
    label: 'Chest pain',
    desc: 'You feel pain or pressure in your chest during or after physical activity.',
  },
  {
    key: 'dizziness',
    label: 'Dizziness or fainting',
    desc: 'You lose your balance because of dizziness, or you have lost consciousness.',
  },
  {
    key: 'joint_problem',
    label: 'Bone or joint problem',
    desc: 'A bone or joint problem that could be made worse by physical activity.',
  },
  {
    key: 'pregnancy',
    label: 'Pregnancy',
    desc: 'You are currently pregnant or recently postpartum.',
  },
  {
    key: 'blood_pressure',
    label: 'Blood pressure or heart medication',
    desc: 'You take medication for blood pressure or a heart condition.',
  },
] as const

export type HealthFlagKey = (typeof HEALTH_FLAGS)[number]['key']
export type HealthFlags = Record<HealthFlagKey, boolean>

export const EMPTY_HEALTH_FLAGS: HealthFlags = {
  heart_condition: false,
  chest_pain: false,
  dizziness: false,
  joint_problem: false,
  pregnancy: false,
  blood_pressure: false,
}

export function toggleHealthFlag(flags: HealthFlags, key: HealthFlagKey): HealthFlags {
  return { ...flags, [key]: !flags[key] }
}

export function anyHealthFlag(flags: HealthFlags): boolean {
  return Object.values(flags).some(Boolean)
}

// ---------- Context options ----------

export const EQUIPMENT_OPTIONS = ['none', 'bands', 'dumbbells', 'pull-up bar', 'full gym'] as const

export const EXPERIENCE_OPTIONS = [
  { id: 'new', label: 'Newly Awakened', desc: 'New to structured training' },
  { id: 'returning', label: 'Returning Hunter', desc: 'Trained before — coming back after a break' },
  { id: 'experienced', label: 'Seasoned Veteran', desc: 'Training consistently for a year or more' },
] as const

export const GOAL_OPTIONS = [
  { id: 'lose_fat', label: 'Shed the Excess', desc: 'Lose body fat' },
  { id: 'build_muscle', label: 'Forge Muscle', desc: 'Build size and strength' },
  { id: 'recomposition', label: 'Recomposition', desc: 'Lose fat and build muscle together' },
  { id: 'mobility', label: 'Unbind the Body', desc: 'Mobility, flexibility and calm' },
  { id: 'skill', label: 'Master Technique', desc: 'Skills, movement and martial practice' },
] as const

export const SESSION_LENGTHS = [15, 30, 45, 60] as const

export const DAYS_OPTIONS = [2, 3, 4, 5, 6, 7] as const

export const DIET_OPTIONS = [
  { id: 'veg', label: 'Vegetarian' },
  { id: 'nonveg', label: 'Non-veg' },
  { id: 'vegan', label: 'Vegan' },
] as const

// ---------- Parsing & validation ----------

/** Parse a numeric string; returns the number only when finite and within [min, max]. */
export function numInRange(raw: string, min: number, max: number): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return null
  return n >= min && n <= max ? n : null
}

/** "milk, peanuts,, shellfish " -> ["milk", "peanuts", "shellfish"] */
export function parseAllergies(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Equipment chips: 'none' is mutually exclusive with everything else. */
export function toggleEquipment(current: string[], item: string): string[] {
  if (item === 'none') return current.includes('none') ? [] : ['none']
  const rest = current.filter((e) => e !== 'none')
  return rest.includes(item) ? rest.filter((e) => e !== item) : [...rest, item]
}

// ---------- Archetype suggestion ----------

/**
 * Suggest a physique archetype from goal + BMI + experience.
 * The Hunter may always override — this is a suggestion, never a mandate.
 */
export function suggestArchetype(
  goal: string | null,
  bmiVal: number | null,
  experience: string | null,
): string {
  if (goal === 'lose_fat' || (bmiVal !== null && bmiVal >= 27)) return 'phantom'
  if (goal === 'build_muscle') return experience === 'experienced' ? 'titan' : 'vanguard'
  if (goal === 'mobility') return 'ascetic'
  if (goal === 'skill') return 'blade'
  return 'blade'
}

// ---------- Starting stats ----------

export interface CalibrationInput {
  pushups: number
  plankSec: number
  squats: number
  classId: string | null
  archetypeId: string | null
}

/**
 * Starting stats = DEFAULT_STATS + baseline-trial bonuses + class bias (+2 each)
 * + archetype bias (+1 each).
 */
export function computeStartingStats({ pushups, plankSec, squats, classId, archetypeId }: CalibrationInput): Stats {
  const stats: Stats = { ...DEFAULT_STATS }

  if (pushups >= 30) stats.STR += 4
  else if (pushups >= 20) stats.STR += 3
  else if (pushups >= 10) stats.STR += 2
  else if (pushups >= 1) stats.STR += 1

  if (plankSec >= 120) stats.END += 4
  else if (plankSec >= 90) stats.END += 3
  else if (plankSec >= 60) stats.END += 2
  else if (plankSec >= 20) stats.END += 1

  if (squats >= 40) stats.VIT += 3
  else if (squats >= 25) stats.VIT += 2
  else if (squats >= 10) stats.VIT += 1

  for (const key of classById(classId)?.statBias ?? []) stats[key] += 2
  for (const key of archetypeById(archetypeId)?.statBias ?? []) stats[key] += 1

  return stats
}
