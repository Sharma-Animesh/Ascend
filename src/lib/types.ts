// Row types mirroring supabase/schema.sql. Keep in sync with the database.

export type StatKey = 'STR' | 'AGI' | 'VIT' | 'END' | 'FLX' | 'BRE' | 'TEC'
export type Stats = Record<StatKey, number>

export interface Profile {
  id: string
  display_name: string | null
  role: 'user' | 'admin'
  units: 'metric' | 'imperial'
  onboarded: boolean
  created_at: string
}

export interface Assessment {
  id: string
  user_id: string
  age: number | null
  sex: string | null
  height_cm: number | null
  weight_kg: number | null
  target_weight_kg: number | null
  activity_level: string | null
  experience: string | null
  goal: string | null
  equipment: string[]
  days_per_week: number | null
  session_length_min: number | null
  diet_pref: string | null
  country: string | null
  allergies: string[]
  health_flags: Record<string, boolean>
  bmi: number | null
  bodyfat_est_low: number | null
  bodyfat_est_high: number | null
  created_at: string
}

export interface CharacterProfile {
  user_id: string
  level: number
  xp: number
  rank: string
  class: string | null
  archetype: string | null
  stats: Stats
  unspent_points: number
  streak: number
  longest_streak: number
  last_activity_date: string | null
  titles: string[]
  updated_at: string
}

export type ExerciseCategory = 'home' | 'gym' | 'calisthenics' | 'yoga' | 'breath' | 'martial'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  muscles: string[]
  difficulty: Difficulty
  equipment: string[]
  image_url: string | null
  /** Either an http(s) URL to a clip, or a built-in animation key like "anim:pushup" (see ExerciseVisual). */
  animation_url: string | null
  description: string | null
  cues: string[]
  mistakes: string[]
  stat_focus: StatKey
  base_xp: number
  default_sets: number | null
  default_reps: string | null
  duration_sec: number | null
  published: boolean
  created_at: string
}

export interface QuestObjective {
  id: string
  label: string
  exercise_id?: string
  /** e.g. "3 × 10", "45 sec", "5 min" */
  target?: string
  done: boolean
}

export type QuestType = 'daily' | 'weekly' | 'boss' | 'trial'
export type QuestStatus = 'active' | 'completed' | 'expired'

export interface Quest {
  id: string
  user_id: string
  type: QuestType
  title: string
  description: string | null
  objectives: QuestObjective[]
  xp_reward: number
  stat_rewards: Partial<Stats>
  status: QuestStatus
  quest_date: string
  completed_at: string | null
  created_at: string
}

export interface WorkoutLog {
  id: string
  user_id: string
  quest_id: string | null
  exercise_id: string | null
  exercise_name: string | null
  sets: Array<{ reps?: number; weight_kg?: number; duration_sec?: number }>
  duration_min: number | null
  rpe: number | null
  notes: string | null
  xp_earned: number
  logged_at: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'

export interface FoodLog {
  id: string
  user_id: string
  name: string
  meal: MealType
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  logged_date: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  metric: string | null
  target_value: number | null
  current_value: number
  unit: string | null
  deadline: string | null
  completed: boolean
  created_at: string
}

export interface Measurement {
  id: string
  user_id: string
  weight_kg: number | null
  measured_on: string
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  body: string | null
  active: boolean
  created_by: string | null
  created_at: string
}
