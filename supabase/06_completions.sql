-- One row per "habit X was done on day Y".
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

create table public.completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  -- Deleting a habit deletes its check-offs too.
  habit_id uuid not null references public.habits on delete cascade,
  -- The user's LOCAL date (sent by their browser), e.g. 2026-11-12.
  completed_on date not null,
  created_at timestamptz not null default now(),
  -- A habit can only be checked off once per day.
  unique (habit_id, completed_on)
);

alter table public.completions enable row level security;

-- Users only see their own check-offs, and can only check off their own habits.
create policy "Users manage their own completions" on public.completions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );
