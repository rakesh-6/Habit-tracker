# Project overview
Habit Tracker is a public web app that helps people stay motivated with their habits by making progress visible. Anyone can sign up, create habits, check them off each day, and see their current and best streaks plus a history calendar of completed days. See [PRD.md](PRD.md) for details.

# Tech stack
Next.js (React, App Router) + Tailwind CSS + Supabase (Auth + Postgres with Row Level Security), deployed on Vercel.

# Commands
- Run dev server: `npm run dev` (opens at http://localhost:3000)
- Run tests: not set up yet. Ask before adding a test library.
- Lint: `npm run lint`

# Code style
- Keep functions small, name things clearly
- Add comments only where the "why" is not obvious

# Rules for Claude
- I am a beginner. Before writing code, explain your approach in 3-4 lines.
- Make small changes: one feature at a time.
- Do not add new libraries without asking me first.
- Never read, edit or print the .env file. Never hardcode secrets.
- After each change, tell me how to run it and what to expect.
