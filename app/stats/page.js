import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import StatsView from "./StatsView";

export const metadata = { title: "Stats · Habit Tracker" };

export default function StatsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Stats</h1>
        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Habits
        </Link>
      </header>

      {/* Reading the login cookie happens per request, so it goes inside <Suspense>. */}
      <Suspense fallback={<p className="text-zinc-500">Loading stats…</p>}>
        <StatsData />
      </Suspense>
    </main>
  );
}

async function StatsData() {
  const supabase = await createClient();
  // Row Level Security limits this to the logged-in user's own habits.
  const { data: habits, error } = await supabase
    .from("habits")
    .select(
      "id, name, created_at, schedule_type, schedule_days, times_per_week, completions(completed_on)"
    )
    .order("created_at");

  if (error) {
    return <p className="text-sm text-red-600">Couldn&apos;t load stats: {error.message}</p>;
  }

  if (habits.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
        Add a habit first, then come back here to see your stats.
      </section>
    );
  }

  return <StatsView habits={habits} />;
}
