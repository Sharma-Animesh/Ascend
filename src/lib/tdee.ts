// Nutrition math: BMR (Mifflin-St Jeor), TDEE, safe calorie targets, macros.
// These are estimates for general information — not medical or dietary advice.
import type { Assessment } from './types'
import { archetypeById } from './game'

export const ACTIVITY_MULTIPLIERS: Record<string, { label: string; factor: number }> = {
  sedentary: { label: 'Sedentary (desk job, little exercise)', factor: 1.2 },
  light: { label: 'Lightly active (1–3 sessions/week)', factor: 1.375 },
  moderate: { label: 'Moderately active (3–5 sessions/week)', factor: 1.55 },
  very: { label: 'Very active (6–7 sessions/week)', factor: 1.725 },
  extreme: { label: 'Extremely active (physical job + training)', factor: 1.9 },
}

/** Safety floors — never recommend below these (eating-disorder safeguard). */
export function calorieFloor(sex: string | null): number {
  return sex === 'female' ? 1200 : 1500
}

export function bmr(sex: string | null, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'female' ? base - 161 : base + 5
}

export function tdee(assessment: Pick<Assessment, 'sex' | 'weight_kg' | 'height_cm' | 'age' | 'activity_level'>): number | null {
  const { sex, weight_kg, height_cm, age, activity_level } = assessment
  if (!weight_kg || !height_cm || !age) return null
  const mult = ACTIVITY_MULTIPLIERS[activity_level ?? 'light']?.factor ?? 1.375
  return Math.round(bmr(sex, weight_kg, height_cm, age) * mult)
}

export interface MacroTargets {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  strategyLabel: string
  flooredForSafety: boolean
}

/** Daily targets given an assessment + chosen archetype. Deficits are capped at 20% and floored. */
export function macroTargets(assessment: Assessment, archetypeId: string | null): MacroTargets | null {
  const base = tdee(assessment)
  if (!base || !assessment.weight_kg) return null
  const arch = archetypeById(archetypeId)
  const delta = Math.max(-0.2, Math.min(0.2, arch?.calorieDelta ?? 0))
  let calories = Math.round(base * (1 + delta))
  const floor = calorieFloor(assessment.sex)
  const flooredForSafety = calories < floor
  if (flooredForSafety) calories = floor

  const protein_g = Math.round(assessment.weight_kg * 1.8)
  const fat_g = Math.round((calories * 0.25) / 9)
  const carbs_g = Math.max(0, Math.round((calories - protein_g * 4 - fat_g * 9) / 4))

  return { calories, protein_g, carbs_g, fat_g, strategyLabel: arch?.calorieLabel ?? 'Maintenance', flooredForSafety }
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  return +(weightKg / (m * m)).toFixed(1)
}

/** Very rough body-fat estimate range from BMI + age + sex (Deurenberg). Clearly an estimate. */
export function bodyFatEstimate(bmiVal: number, age: number, sex: string | null): { low: number; high: number } {
  const sexFactor = sex === 'female' ? 0 : 1
  const est = 1.2 * bmiVal + 0.23 * age - 10.8 * sexFactor - 5.4
  return { low: Math.max(3, +(est - 3).toFixed(1)), high: Math.max(5, +(est + 3).toFixed(1)) }
}
