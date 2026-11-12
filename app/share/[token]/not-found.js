import Link from "next/link";

// Shown for a wrong link, or one whose owner stopped sharing.
export default function SharedHabitNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 px-4 py-12 text-center">
      <h1 className="text-xl font-semibold">This link isn&apos;t available</h1>
      <p className="text-zinc-500">The link may be wrong, or its owner stopped sharing this habit.</p>
      <Link href="/login" className="text-sm font-medium underline-offset-2 hover:underline">
        Go to Habit Tracker
      </Link>
    </main>
  );
}
