-- Share links: a habit with a share_token can be viewed read-only, without
-- logging in, by anyone who has the link /share/<token>.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

-- null = not shared. A long random code (uuid) that nobody can guess.
alter table public.habits
  add column share_token uuid unique;

-- Visitors to a share page aren't logged in, so Row Level Security (rightly)
-- lets them read nothing. This function is the one narrow exception: given a
-- valid token, it returns ONLY that habit's public details. No email, no
-- reminder time, no other habits. If sharing is off, it returns null.
--
-- "security definer" lets it read past RLS; "search_path = ''" makes it
-- use only the exact tables named below (a standard safety setting).
create or replace function public.get_shared_habit(token uuid)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'name', h.name,
    'schedule_type', h.schedule_type,
    'schedule_days', h.schedule_days,
    'times_per_week', h.times_per_week,
    -- Only a username the person chose at sign-up; never their email.
    'owner', nullif(trim(u.raw_user_meta_data ->> 'username'), ''),
    'completions', coalesce(
      (select json_agg(json_build_object('completed_on', c.completed_on))
       from public.completions c
       where c.habit_id = h.id),
      '[]'::json
    )
  )
  from public.habits h
  join auth.users u on u.id = h.user_id
  where h.share_token = token;
$$;

-- Only allow calling it; logged-out visitors ("anon") included.
revoke all on function public.get_shared_habit(uuid) from public;
grant execute on function public.get_shared_habit(uuid) to anon, authenticated;
