// Streak maths. Pure functions: dates in, numbers out (no database, no React).
// Dates are "YYYY-MM-DD" strings in the user's local time zone.
//
// Daily and "specific days" habits count streaks in DAYS: scheduled days done
// in a row, with rest days skipped. "N times a week" habits count in WEEKS:
// weeks in a row where the target was reached.

import { toDayNumber, weekStart } from "./dates.js";
import { DAILY, isScheduledOn } from "./schedule.js";

export function currentStreak(dates, today, schedule = DAILY) {
  return schedule.type === "per_week"
    ? currentWeekStreak(dates, today, schedule.timesPerWeek)
    : currentDayStreak(dates, today, schedule);
}

export function bestStreak(dates, today, schedule = DAILY) {
  return schedule.type === "per_week"
    ? bestWeekStreak(dates, today, schedule.timesPerWeek)
    : bestDayStreak(dates, today, schedule);
}

// How many times the habit was done in the week containing `today`.
export function doneThisWeek(dates, today) {
  const thisWeek = weekStart(toDayNumber(today));
  return new Set(dates.filter((d) => weekStart(toDayNumber(d)) === thisWeek)).size;
}

// ---- Day streaks (daily, specific days) ----

function currentDayStreak(dates, today, schedule) {
  const doneDays = new Set(dates.map(toDayNumber));
  if (doneDays.size === 0) return 0;
  const firstDone = Math.min(...doneDays);

  let day = toDayNumber(today);
  if (!doneDays.has(day)) day -= 1; // today isn't over yet, so the streak is still alive

  let streak = 0;
  for (; day >= firstDone; day -= 1) {
    if (!isScheduledOn(schedule, day)) continue; // rest day: skip, doesn't break the streak
    if (!doneDays.has(day)) break; // a scheduled day was missed
    streak += 1;
  }
  return streak;
}

function bestDayStreak(dates, today, schedule) {
  const doneDays = new Set(dates.map(toDayNumber));
  if (doneDays.size === 0) return 0;

  let best = 0;
  let run = 0;
  const lastDay = Math.max(toDayNumber(today), ...doneDays);
  for (let day = Math.min(...doneDays); day <= lastDay; day += 1) {
    if (!isScheduledOn(schedule, day)) continue;
    run = doneDays.has(day) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

// ---- Week streaks (N times a week) ----

// Map of week (its Monday's day number) → how many different days were done.
function countsByWeek(dates) {
  const counts = new Map();
  for (const day of new Set(dates.map(toDayNumber))) {
    const week = weekStart(day);
    counts.set(week, (counts.get(week) ?? 0) + 1);
  }
  return counts;
}

function currentWeekStreak(dates, today, target) {
  const counts = countsByWeek(dates);
  const metTarget = (week) => (counts.get(week) ?? 0) >= target;

  let week = weekStart(toDayNumber(today));
  if (!metTarget(week)) week -= 7; // this week isn't over yet, so the streak is still alive

  let streak = 0;
  while (metTarget(week)) {
    streak += 1;
    week -= 7;
  }
  return streak;
}

function bestWeekStreak(dates, today, target) {
  const counts = countsByWeek(dates);
  if (counts.size === 0) return 0;

  let best = 0;
  let run = 0;
  const thisWeek = weekStart(toDayNumber(today));
  for (let week = Math.min(...counts.keys()); week <= thisWeek; week += 7) {
    run = (counts.get(week) ?? 0) >= target ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}
