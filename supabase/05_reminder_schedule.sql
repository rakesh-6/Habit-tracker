-- Calls the deployed app's reminder sender every minute, from inside Supabase.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- BEFORE running this, add two secrets in Supabase → Integrations → Vault
-- (kept out of this file so the password is never saved in code):
--   reminders_url  →  https://<your-app>.vercel.app/api/send-reminders
--   cron_secret    →  the same value as CRON_SECRET in your Vercel settings

-- pg_cron = a timer inside the database. pg_net = lets the database make web requests.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- '* * * * *' means "every minute" (minute, hour, day, month, weekday — all "any").
select cron.schedule(
  'send-habit-reminders',
  '* * * * *',
  $$
  select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'reminders_url'),
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    timeout_milliseconds := 30000
  );
  $$
);

-- Handy commands (run separately when needed):
--
-- See the last few runs and whether they succeeded:
--   select status_code, content, created from net._http_response order by created desc limit 5;
--
-- Stop the schedule:
--   select cron.unschedule('send-habit-reminders');
