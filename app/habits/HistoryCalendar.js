import { calendarWeeks } from "@/lib/calendar";
import { toDayNumber } from "@/lib/dates";
import { DAILY, isScheduledOn } from "@/lib/schedule";

const WEEKS_SHOWN = 12;
// Label every other row so the labels stay readable at this small size.
const WEEKDAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

// A small grid of the last 12 weeks: one column per week (oldest on the left),
// one square per day (Monday at the top). Green = done, faint = rest day.
export default function HistoryCalendar({ doneDates, today, schedule = DAILY }) {
  const done = new Set(doneDates);
  const weeks = calendarWeeks(today, WEEKS_SHOWN);
  const pastDays = weeks.flat().filter((day) => !day.isFuture);
  const doneCount = pastDays.filter((day) => done.has(day.date)).length;

  return (
    <div
      role="img"
      aria-label={`Done on ${doneCount} of the last ${pastDays.length} days`}
      className="mt-2 flex gap-0.5"
    >
      <div className="mr-1 grid grid-rows-7 gap-0.5 text-[9px] leading-3 text-zinc-500">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="h-3">
            {label}
          </span>
        ))}
      </div>
      {weeks.map((week) => (
        <div key={week[0].date} className="grid grid-rows-7 gap-0.5">
          {week.map((day) => (
            <DaySquare
              key={day.date}
              day={day}
              isDone={done.has(day.date)}
              isToday={day.date === today}
              isRestDay={!isScheduledOn(schedule, toDayNumber(day.date))}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function DaySquare({ day, isDone, isToday, isRestDay }) {
  // Future days are empty space, so the grid keeps its rectangle shape.
  if (day.isFuture) return <span className="h-3 w-3" />;

  const color = isDone
    ? "bg-green-600"
    : isRestDay
      ? "bg-zinc-100 dark:bg-zinc-900"
      : "bg-zinc-200 dark:bg-zinc-800";
  const outline = isToday ? "ring-1 ring-zinc-500 ring-offset-1 ring-offset-background" : "";
  const status = isDone ? "done ✓" : isRestDay ? "rest day" : "not done";

  return (
    <span
      title={`${formatDate(day.date)}: ${status}`}
      className={`h-3 w-3 rounded-sm ${color} ${outline}`}
    />
  );
}

// "2026-11-12" → "Thu, 12 Nov" (in the viewer's own language settings)
function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
