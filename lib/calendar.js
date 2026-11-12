// Builds the dates for the history grid. Pure function: no database, no React.

import { fromDayNumber, toDayNumber, weekStart } from "./dates.js";

// Returns `weekCount` weeks, oldest first, each a list of 7 days (Monday → Sunday).
// The last week is the one containing `today`; its days after today are marked
// isFuture so they can be drawn as blanks.
export function calendarWeeks(today, weekCount) {
  const todayNumber = toDayNumber(today);
  const firstMonday = weekStart(todayNumber) - (weekCount - 1) * 7;

  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const dayNumber = firstMonday + week * 7 + weekday;
      return { date: fromDayNumber(dayNumber), isFuture: dayNumber > todayNumber };
    })
  );
}
