-- ================================================================
-- PinnacleQuiz – Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ================================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  avatar_id   text not null default '0',
  role        text not null default 'student' check (role in ('student', 'teacher', 'parent')),
  house       text check (house in ('Alpha', 'Beta', 'Gamma', 'Pulsar')),
  xp          integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 2. QUIZZES TABLE
create table if not exists public.quizzes (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  description  text not null default '',
  subject      text not null default 'Mathematics',
  grade        text not null default 'Grade 9',
  cover_color  text not null default 'from-purple-600 to-indigo-700',
  icon         text not null default '📚',
  play_count   integer not null default 0,
  is_public    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 3. QUESTIONS TABLE
create table if not exists public.questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid not null references public.quizzes(id) on delete cascade,
  position    integer not null default 0,
  text        text not null,
  type        text not null default 'multiple-choice',
  time_limit  integer not null default 20,
  points      integer not null default 1000,
  explanation text,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- 4. ANSWERS TABLE
create table if not exists public.answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  position    integer not null default 0,
  text        text not null,
  is_correct  boolean not null default false,
  color       text not null default '#E21B3C',
  icon        text not null default '▲'
);

-- 5. GAME SESSIONS TABLE
create table if not exists public.game_sessions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid not null references public.quizzes(id),
  host_id     uuid not null references public.profiles(id),
  game_code   text not null unique,
  status      text not null default 'waiting' check (status in ('waiting','active','completed')),
  created_at  timestamptz not null default now(),
  started_at  timestamptz,
  ended_at    timestamptz
);

-- 6. PLAYER RESULTS TABLE
create table if not exists public.player_results (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.game_sessions(id) on delete cascade,
  player_id       uuid not null references public.profiles(id),
  score           integer not null default 0,
  correct_count   integer not null default 0,
  total_count     integer not null default 0,
  best_streak     integer not null default 0,
  rank            integer,
  created_at      timestamptz not null default now()
);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

alter table public.profiles        enable row level security;
alter table public.quizzes         enable row level security;
alter table public.questions       enable row level security;
alter table public.answers         enable row level security;
alter table public.game_sessions   enable row level security;
alter table public.player_results  enable row level security;

-- PROFILES: users can read all, update their own
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- QUIZZES: public quizzes readable by all; creators manage their own
create policy "quizzes_select_public" on public.quizzes for select using (is_public = true or auth.uid() = creator_id);
create policy "quizzes_insert_auth"   on public.quizzes for insert with check (auth.uid() = creator_id);
create policy "quizzes_update_own"    on public.quizzes for update using (auth.uid() = creator_id);
create policy "quizzes_delete_own"    on public.quizzes for delete using (auth.uid() = creator_id);

-- QUESTIONS: readable if quiz is readable; writable by quiz creator
create policy "questions_select" on public.questions for select using (
  exists (select 1 from public.quizzes q where q.id = quiz_id and (q.is_public = true or q.creator_id = auth.uid()))
);
create policy "questions_manage" on public.questions for all using (
  exists (select 1 from public.quizzes q where q.id = quiz_id and q.creator_id = auth.uid())
);

-- ANSWERS: same as questions
create policy "answers_select" on public.answers for select using (
  exists (
    select 1 from public.questions qu
    join public.quizzes qz on qz.id = qu.quiz_id
    where qu.id = question_id and (qz.is_public = true or qz.creator_id = auth.uid())
  )
);
create policy "answers_manage" on public.answers for all using (
  exists (
    select 1 from public.questions qu
    join public.quizzes qz on qz.id = qu.quiz_id
    where qu.id = question_id and qz.creator_id = auth.uid()
  )
);

-- GAME SESSIONS
create policy "sessions_select" on public.game_sessions for select using (true);
create policy "sessions_manage"  on public.game_sessions for all using (auth.uid() = host_id);

-- PLAYER RESULTS
create policy "results_select" on public.player_results for select using (true);
create policy "results_insert"  on public.player_results for insert with check (auth.uid() = player_id);

-- ================================================================
-- REALTIME (for live lobby & leaderboard)
-- ================================================================
alter publication supabase_realtime add table public.game_sessions;
alter publication supabase_realtime add table public.player_results;

-- ================================================================
-- GOOGLE OAUTH SETUP REMINDER
-- ================================================================
-- In Supabase Dashboard → Authentication → Providers → Google:
--   1. Enable Google provider
--   2. Add Client ID and Client Secret from Google Cloud Console
--   3. Copy the Callback URL shown and add it to Google Cloud Console
--      Authorized redirect URIs
-- In Google Cloud Console → APIs & Services → Credentials → OAuth 2.0:
--   Authorized origins: https://your-vercel-app.vercel.app
--   Authorized redirect URIs: https://your-project.supabase.co/auth/v1/callback
-- ================================================================
