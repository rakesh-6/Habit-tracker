import * as webpush from "web-push";
import { fromDayNumber, toDayNumber, weekStart } from "@/lib/dates";
import { isScheduledOn, scheduleOf } from "@/lib/schedule";
import { createAdminClient, requireEnv } from "@/lib/supabase/admin";

// A reminder may fire up to this many minutes late (e.g. if a scheduler run
// was skipped), but no later, so a 7:00 habit added at noon doesn't fire at once.
const LATE_WINDOW_MINUTES = 15;

// Finds habits whose reminder time has just arrived (in each user's own
// time zone) and pushes a notification to every browser that user enabled.
export async function sendDueReminders(now = new Date()) {
  webpush.setVapidDetails(
    requireEnv("VAPID_SUBJECT"),
    requireEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY"),
    requireEnv("VAPID_PRIVATE_KEY")
  );
  const supabase = createAdminClient();

  const { data: habits, error } = await supabase
    .from("habits")
    .select(
      "id, user_id, name, reminder_time, time_zone, last_reminded_on, schedule_type, schedule_days, times_per_week"
    )
    .not("reminder_time", "is", null);
  if (error) throw new Error(error.message);

  let due = 0;
  let sent = 0;
  for (const habit of habits) {
    const today = dueDate(habit, now);
    if (!today || !(await needsReminder(supabase, habit, today))) continue;
    due += 1;
    if (await claimReminder(supabase, habit.id, today)) {
      sent += await notifyUser(supabase, habit);
    }
  }

  return { checked: habits.length, due, sent };
}

// Returns the user's local date if this habit should be reminded now, else null.
function dueDate(habit, now) {
  const local = localDateAndMinutes(now, habit.time_zone);
  const minutesLate = local.minutes - toMinutes(habit.reminder_time);
  const isDue =
    habit.last_reminded_on !== local.date &&
    minutesLate >= 0 &&
    minutesLate < LATE_WINDOW_MINUTES;
  return isDue ? local.date : null;
}

// No nudge needed on a rest day, if it's already done today, or (for
// "N times a week" habits) if this week's target is already met.
async function needsReminder(supabase, habit, today) {
  const schedule = scheduleOf(habit);
  const todayNumber = toDayNumber(today);
  if (!isScheduledOn(schedule, todayNumber)) return false;

  const { data, error } = await supabase
    .from("completions")
    .select("completed_on")
    .eq("habit_id", habit.id)
    .gte("completed_on", fromDayNumber(weekStart(todayNumber)));
  if (error) throw new Error(error.message);

  const doneThisWeek = data.map((row) => row.completed_on);
  if (doneThisWeek.includes(today)) return false;
  return schedule.type !== "per_week" || doneThisWeek.length < schedule.timesPerWeek;
}

// Marks the habit as reminded for `date`. The database only lets one caller
// win this, so two overlapping runs never send the same reminder twice.
async function claimReminder(supabase, habitId, date) {
  const { data, error } = await supabase
    .from("habits")
    .update({ last_reminded_on: date })
    .eq("id", habitId)
    .or(`last_reminded_on.is.null,last_reminded_on.neq.${date}`)
    .select("id");
  if (error) throw new Error(error.message);
  return data.length > 0;
}

// Sends the reminder to each of the user's browsers. Returns how many succeeded.
async function notifyUser(supabase, habit) {
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", habit.user_id);
  if (error) throw new Error(error.message);

  const payload = JSON.stringify({
    title: "⏰ Habit reminder",
    body: `Time for: ${habit.name}`,
    tag: habit.id,
    url: "/",
  });

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent += 1;
    } catch (err) {
      await handleSendError(supabase, sub, err);
    }
  }
  return sent;
}

// 404/410 mean the browser unsubscribed or the address expired: forget it.
async function handleSendError(supabase, sub, err) {
  if (err.statusCode === 404 || err.statusCode === 410) {
    await supabase.from("push_subscriptions").delete().eq("id", sub.id);
  } else {
    console.error("Push failed:", err.statusCode, err.body ?? err.message);
  }
}

// "07:30:00" → 450
function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// What date and time is it right now for someone in `timeZone`?
function localDateAndMinutes(now, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}
