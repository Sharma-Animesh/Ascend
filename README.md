# ASCEND — The Fitness System

An anime-RPG-styled fitness app: real training programs wrapped in a glowing "System" interface.
Users **awaken**, get assessed, receive a **Rank** and **Class**, complete daily **Quests** (real
workouts), gain **XP and stats** (STR / AGI / VIT / END / FLX / BRE / TEC), and climb the ranks
from **E to Sovereign** — while tracking nutrition, goals, and progress underneath.

One TypeScript codebase, three targets:

| Target | How |
|---|---|
| **Web (desktop + mobile)** | Vite + React SPA, fully responsive |
| **Installable app (PWA)** | `vite-plugin-pwa` — "Add to Home Screen" works out of the box |
| **Android (Play Store)** | Capacitor wrapper in [android/](android/) |

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · framer-motion · recharts · zustand ·
react-router v7 · Supabase (Postgres + Auth + RLS) · Capacitor 8

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

`.env` needs (already configured for this project):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The anon key is safe in the client — every table is protected by row-level security
(see [supabase/schema.sql](supabase/schema.sql)). The service-role key must **never** ship in the app.

## Database

Schema + RLS policies live in [supabase/schema.sql](supabase/schema.sql); the exercise library seed
is [supabase/seed_exercises.sql](supabase/seed_exercises.sql). Apply either with:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... node scripts/db-apply.mjs supabase/schema.sql
```

Key tables: `profiles` (role: user/admin), `assessments` (Awakening data + health screen),
`character_profiles` (level/XP/rank/class/archetype/stats/streak), `exercises`, `quests`,
`workout_logs`, `food_logs`, `goals`, `measurements`, `announcements`.

## Admin panel

Routes under `/app/admin` (visible only to admins): dashboard KPIs, exercise library CRUD,
user management (promote/demote via a security-definer RPC), and broadcast announcements.

To make yourself admin: **sign up in the app first**, then:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... node scripts/make-admin.mjs you@example.com
```

Security notes:
- Users cannot change their own `role` — the column is revoked from client updates; only the
  `admin_set_role` RPC (which checks `is_admin()`) can change it.
- Admin reads/writes are enforced by RLS, not by UI hiding.

## Demo / test account

A confirmed test account exists for instant exploration (created during verification):
`hunter.test@ascend.dev` / `AscendTest!2026` — regular user role, already onboarded, with sample
logs. Delete it from the Supabase dashboard (Authentication → Users) whenever you like.

> **Security note:** the access token / service-role key used during setup were shared in chat —
> rotate them in the Supabase dashboard (Settings → API) before going to production, and never put
> the service-role key in the app.

## Auth behavior

Email + password via Supabase Auth. **Email confirmation is currently OFF** (signups log in
instantly) — appropriate for development. Before production, either keep it off knowingly or
re-enable it with real deliverability: turn "Confirm email" back on (Dashboard → Authentication →
Sign In / Providers) AND configure custom SMTP (Authentication → Emails → SMTP settings — a Gmail
app password works for testing; use a transactional provider like Resend/Brevo for launch).

## Android / Play Store

```bash
npm run android:sync   # builds web assets + syncs into android/
npm run android:open   # opens Android Studio (requires Android Studio + JDK 17)
```

In Android Studio: **Build → Generate Signed Bundle** to produce the `.aab` you upload to the Play
Console. Before first publish: pick your final `applicationId` in `android/app/build.gradle`
(currently `com.thegatewaydigital.ascend`) — it cannot change after publishing. Store icons live in
`public/icons/` (regenerate from the SVG logo with `npm run icons`).

## Project layout

```
src/
  lib/          supabase client, types, game math (XP/ranks/classes/archetypes), TDEE, quest generation
  store/        zustand stores: auth/profile/character, XP awarding, UI celebrations
  components/   system UI kit (SystemPanel, GlowButton, XPBar, LevelUpModal, Emblem, ExerciseVisual...)
  pages/        Landing, auth, Awakening wizard, Dashboard, QuestPlayer, Stats, Progress,
                Exercises, Nutrition, Goals, Profile, admin/*
supabase/       schema.sql (tables + RLS), seed_exercises.sql
scripts/        db-apply.mjs, make-admin.mjs, gen-icons.mjs
android/        Capacitor Android project
```

## Safety & content principles (implemented, per PRD)

- Health screen (PAR-Q style) during Awakening; "not medical advice" disclaimers on onboarding and nutrition.
- Calorie targets enforce safe floors (1200/1500 kcal) and cap deficits at 20%; supportive language only.
- Breathwork: conservative durations only, persistent "never near water / while driving, stop if dizzy" warnings.
- Martial content framed as technique/fitness/self-defense fundamentals; "spar only under a qualified coach."
- Streak logic tolerates rest days (2-day grace) and never shames.
- All characters, emblems and art are original — no third-party anime IP anywhere in the build.

## License / IP

All visual assets (logo, emblems, animated exercise holograms) are original vector art created for
this project.
