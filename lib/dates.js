// Shared date helpers. Dates are "YYYY-MM-DD" strings in the user's local time zone.
// Turning them into whole "day numbers" makes date maths simple: the next day is +1.
// (UTC is used only for the arithmetic, so every day is exactly 24h: no
// daylight-saving surprises.)

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// "2026-11-12" → a whole number of days since 1 Jan 1970.
export function toDayNumber(date) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

// The reverse: a day number → "2026-11-12".
export function fromDayNumber(dayNumber) {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

// 0 = Monday … 6 = Sunday.
export function weekdayIndex(dayNumber) {
  const sundayFirst = new Date(dayNumber * MS_PER_DAY).getUTCDay(); // 0 = Sunday
  return (sundayFirst + 6) % 7;
}

// A JavaScript Date → "YYYY-MM-DD" in the time zone of whoever runs this.
// In the browser that's the user's own time zone.
export function toLocalDateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// The day number of the Monday that starts this day's week.
export function weekStart(dayNumber) {
  return dayNumber - weekdayIndex(dayNumber);
}
