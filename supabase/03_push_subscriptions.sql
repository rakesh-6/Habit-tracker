-- Stores where to deliver push notifications for each user's browser(s).
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  -- The browser's push address (a URL at Google/Mozilla/Apple's push service).
  endpoint text not null check (endpoint like 'https://%'),
  -- Encryption keys from the browser, so only that browser can read the push.
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "Users manage their own push subscriptions" on public.push_subscriptions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
