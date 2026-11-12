# Project: Habit Tracker

## Problem
People start new habits with good intentions but lose motivation after a few days, because they can't see their progress. Without visible streaks and history, there's nothing pulling them back the next day.

## Users
Anyone. It's a public web app where any member of the public can sign up and track their own habits privately.

## MVP features (max 5, the smallest version that works)
1. **Sign up / log in.** Create an account with email and password, log in and log out. Each user sees only their own habits.
2. **Create, edit and delete habits.** Add a habit (e.g. "Read 10 pages"), rename it, or remove it.
3. **Daily check-off.** Mark a habit done for today with one tap, and undo it.
4. **Streak counter.** Show the current streak and best streak for each habit.
5. **History calendar.** A grid showing which days each habit was completed over recent weeks.

## Later / nice-to-have
- Weekly or custom schedules (e.g. Mon/Wed/Fri, or 3 times a week)
- Stats and charts (completion rate, best weekdays, trends)
- Milestone badges (7, 30, 100 days) and sharing streaks with friends

## Tech stack
- **Frontend:** Next.js (React) with Tailwind CSS
- **Backend:** Supabase (auth plus auto-generated database API), called from Next.js. No separate server to build.
- **Database:** Supabase Postgres (tables: `habits`, `completions`), with Row Level Security so users can only read and write their own rows
- **Hosting:** Vercel (Next.js app) + Supabase free tier

**Why this stack suits a beginner:**
- **One language.** Everything is JavaScript/TypeScript, so there's no switching between languages for frontend and backend.
- **Login is built in.** Supabase Auth handles sign-up, login, password hashing and sessions. Writing that yourself is hard and easy to get wrong, and the app needs it because it's public.
- **No backend server to maintain.** Supabase gives you a database and an API straight away. Next.js can still run server code if you need it later.
- **Free and simple to deploy.** You push to GitHub and Vercel deploys it. Both have free tiers.
- **Widely used.** There are plenty of tutorials and examples for Next.js + Supabase, which helps when you get stuck.

Next.js has more concepts to learn than plain React (routing, server vs. client components). To keep it manageable, stick to the App Router and follow Supabase's official Next.js quickstart.

## Out of scope (what I will NOT build now)
- Payments, subscriptions or a premium tier. The app is free for everyone.

## Done when
- A user can sign up, create a habit, check it off on several days, and see their streak and history calendar update, all end to end.
- It is deployed on Vercel with a public URL and has a README explaining what it is and how to run it locally.
