// Stats maths. Pure functions: no database, no React.
// A "stats habit" is { schedule, doneDates, startDate } with dates as "YYYY-MM-DD".
//
// Completion follows the same rules as streaks: rest days don't count, today
// only counts once it's done (the day isn't over), and an "N times a week"
// week only counts once it's over, or once its target is met.

import { fromDayNumber, toDayNumber, weekdayIndex, weekStart } from "./dates.js";
import { isScheduledOn } from "./schedule.js";

const NO_DATA = { done: 0, possible: 0 };

// Done vs possible for one habit in the week starting on `monday` (a day number).
export function habitWeek(habit, monday, todayNumber) {
  const start = toDayNumber(habit.startDate);
  const sunday = monday + 6;
  if (sunday < start || monday > todayNumber) return NO_DATA;

  const done = new Set(habit.doneDates.map(toDayNumber));
  return habit.schedule.type === "per_week"
    ? perWeekResult(habit.schedule.timesPerWeek, done, monday, start, todayNumber)
    : scheduledDaysResult(habit.schedule, done, monday, start, todayNumber);
}

function scheduledDaysResult(schedule, done, monday, start, todayNumber) {
  let doneCount = 0;
  let possible = 0;
  for (let day = Math.max(monday, start); day <= Math.min(monday + 6, todayNumber); day += 1) {
    if (!isScheduledOn(schedule, day)) continue; // rest day
    if (day === todayNumber && !done.has(day)) continue; // today isn't over yet
    possible += 1;
    if (done.has(day)) doneCount += 1;
  }
  return { done: doneCount, possible };
}

function perWeekResult(target, done, monday, start, todayNumber) {
  let count = 0;
  for (let day = Math.max(monday, start); day <= Math.min(monday + 6, todayNumber); day += 1) {
    if (done.has(day)) count += 1;
  }
  // An unfinished week (this week, or the habit's first part-week) only
  // counts once the target is met, so it can't drag the rate down early.
  const isWholeFinishedWeek = monday >= start && monday + 6 < todayNumber;
  if (!isWholeFinishedWeek && count < target) return NO_DATA;
  return { done: Math.min(count, target), possible: target };
}

// One entry per week, oldest first, ending with the week containing today.
// All the given habits are added together.
export function weeklyCompletion(habits, today, weekCount) {
  const todayNumber = toDayNumber(today);
  const thisMonday = weekStart(todayNumber);

  return Array.from({ length: weekCount }, (_, i) => {
    const monday = thisMonday - (weekCount - 1 - i) * 7;
    const total = habits.reduce(
      (sum, habit) => {
        const week = habitWeek(habit, monday, todayNumber);
        return { done: sum.done + week.done, possible: sum.possible + week.possible };
      },
      { ...NO_DATA }
    );
    return { weekStart: fromDayNumber(monday), ...total, rate: rateOf(total) };
  });
}

// Adds several weeks together into one rate (null when there's nothing to measure).
export function combinedRate(weeks) {
  const done = weeks.reduce((sum, w) => sum + w.done, 0);
  const possible = weeks.reduce((sum, w) => sum + w.possible, 0);
  return rateOf({ done, possible });
}

// Check-offs per weekday (index 0 = Mon … 6 = Sun) in the last `weekCount` weeks.
export function weekdayCounts(habits, today, weekCount) {
  const todayNumber = toDayNumber(today);
  const firstDay = weekStart(todayNumber) - (weekCount - 1) * 7;
  const counts = [0, 0, 0, 0, 0, 0, 0];

  for (const habit of habits) {
    for (const day of new Set(habit.doneDates.map(toDayNumber))) {
      if (day >= firstDay && day <= todayNumber) counts[weekdayIndex(day)] += 1;
    }
  }
  return counts;
}

// All check-offs (including rest-day extras) from `fromDate` to `toDate`, inclusive.
export function checkOffCount(habits, fromDate, toDate) {
  const from = toDayNumber(fromDate);
  const to = toDayNumber(toDate);
  return habits.reduce((sum, habit) => {
    const days = new Set(habit.doneDates.map(toDayNumber));
    return sum + [...days].filter((day) => day >= from && day <= to).length;
  }, 0);
}

function rateOf({ done, possible }) {
  return possible === 0 ? null : done / possible;
}
