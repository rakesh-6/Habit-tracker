"use client";

import HistoryCalendar from "@/app/habits/HistoryCalendar";
import StreakSummary from "@/app/habits/StreakSummary";
import { useToday } from "@/app/habits/useToday";
import { describeSchedule, scheduleOf } from "@/lib/schedule";

// The read-only card a share link shows. "use client" because streaks
// depend on today's date, which the viewer's browser works out.
export default function SharedHabitCard({ habit }) {
  const today = useToday();
  const schedule = scheduleOf(habit);
  const doneDates = habit.completions.map((c) => c.completed_on);

  return (
    <article className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <p className="text-sm text-zinc-500">
        {habit.owner ? `${habit.owner}'s habit` : "A shared habit"}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{habit.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">📅 {describeSchedule(schedule)}</p>

      {today && (
        <div className="mt-4">
          <StreakSummary doneDates={doneDates} today={today} schedule={schedule} />
          <HistoryCalendar doneDates={doneDates} today={today} schedule={schedule} />
        </div>
      )}
    </article>
  );
}
