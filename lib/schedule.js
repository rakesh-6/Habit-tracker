// How often a habit should be done. Pure functions: no database, no React.
//
// A schedule is { type, days, timesPerWeek }:
//   { type: "daily" }                          every day
//   { type: "days", days: [0, 2, 4] }          specific weekdays (0 = Mon … 6 = Sun)
//   { type: "per_week", timesPerWeek: 3 }      N times a week, on any days

import { weekdayIndex } from "./dates.js";

export const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAILY = { type: "daily", days: [], timesPerWeek: null };

// Turns a habit row from the database into a schedule object.
export function scheduleOf(habit) {
  const type = habit.schedule_type ?? "daily";
  const days = habit.schedule_days ?? [];
  // Safety net: a "days" schedule with no days would never be due, so treat it as daily.
  if (type === "days" && days.length === 0) return DAILY;
  return { type, days, timesPerWeek: habit.times_per_week ?? null };
}

// Is the habit expected on this day? Only "specific days" habits have rest days.
export function isScheduledOn(schedule, dayNumber) {
  return schedule.type !== "days" || schedule.days.includes(weekdayIndex(dayNumber));
}

// "Every day" / "Mon, Wed, Fri" / "3× a week"
export function describeSchedule(schedule) {
  if (schedule.type === "days") return schedule.days.map((d) => WEEKDAY_NAMES[d]).join(", ");
  if (schedule.type === "per_week") return `${schedule.timesPerWeek}× a week`;
  return "Every day";
}
