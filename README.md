# Habit Tracker

A web app that keeps you motivated with your habits by making progress visible. Check off habits each day, watch your streaks grow, earn milestone badges, and get a reminder when it's time.

Anyone can sign up. Each person sees only their own habits.

---

## Contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Run it locally](#run-it-locally)
4. [Set up reminders (optional)](#set-up-reminders-optional)
5. [Commands](#commands)
6. [Deploy to Vercel](#deploy-to-vercel)
7. [Project structure](#project-structure)
8. [How it works](#how-it-works)

---

## Features

| Feature | What it does |
|---|---|
| **Accounts** | Sign up with a username, email and password. Log in and out. |
| **Habits** | Add, edit and delete habits, e.g. "Read 10 pages". |
| **Schedules** | Every day, specific days (e.g. Mon/Wed/Fri), or a number of times a week. |
| **Daily check-off** | Tap once to mark a habit done for today. Tap again to undo. |
| **Streaks** | Current streak and best streak for each habit. Rest days don't break a streak. |
| **History calendar** | A 12-week grid showing which days each habit was done. |
| **Milestone badges** | 🥉 7, 🥈 30 and 🥇 100-day streaks (4, 12 and 26 weeks for weekly habits). |
| **Stats** | Completion rate, best weekdays and a 12-week trend chart. |
| **Reminders** | A push notification at a time you choose, even when the tab is closed. |
| **Share links** | Share one habit as a read-only page. Anyone with the link can view it, with no login needed. Switch it off any time. |

---

## Tech stack

- **[Next.js](https://nextjs.org) 16** (React, App Router)
- **[Tailwind CSS](https://tailwindcss.com) 4**
- **[Supabase](https://supabase.com)**: login (Auth) and a Postgres database with Row Level Security
- **[web-push](https://github.com/web-push-libs/web-push)**: browser push notifications
- **[Vercel](https://vercel.com)**: hosting

---

## Run it locally

### 1. What you need

- [Node.js](https://nodejs.org) **20.9 or newer**
- A free [Supabase](https://supabase.com) account

### 2. Install

```bash
git clone <your-repo-url>
cd <your-project-folder>
npm install
```

### 3. Create the Supabase project

1. In Supabase, create a **new project**.
2. Go to **SQL Editor**. Run each file below **in this order**: open the file, copy all of it, paste it into a new query, and click **Run**.

   | Order | File | What it adds |
   |---|---|---|
   | 1 | [`supabase/schema.sql`](supabase/schema.sql) | The `habits` table and its privacy rules |
   | 2 | [`supabase/02_reminder_time.sql`](supabase/02_reminder_time.sql) | Reminder time and time zone on habits |
   | 3 | [`supabase/03_push_subscriptions.sql`](supabase/03_push_subscriptions.sql) | Where to send push notifications |
   | 4 | [`supabase/04_last_reminded_on.sql`](supabase/04_last_reminded_on.sql) | Stops a habit being reminded twice a day |
   | 5 | [`supabase/06_completions.sql`](supabase/06_completions.sql) | The `completions` table (daily check-offs) |
   | 6 | [`supabase/07_schedules.sql`](supabase/07_schedules.sql) | Custom schedules |
   | 7 | [`supabase/08_sharing.sql`](supabase/08_sharing.sql) | Share links |

   Each one should say **"Success. No rows returned."**

   > `05_reminder_schedule.sql` is skipped on purpose. It's only needed after you deploy (see [Deploy to Vercel](#deploy-to-vercel)).

### 4. Add your settings

Create a file named **`.env.local`** in the project folder:

```bash
# Supabase → Project Settings → API Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

These two are enough to run the app. Reminders need a few more (see [Set up reminders](#set-up-reminders-optional)).

> `.env.local` holds secrets. It's already in `.gitignore`, so never commit it or share it.

### 5. Start the app

```bash
npm run dev
```

Open **http://localhost:3000**, sign up, and confirm your email. You're in.

---

## Set up reminders (optional)

Reminders need some extra settings and a "clock" that checks for due habits every minute.

### 1. Add the extra settings to `.env.local`

| Setting | Where to get it |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Run `npx web-push generate-vapid-keys` and copy the **Public Key** |
| `VAPID_PRIVATE_KEY` | The **Private Key** from the same command |
| `VAPID_SUBJECT` | `mailto:` followed by your email, e.g. `mailto:you@example.com` |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → **Secret keys** (`sb_secret_...`) |
| `CRON_SECRET` | Any long random password. Make one with:<br>`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

Restart `npm run dev` after editing `.env.local`.

> ⚠️ `SUPABASE_SECRET_KEY` can read **every** user's data. Keep it secret.

### 2. Start the local clock

In a **second terminal**, leave this running:

```bash
npm run reminders
```

Every minute, it prints a line like `200 {"checked":3,"due":0,"sent":0}`.

### 3. Turn on reminders in the app

1. Click **🔔 Enable reminders** and choose **Allow**.
2. Give a habit a reminder time a couple of minutes from now.
3. A notification pops up at that time.

> **Using Brave?** Turn on `brave://settings/privacy` → **"Use Google services for push messaging"**, then restart Brave. Otherwise you'll see "Registration failed - push service error".

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the app for development at http://localhost:3000 |
| `npm run reminders` | Local clock: checks for due reminders every minute |
| `npm run lint` | Check the code for problems |
| `npm run build` | Build the app for production |
| `npm start` | Run the production build |

---

## Deploy to Vercel

### 1. Deploy the app

1. Push the code to GitHub.
2. In [Vercel](https://vercel.com), click **Add New → Project** and import the repo.
3. Under **Settings → Environment Variables**, add **all 7 settings** from your `.env.local`.
4. Deploy.

### 2. Point Supabase at your site

In Supabase → **Authentication → URL Configuration**, set **Site URL** to your Vercel address (e.g. `https://your-app.vercel.app`). Otherwise, sign-up confirmation emails link to `localhost`.

### 3. Switch on the reminder clock

Once deployed, Supabase calls your app every minute, so you no longer need `npm run reminders`.

1. In Supabase → **Integrations → Vault**, add two secrets:

   | Name | Value |
   |---|---|
   | `reminders_url` | `https://your-app.vercel.app/api/send-reminders` |
   | `cron_secret` | The same value as `CRON_SECRET` |

2. Run [`supabase/05_reminder_schedule.sql`](supabase/05_reminder_schedule.sql) in the SQL Editor.
3. After a few minutes, check that it's working:

   ```sql
   select status_code, content, created
   from net._http_response
   order by created desc
   limit 5;
   ```

   You should see `200` once a minute.

> Why not Vercel Cron? Its free plan only runs once a day. Reminders need every minute, so Supabase's built-in scheduler (`pg_cron`) is used instead.

---

## Project structure

```
app/
  page.js                    Home: habit list, add form, reminders toggle
  login/                     Log in / sign up page and actions
  habits/                    Everything on a habit row
    HabitItem.js               One habit: check-off, streaks, calendar, buttons
    actions.js                 Add, edit, delete, check off, share
    StreakSummary.js           Streak line + badges
    HistoryCalendar.js         The 12-week grid
    ScheduleFields.js          "How often?" picker
  stats/                     The 📊 Stats page and its charts
  share/[token]/             The public, read-only share page
  notifications/             Enable / turn off reminders
  api/send-reminders/        Sends due reminders (called every minute)
lib/
  streaks.js, badges.js,     Pure maths: dates in, numbers out
  stats.js, calendar.js,
  schedule.js, dates.js
  reminders.js               Finds due habits and sends pushes
  supabase/                  Database connections (browser, server, admin)
public/sw.js                 Service worker: shows notifications
scripts/reminder-clock.mjs   The local every-minute clock
supabase/*.sql               Database setup, run in order
proxy.js                     Login check before every page
```

---

## How it works

**Privacy.** Every table uses Supabase **Row Level Security**, so people can only read and change their own rows, even if the app code had a bug. Share pages are the one exception: they go through a single database function (`get_shared_habit`) that returns only the habit's name, schedule and check-off dates. It never returns an email, a reminder time or other habits.

**Time zones.** "Today" is worked out by **your browser**, not the server. A check-off at 1 AM in India counts for the right day, even though the server runs on UTC.

**Fair streaks.** A streak isn't broken until a day is actually over. Rest days in a Mon/Wed/Fri schedule are skipped. "3× a week" habits count streaks in weeks. Streaks, stats and badges all follow these same rules, so the numbers always agree.
