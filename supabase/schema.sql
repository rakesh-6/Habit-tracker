-- Habit Tracker database schema.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

-- One row per habit. Each habit belongs to exactly one user.
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  -- Filled in by the database from the logged-in user, so the app never
  -- sends (or could fake) a user id.
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now()
);

-- Row Level Security: users can only see and change their own habits.
alter table public.habits enable row level security;

create policy "Users manage their own habits" on public.habits
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
