-- Adds an optional daily reminder time to each habit.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- (schema.sql must have been run first.)

alter table public.habits
  -- Local time of day, e.g. 07:30. Empty (null) means no reminder.
  add column reminder_time time,
  -- The user's time zone, e.g. 'Asia/Kolkata', so the server (which runs
  -- in UTC) knows when 07:30 actually is for this user.
  add column time_zone text;
