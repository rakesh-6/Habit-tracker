-- Remembers the (local) date a habit's reminder was last sent,
-- so each habit is reminded at most once per day.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

alter table public.habits
  add column last_reminded_on date;
