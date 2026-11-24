// The game layer: XP curve, ranks, classes, archetypes, stat metadata.
import type { ExerciseCategory, StatKey, Stats } from './types'

// ---------- Stats ----------
export const STAT_KEYS: StatKey[] = ['STR', 'AGI', 'VIT', 'END', 'FLX', 'BRE', 'TEC']

export const STAT_META: Record<StatKey, { label: string; desc: string; color: string }> = {
  STR: { label: 'Strength', desc: 'Force output — resistance training volume and load', color: '#f87171' },
  AGI: { label: 'Agility', desc: 'Speed & explosiveness — plyometrics, footwork', color: '#4ade80' },
  VIT: { label: 'Vitality', desc: 'Cardiovascular fitness — running, HIIT, conditioning', color: '#fb923c' },
  END: { label: 'Endurance', desc: 'Work capacity & consistency — duration, streaks', color: '#fbbf24' },
  FLX: { label: 'Flexibility', desc: 'Mobility & range of motion — yoga milestones', color: '#a78bfa' },
  BRE: { label: 'Breath', desc: 'Breath control & calm — breathwork, meditation', color: '#38bdf8' },
  TEC: { label: 'Technique', desc: 'Skill mastery — martial drills, movement quality', color: '#e879f9' },
}

export const DEFAULT_STATS: Stats = { STR: 5, AGI: 5, VIT: 5, END: 5, FLX: 5, BRE: 5, TEC: 5 }

// ---------- XP & levels ----------
/** XP needed to advance from `level` to `level + 1`. */
export function xpForLevel(level: number): number {
  return Math.round((100 * Math.pow(level, 1.5)) / 10) * 10
}

/** Total XP required to have reached `level` (level 1 = 0 XP). */
export function totalXpForLevel(level: number): number {
  let sum = 0
  for (let l = 1; l < level; l++) sum += xpForLevel(l)
  return sum
}

export interface LevelProgress {
  level: number
  /** XP earned inside the current level */
  into: number
  /** XP needed to clear the current level */
  needed: number
  /** 0..1 progress through the current level */
  pct: number
}

export function levelFromXp(xp: number): LevelProgress {
  let level = 1
  let remaining = Math.max(0, xp)
  while (remaining >= xpForLevel(level) && level < 999) {
    remaining -= xpForLevel(level)
    level++
  }
  const needed = xpForLevel(level)
  return { level, into: remaining, needed, pct: Math.min(1, remaining / needed) }
}

/** Stat points granted per level-up (spent on the Stats screen). */
export const POINTS_PER_LEVEL = 3

// ---------- Ranks ----------
export interface RankDef {
  id: string
  label: string
  minLevel: number
  color: string
}

export const RANKS: RankDef[] = [
  { id: 'E', label: 'E-Rank', minLevel: 1, color: '#8ba3c7' },
  { id: 'D', label: 'D-Rank', minLevel: 5, color: '#4ade80' },
  { id: 'C', label: 'C-Rank', minLevel: 10, color: '#38bdf8' },
  { id: 'B', label: 'B-Rank', minLevel: 16, color: '#a78bfa' },
  { id: 'A', label: 'A-Rank', minLevel: 23, color: '#e879f9' },
  { id: 'S', label: 'S-Rank', minLevel: 31, color: '#fbbf24' },
  { id: 'SOV', label: 'Zenith', minLevel: 40, color: '#f8fafc' },
]

export function rankForLevel(level: number): RankDef {
  let current = RANKS[0]
  for (const r of RANKS) if (level >= r.minLevel) current = r
  return current
}

export function rankById(id: string): RankDef {
  return RANKS.find((r) => r.id === id) ?? RANKS[0]
}

// ---------- Classes ----------
export interface ClassDef {
  id: string
  name: string
  tagline: string
  desc: string
  statBias: StatKey[]
  categories: ExerciseCategory[]
  color: string
}

export const CLASSES: ClassDef[] = [
  {
    id: 'assassin',
    name: 'Assassin',
    tagline: 'Lean. Fast. Silent.',
    desc: 'Calisthenics-forward training focused on speed, bodyweight mastery and razor conditioning.',
    statBias: ['AGI', 'TEC'],
    categories: ['calisthenics', 'home'],
    color: '#4ade80',
  },
  {
    id: 'berserker',
    name: 'Berserker',
    tagline: 'Strength above all.',
    desc: 'Gym-forward heavy training. Build raw force and dense muscle through progressive overload.',
    statBias: ['STR', 'END'],
    categories: ['gym', 'home'],
    color: '#f87171',
  },
  {
    id: 'monk',
    name: 'Monk',
    tagline: 'Stillness is power.',
    desc: 'Yoga, breath control and flexibility. Master the body by mastering the breath.',
    statBias: ['BRE', 'FLX'],
    categories: ['yoga', 'breath'],
    color: '#38bdf8',
  },
  {
    id: 'ranger',
    name: 'Ranger',
    tagline: 'Ready for anything.',
    desc: 'Balanced hybrid athlete — strength, conditioning and mobility in equal measure.',
    statBias: ['VIT', 'END'],
    categories: ['home', 'gym', 'calisthenics'],
    color: '#fbbf24',
  },
  {
    id: 'shadow',
    name: 'Ronin',
    tagline: 'The wandering blade.',
    desc: 'Wandering martial artist — striking fundamentals, footwork and fight conditioning, honed on the road.',
    statBias: ['TEC', 'AGI'],
    categories: ['martial', 'calisthenics'],
    color: '#a78bfa',
  },
]

export function classById(id: string | null): ClassDef | undefined {
  return CLASSES.find((c) => c.id === id)
}

// ---------- Physique archetypes ----------
export interface ArchetypeDef {
  id: string
  name: string
  build: string
  focus: string
  categories: ExerciseCategory[]
  /** Calorie strategy relative to TDEE, e.g. -0.15 = 15% deficit */
  calorieDelta: number
  calorieLabel: string
  statBias: StatKey[]
  color: string
}

export const ARCHETYPES: ArchetypeDef[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    build: 'Very lean, defined',
    focus: 'Calisthenics & conditioning',
    categories: ['calisthenics', 'home'],
    calorieDelta: -0.12,
    calorieLabel: 'Slight deficit',
    statBias: ['AGI', 'END'],
    color: '#4ade80',
  },
  {
    id: 'blade',
    name: 'Blade',
    build: 'Lean athletic — swimmer frame',
    focus: 'Hybrid strength + cardio',
    categories: ['home', 'gym', 'calisthenics'],
    calorieDelta: 0,
    calorieLabel: 'Maintenance',
    statBias: ['VIT', 'AGI'],
    color: '#38bdf8',
  },
  {
    id: 'vanguard',
    name: 'Vanguard',
    build: 'Muscular aesthetic',
    focus: 'Hypertrophy + some cardio',
    categories: ['gym', 'home'],
    calorieDelta: 0.08,
    calorieLabel: 'Slight surplus',
    statBias: ['STR', 'VIT'],
    color: '#e879f9',
  },
  {
    id: 'titan',
    name: 'Titan',
    build: 'Powerful, dense mass',
    focus: 'Heavy strength, high volume',
    categories: ['gym'],
    calorieDelta: 0.15,
    calorieLabel: 'Surplus',
    statBias: ['STR', 'END'],
    color: '#f87171',
  },
  {
    id: 'ascetic',
    name: 'Ascetic',
    build: 'Supple, mobile, controlled',
    focus: 'Yoga, breath & flexibility',
    categories: ['yoga', 'breath'],
    calorieDelta: 0,
    calorieLabel: 'Maintenance',
    statBias: ['FLX', 'BRE'],
    color: '#a78bfa',
  },
]

export function archetypeById(id: string | null): ArchetypeDef | undefined {
  return ARCHETYPES.find((a) => a.id === id)
}

// ---------- Titles ----------
export const TITLE_RULES: Array<{ id: string; title: string; check: (c: { level: number; streak: number; longest_streak: number }) => boolean }> = [
  { id: 'awakened', title: 'The Ascended', check: () => true },
  { id: 'iron-willed', title: 'Iron-Willed', check: (c) => c.longest_streak >= 7 },
  { id: 'relentless', title: 'Relentless', check: (c) => c.longest_streak >= 30 },
  { id: 'ascendant', title: 'Ascendant', check: (c) => c.level >= 10 },
  { id: 'apex', title: 'Apex Ascendant', check: (c) => c.level >= 25 },
]
