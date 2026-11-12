import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import SharedHabitCard from "./SharedHabitCard";

// Shared links are private-ish: keep them out of search engines.
export const metadata = {
  title: "Shared habit · Habit Tracker",
  robots: { index: false, follow: false },
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SharePage({ params }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      {/* The token in the URL is only known per request, so it's read inside <Suspense>. */}
      <Suspense fallback={<p className="text-center text-zinc-500">Loading…</p>}>
        <SharedHabit params={params} />
      </Suspense>
      <p className="text-center text-sm text-zinc-500">
        Build your own streaks with{" "}
        <Link href="/login" className="font-medium underline-offset-2 hover:underline">
          Habit Tracker
        </Link>
      </p>
    </main>
  );
}

async function SharedHabit({ params }) {
  const { token } = await params;
  if (!UUID_PATTERN.test(token)) notFound();

  const supabase = await createClient();
  // The database function returns only this habit's public details,
  // or null if the link doesn't exist or sharing was switched off.
  const { data: habit, error } = await supabase.rpc("get_shared_habit", { token });

  if (error) {
    return <p className="text-center text-sm text-red-600">Couldn&apos;t load this habit: {error.message}</p>;
  }
  if (!habit) notFound();

  return <SharedHabitCard habit={habit} />;
}
