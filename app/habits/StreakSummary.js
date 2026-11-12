import { earnedBadges, nextBadge, streakUnit } from "@/lib/badges";
import { toDayNumber } from "@/lib/dates";
import { isScheduledOn } from "@/lib/schedule";
import { bestStreak, currentStreak, doneThisWeek } from "@/lib/streaks";

// The 🔥 / 🏆 streak line plus milestone badges. Used on the habit list
// and on public share pages, so both always show the same numbers.
export default function StreakSummary({ doneDates, today, schedule }) {
  const unit = streakUnit(schedule);
  const current = currentStreak(doneDates, today, schedule);
  const best = bestStreak(doneDates, today, schedule);

  return (
    <>
      <p className="mt-0.5 text-xs text-zinc-500">
        🔥 {count(current, unit)} · 🏆 Best: {count(best, unit)}
        {schedule.type === "per_week" &&
          ` · This week: ${doneThisWeek(doneDates, today)}/${schedule.timesPerWeek}`}
        {!isScheduledOn(schedule, toDayNumber(today)) && " · Rest day today"}
      </p>
      <Badges best={best} current={current} unit={unit} />
    </>
  );
}

function Badges({ best, current, unit }) {
  const earned = earnedBadges(best, unit);
  const next = nextBadge(best, current, unit);

  return (
    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
      {earned.map((badge) => (
        <span
          key={badge.goal}
          title={`Earned: a ${badge.goal}-${unit} streak`}
          className="rounded-full border border-zinc-300 px-2 py-0.5 dark:border-zinc-700"
        >
          {badge.icon} {badge.goal}-{unit}
        </span>
      ))}
      {next ? (
        <span className="text-zinc-500">
          {count(next.toGo, unit)} to {next.icon} {next.goal}-{unit}
        </span>
      ) : (
        <span className="text-zinc-500">Every badge earned 🎉</span>
      )}
    </p>
  );
}

// count(1, "day") → "1 day", count(3, "week") → "3 weeks"
function count(n, unit) {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}
