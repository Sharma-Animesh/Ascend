# ASCEND — Feature Agent Contract

You are building one feature area of **ASCEND: The Fitness System** — an anime-RPG-styled fitness
app (glowing "System" UI: dark navy, cyan glow, violet accents). Real fitness underneath: workouts,
nutrition, safety-first. Users are addressed as **"Ascendant"**; the app's voice is a calm, supportive
"System" (e.g. "The System has assigned today's training"). NEVER shame the user; encouraging tone only.

## Hard rules

1. **Write ONLY the files assigned to you.** Never modify shared files, other pages, package.json,
   configs, or the database schema. All dependencies are installed — never run npm install.
2. When done, run `npx tsc --noEmit`. Fix errors **in your files only**; ignore errors in files you
   don't own (other agents are working in parallel). Do not run the dev server or builds.
3. Mobile-first: layouts must be flawless at 360px wide AND at desktop (the app shell gives you
   `max-w-5xl` content area; use responsive grids `grid-cols-1 sm:grid-cols-2` etc.). Touch targets ≥ 44px.
4. Every page inside the app shell returns fragments/divs — the shell (nav, header) already exists.
   Use `<div className="space-y-4 sm:space-y-6">` as your page root. Standalone pages (auth, landing,
   awakening) build their own full-screen layout: `min-h-dvh bg-void grid-bg` + centered content.
5. All copy in English. No copyrighted characters/franchises — original names only.

## Stack

React 19 + TypeScript (strict) + Tailwind v4 + framer-motion + lucide-react + zustand + react-router-dom v7 + recharts + Supabase.

## Theme tokens (Tailwind classes)

- Colors: `bg-void` (page), `bg-abyss` (raised), `bg-panel`, `border-line`, `text-ink` (primary text),
  `text-mute` (secondary), `text-glow-soft` (light cyan), accents `sky-*`, `violet-*`, `text-gold`, `text-danger`, `text-success`.
- Fonts: `font-display` (Orbitron — headings/buttons, use with `tracking-[0.2em] uppercase`), `font-sans` (Rajdhani, default).
- Utility classes (defined in index.css): `.glass` (panel surface), `.clip-system` (notched corners),
  `.glow-border`, `.text-glow`, `.text-glow-gold`, `.scanlines` (needs relative parent), `.grid-bg`,
  `.shimmer-line`, `.sys-input` (form inputs), `.sys-label` (form labels), `.pb-safe`/`.pt-safe`, `.no-scrollbar`.
- Animation utilities: `animate-pulse-glow`, `animate-float`, `animate-rise`.

## Shared components (import and USE these — do not reinvent)

```tsx
import { SystemPanel } from '../components/system/SystemPanel'   // { title?, icon?, action?, children, className?, animate?, padding? }
import { GlowButton } from '../components/system/GlowButton'     // { variant?: 'primary'|'ghost'|'danger'|'gold', size?: 'sm'|'md'|'lg', loading?, full?, icon? } + button props
import { XPBar } from '../components/system/XPBar'               // { xp: number, compact?, className? }
import { Loader, InlineLoader } from '../components/system/Loader'
import { EmptyState } from '../components/system/EmptyState'     // { icon?, title, hint?, action? }
import { LogoMark, LogoWordmark } from '../components/system/Logo' // { size?, className? }
import { Emblem } from '../components/system/Emblem'              // { id: classId|archetypeId, size?, active? }
import { ExerciseVisual } from '../components/ExerciseVisual'     // { exercise: Pick<Exercise,'name'|'category'|'animation_url'|'image_url'>, className? } — animated demo, always works
```

(Adjust relative paths from your file's location. Pages in `src/pages/auth|admin/` need `../../`.)

## Shared libs & stores

```tsx
import { supabase } from '../lib/supabase'
import type { Profile, CharacterProfile, Exercise, Quest, QuestObjective, FoodLog, Goal, Assessment, Measurement, Announcement, StatKey, Stats } from '../lib/types'
import { STAT_META, STAT_KEYS, DEFAULT_STATS, CLASSES, ARCHETYPES, RANKS, classById, archetypeById, rankById, rankForLevel, levelFromXp, xpForLevel, POINTS_PER_LEVEL } from '../lib/game'
import { tdee, macroTargets, bmi, bodyFatEstimate, calorieFloor, ACTIVITY_MULTIPLIERS } from '../lib/tdee'
import { ensureDailyQuests } from '../lib/quests'                 // (character, equipmentStrings[]) => Promise<Quest[]>
import { useAuth } from '../store/auth'                           // { session, profile, character, loading, loadUserData(), refreshCharacter(), signOut(), setProfile(), setCharacter() }
import { awardXp, allocateStatPoint } from '../store/progress'    // awardXp(xp, statRewards?) — persists, updates store, fires level-up celebration automatically
import { useUi } from '../store/ui'                               // { celebration, celebrate(), dismissCelebration() } — LevelUpModal is already mounted in the shell
```

**Always award XP through `awardXp`** — never update character_profiles xp/level directly.

## Database tables (RLS: users only see/write their own rows; admins manage exercises/announcements and read everything)

- `profiles` (id, display_name, role 'user'|'admin', units, onboarded, created_at) — users may UPDATE only display_name/units/onboarded.
- `assessments` (user_id, age, sex 'male'|'female'|'other', height_cm, weight_kg, target_weight_kg, activity_level, experience, goal, equipment text[], days_per_week, session_length_min, diet_pref 'veg'|'nonveg'|'vegan', allergies text[], health_flags jsonb, bmi, bodyfat_est_low/high)
- `character_profiles` (user_id PK, level, xp, rank, class, archetype, stats jsonb, unspent_points, streak, longest_streak, last_activity_date, titles text[])
- `exercises` (name, category 'home'|'gym'|'calisthenics'|'yoga'|'breath'|'martial', muscles text[], difficulty, equipment text[], image_url, animation_url, description, cues text[], mistakes text[], stat_focus StatKey, base_xp, default_sets, default_reps, duration_sec, published)
- `quests` (user_id, type 'daily'|'weekly'|'boss'|'trial', title, description, objectives jsonb QuestObjective[], xp_reward, stat_rewards jsonb, status 'active'|'completed'|'expired', quest_date)
- `workout_logs` (user_id, quest_id?, exercise_id?, exercise_name, sets jsonb [{reps?,weight_kg?,duration_sec?}], duration_min, rpe, notes, xp_earned, logged_at)
- `food_logs` (user_id, name, meal 'breakfast'|'lunch'|'dinner'|'snack'|'other', calories, protein_g, carbs_g, fat_g, logged_date)
- `goals` (user_id, title, metric, target_value, current_value, unit, deadline, completed)
- `measurements` (user_id, weight_kg, measured_on)
- `announcements` (title, body, active, created_by) — all users read active ones.
- Admin RPC: `supabase.rpc('admin_set_role', { target_user: uuid, new_role: 'user'|'admin' })`

Patterns: always include `user_id: session!.user.id` on inserts. Dates as `new Date().toISOString().slice(0,10)`.
Handle Supabase errors: show a small red text or fallback UI, never crash. Show `InlineLoader` while fetching.

## Charts (Stats/Progress/Admin only)

Single-series ONLY, in cyan `#38bdf8` (fills at 25–35% opacity). Never two series on one axis — use two
small charts instead. Grid lines `rgba(56,189,248,0.08)`, axis text `#8ba3c7` at 11px, no legends,
tooltips styled as dark glass (`bg: #0d1528, border: 1px solid rgba(56,189,248,0.35)`). 2px line width,
dots ≥ 4px radius. Radar polygon: stroke `#38bdf8`, fill `rgba(56,189,248,0.25)`.

## Safety requirements (non-negotiable, from the PRD)

- Nutrition surfaces: "General information, not medical or dietary advice." `macroTargets()` already
  enforces calorie floors — if `flooredForSafety` is true, show a supportive note that targets were
  adjusted to a safe minimum.
- Breath exercises (category 'breath'): persistent warning — never practice breath-holds in or near
  water or while driving; stop immediately and sit down if dizzy or lightheaded.
- Martial exercises (category 'martial'): "Technique for fitness and self-protection. Spar only under
  a qualified coach. Never use to instigate violence."
- Streaks/misses: encouraging language only ("Recovery day — the climb continues tomorrow"), never guilt.

## Definition of done

- Files written, `npx tsc --noEmit` clean for YOUR files.
- Real Supabase reads/writes wired (no mock data), loading + empty + error states, framer-motion
  entrance animations (stagger lists with `motion.div` + delay), responsive at 360px and desktop.
