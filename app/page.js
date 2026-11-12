import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";
import { createHabit } from "./habits/actions";
import HabitItem from "./habits/HabitItem";
import ScheduleFields from "./habits/ScheduleFields";
import TimeZoneInput from "./habits/TimeZoneInput";
import ReminderToggle from "./notifications/ReminderToggle";

export default function Home({ searchParams }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Habit Tracker</h1>
        <div className="flex items-center gap-3">
          <Link href="/stats" className="text-sm font-medium hover:underline">
            📊 Stats
          </Link>
          {/* Reading the login cookie happens per request, so Next.js needs it
              inside <Suspense>. The rest of the page loads instantly. */}
          <Suspense fallback={<span className="text-sm text-zinc-500">Loading…</span>}>
            <CurrentUser />
          </Suspense>
          <form action={logout}>
            <button className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
              Log out
            </button>
          </form>
        </div>
      </header>

      <Suspense>
        <ErrorMessage searchParams={searchParams} />
      </Suspense>

      <ReminderToggle />

      <AddHabitForm />

      <Suspense fallback={<p className="text-zinc-500">Loading habits…</p>}>
        <HabitList />
      </Suspense>
    </main>
  );
}

async function CurrentUser() {
  const supabase = await createClient();
  // proxy.js already redirects logged-out visitors, but we check again here
  // because this is what actually shows the user's data.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
      {displayName(user)}
    </span>
  );
}

// Accounts created before usernames existed have none saved,
// so fall back to the part of the email before the "@".
function displayName(user) {
  return user.user_metadata?.username || user.email.split("@")[0];
}

async function ErrorMessage({ searchParams }) {
  const { error } = await searchParams;
  if (!error) return null;

  return (
    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
      {error}
    </p>
  );
}

function AddHabitForm() {
  return (
    <form action={createHabit} className="flex flex-wrap gap-2">
      <TimeZoneInput />
      <input
        name="name"
        required
        maxLength={100}
        placeholder="New habit, e.g. Read 10 pages"
        className="min-w-40 flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
      />
      <input
        name="reminder_time"
        type="time"
        aria-label="Reminder time (optional)"
        title="Reminder time (optional)"
        className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
      />
      <button className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
        Add
      </button>
      <ScheduleFields />
    </form>
  );
}

async function HabitList() {
  const supabase = await createClient();
  // Row Level Security filters this down to the logged-in user's habits.
  // Each habit comes with all its check-off dates: the browser uses them to
  // work out "done today?" and the streaks, in its own time zone.
  const { data: habits, error } = await supabase
    .from("habits")
    .select(
      "id, name, reminder_time, schedule_type, schedule_days, times_per_week, share_token, completions(completed_on)"
    )
    .order("created_at");

  if (error) {
    return <p className="text-sm text-red-600">Couldn&apos;t load habits: {error.message}</p>;
  }

  if (habits.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
        No habits yet. Add one above.
      </section>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {habits.map((habit) => (
        <HabitItem key={editKey(habit)} habit={habit} />
      ))}
    </ul>
  );
}

// Everything you can edit is part of the key, so a saved edit gives the row a
// new key: React then starts it fresh, which closes its edit box.
function editKey(habit) {
  const { id, name, reminder_time, schedule_type, schedule_days, times_per_week } = habit;
  return [id, name, reminder_time, schedule_type, schedule_days, times_per_week].join("|");
}
