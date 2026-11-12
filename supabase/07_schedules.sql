-- Lets a habit be daily, on specific weekdays, or N times a week.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Existing habits become 'daily', so nothing changes for them.

alter table public.habits
  -- 'daily' | 'days' (specific weekdays) | 'per_week' (N times a week, any days)
  add column schedule_type text not null default 'daily'
    check (schedule_type in ('daily', 'days', 'per_week')),
  -- For 'days': which weekdays, 0 = Monday … 6 = Sunday. e.g. {0,2,4} = Mon/Wed/Fri
  add column schedule_days smallint[] not null default '{}',
  -- For 'per_week': how many times a week (7 would just be daily).
  add column times_per_week smallint check (times_per_week between 1 and 6);

-- Each schedule type must come with the details it needs.
alter table public.habits
  add constraint habits_valid_schedule check (
    schedule_type = 'daily'
    or (
      schedule_type = 'days'
      and cardinality(schedule_days) between 1 and 7
      and schedule_days <@ '{0,1,2,3,4,5,6}'::smallint[]
    )
    or (schedule_type = 'per_week' and times_per_week is not null)
  );
