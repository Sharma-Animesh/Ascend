-- ============================================================
-- ASCEND : The Fitness System — database schema
-- Applied via Supabase Management API. Idempotent where possible.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  units text not null default 'metric' check (units in ('metric','imperial')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- ASSESSMENTS (The Awakening) ----------
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  age int check (age between 18 and 100),
  sex text,
  height_cm numeric,
  weight_kg numeric,
  target_weight_kg numeric,
  activity_level text,
  experience text,
  goal text,
  equipment text[] not null default '{}',
  days_per_week int,
  session_length_min int,
  diet_pref text,
  country text,
  allergies text[] not null default '{}',
  health_flags jsonb not null default '{}'::jsonb,
  bmi numeric,
  bodyfat_est_low numeric,
  bodyfat_est_high numeric,
  created_at timestamptz not null default now()
);

-- ---------- CHARACTER PROFILES (the RPG layer) ----------
create table if not exists public.character_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level int not null default 1,
  xp bigint not null default 0,
  rank text not null default 'E',
  class text,
  archetype text,
  stats jsonb not null default '{"STR":5,"AGI":5,"VIT":5,"END":5,"FLX":5,"BRE":5,"TEC":5}'::jsonb,
  unspent_points int not null default 0,
  streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date,
  titles text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---------- EXERCISES (global content, admin-managed) ----------
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('home','gym','calisthenics','yoga','breath','martial')),
  muscles text[] not null default '{}',
  difficulty text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  equipment text[] not null default '{}',
  image_url text,
  animation_url text,
  description text,
  cues text[] not null default '{}',
  mistakes text[] not null default '{}',
  stat_focus text not null default 'STR' check (stat_focus in ('STR','AGI','VIT','END','FLX','BRE','TEC')),
  base_xp int not null default 20,
  default_sets int,
  default_reps text,
  duration_sec int,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- QUESTS ----------
create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'daily' check (type in ('daily','weekly','boss','trial')),
  title text not null,
  description text,
  objectives jsonb not null default '[]'::jsonb,
  xp_reward int not null default 50,
  stat_rewards jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','completed','expired')),
  quest_date date not null default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists quests_user_date_idx on public.quests (user_id, quest_date);
-- Backstop against concurrent daily-quest generation (two devices, double-mount):
create unique index if not exists quests_user_date_title_uidx on public.quests (user_id, quest_date, title);

-- ---------- WORKOUT LOGS ----------
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete set null,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_name text,
  sets jsonb not null default '[]'::jsonb,
  duration_min numeric,
  rpe int check (rpe between 1 and 10),
  notes text,
  xp_earned int not null default 0,
  logged_at timestamptz not null default now()
);
create index if not exists workout_logs_user_idx on public.workout_logs (user_id, logged_at desc);

-- ---------- FOOD LOGS ----------
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  meal text not null default 'other' check (meal in ('breakfast','lunch','dinner','snack','other')),
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  logged_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists food_logs_user_date_idx on public.food_logs (user_id, logged_date);

-- ---------- GOALS ----------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  metric text,
  target_value numeric,
  current_value numeric not null default 0,
  unit text,
  deadline date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- MEASUREMENTS ----------
create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric,
  measured_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists measurements_user_idx on public.measurements (user_id, measured_on);

-- ---------- ANNOUNCEMENTS (admin broadcast) ----------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Helper: is_admin (security definer so RLS can call it cheaply)
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ============================================================
-- Auto-provision profile + character on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  insert into public.character_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.character_profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.quests enable row level security;
alter table public.workout_logs enable row level security;
alter table public.food_logs enable row level security;
alter table public.goals enable row level security;
alter table public.measurements enable row level security;
alter table public.announcements enable row level security;

-- profiles: read own (admins read all); update own only
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- role column is locked: users can only update safe columns
revoke update on table public.profiles from authenticated, anon;
grant update (display_name, units, onboarded) on table public.profiles to authenticated;

-- admin-only role management via RPC (bypasses the column lock safely)
create or replace function public.admin_set_role(target_user uuid, new_role text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if new_role not in ('user','admin') then
    raise exception 'invalid role';
  end if;
  update public.profiles set role = new_role where id = target_user;
end;
$$;

-- user-owned tables: full CRUD on own rows, admins can read
do $$
declare t text;
begin
  foreach t in array array['assessments','quests','workout_logs','food_logs','goals','measurements']
  loop
    execute format('drop policy if exists %I_own on public.%I', t, t);
    execute format(
      'create policy %I_own on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t, t);
    execute format('drop policy if exists %I_admin_read on public.%I', t, t);
    execute format(
      'create policy %I_admin_read on public.%I for select using (public.is_admin())', t, t);
  end loop;
end $$;

-- character_profiles (keyed by user_id as PK)
drop policy if exists character_own on public.character_profiles;
create policy character_own on public.character_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists character_admin_read on public.character_profiles;
create policy character_admin_read on public.character_profiles
  for select using (public.is_admin());

-- exercises: everyone reads published, admins manage
drop policy if exists exercises_read on public.exercises;
create policy exercises_read on public.exercises
  for select using (published = true or public.is_admin());
drop policy if exists exercises_admin_insert on public.exercises;
create policy exercises_admin_insert on public.exercises
  for insert with check (public.is_admin());
drop policy if exists exercises_admin_update on public.exercises;
create policy exercises_admin_update on public.exercises
  for update using (public.is_admin());
drop policy if exists exercises_admin_delete on public.exercises;
create policy exercises_admin_delete on public.exercises
  for delete using (public.is_admin());

-- announcements: everyone reads active, admins manage
drop policy if exists announcements_read on public.announcements;
create policy announcements_read on public.announcements
  for select using (active = true or public.is_admin());
drop policy if exists announcements_admin_insert on public.announcements;
create policy announcements_admin_insert on public.announcements
  for insert with check (public.is_admin());
drop policy if exists announcements_admin_update on public.announcements;
create policy announcements_admin_update on public.announcements
  for update using (public.is_admin());
drop policy if exists announcements_admin_delete on public.announcements;
create policy announcements_admin_delete on public.announcements
  for delete using (public.is_admin());
