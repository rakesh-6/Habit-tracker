"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_NAME_LENGTH = 100;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function readId(formData) {
  return String(formData.get("id") ?? "");
}

function backHomeWithError(text) {
  redirect(`/?error=${encodeURIComponent(text)}`);
}

function readName(formData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) backHomeWithError("Habit name can't be empty.");
  if (name.length > MAX_NAME_LENGTH) {
    backHomeWithError(`Habit name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  }
  return name;
}

// The browser's time picker sends "HH:MM". Empty means "no reminder".
function readReminderTime(formData) {
  const time = String(formData.get("reminder_time") ?? "").trim();
  if (!time) return null;
  if (!TIME_PATTERN.test(time)) backHomeWithError("Reminder time must look like 07:30.");
  return time;
}

function readTimeZone(formData) {
  const timeZone = String(formData.get("time_zone") ?? "");
  if (!timeZone) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }); // throws if not a real time zone
    return timeZone;
  } catch {
    return null;
  }
}

// Returns the three schedule columns. The database double-checks these too.
function readSchedule(formData) {
  const type = String(formData.get("schedule_type") ?? "daily");
  const daily = { schedule_type: "daily", schedule_days: [], times_per_week: null };

  if (type === "days") {
    const days = [...new Set(formData.getAll("schedule_days").map(Number))]
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      .sort((a, b) => a - b);
    if (days.length === 0) backHomeWithError("Pick at least one day for this habit.");
    if (days.length === 7) return daily; // every day ticked is just "daily"
    return { schedule_type: "days", schedule_days: days, times_per_week: null };
  }

  if (type === "per_week") {
    const times = Number(formData.get("times_per_week"));
    if (!Number.isInteger(times) || times < 1 || times > 6) {
      backHomeWithError("Times a week must be between 1 and 6.");
    }
    return { schedule_type: "per_week", schedule_days: [], times_per_week: times };
  }

  return daily;
}

function readHabitFields(formData) {
  return {
    name: readName(formData),
    reminder_time: readReminderTime(formData),
    time_zone: readTimeZone(formData),
    ...readSchedule(formData),
  };
}

export async function createHabit(formData) {
  const fields = readHabitFields(formData);

  const supabase = await createClient();
  // No user_id here on purpose: the database fills it in from the login.
  const { error } = await supabase.from("habits").insert(fields);

  if (error) backHomeWithError(error.message);
  redirect("/");
}

export async function updateHabit(formData) {
  const fields = readHabitFields(formData);

  const supabase = await createClient();
  // Row Level Security means this can only ever change the user's own habits.
  const { error } = await supabase
    .from("habits")
    .update(fields)
    .eq("id", readId(formData));

  if (error) backHomeWithError(error.message);
  redirect("/");
}

// The browser sends its own "today". In every time zone on Earth, today is
// within a day or so of the server's date, so anything further off is rejected
// (this stops checking off days in the far past or future).
function readCompletedOn(formData) {
  const date = String(formData.get("completed_on") ?? "");
  const isNearToday =
    DATE_PATTERN.test(date) &&
    Math.abs(Date.parse(`${date}T00:00:00Z`) - Date.now()) < 2 * ONE_DAY_MS;
  if (!isNearToday) backHomeWithError("Couldn't tell today's date. Please reload and try again.");
  return date;
}

// The form says whether the habit is currently done, and we flip it.
// Both directions are safe to repeat: tapping twice can't add a duplicate.
export async function toggleCompletion(formData) {
  const habitId = readId(formData);
  const completedOn = readCompletedOn(formData);
  const isDone = formData.get("done") === "true";

  const supabase = await createClient();
  const completions = supabase.from("completions");
  const { error } = isDone
    ? await completions.delete().eq("habit_id", habitId).eq("completed_on", completedOn)
    : await completions.upsert(
        { habit_id: habitId, completed_on: completedOn },
        { onConflict: "habit_id,completed_on", ignoreDuplicates: true }
      );

  if (error) backHomeWithError(error.message);
  redirect("/");
}

// A fresh random link code every time, so a link you stopped sharing
// never starts working again.
export async function shareHabit(formData) {
  await setShareToken(readId(formData), crypto.randomUUID());
}

export async function stopSharing(formData) {
  await setShareToken(readId(formData), null);
}

async function setShareToken(habitId, token) {
  const supabase = await createClient();
  // Row Level Security means you can only share your own habits.
  const { error } = await supabase
    .from("habits")
    .update({ share_token: token })
    .eq("id", habitId);

  if (error) backHomeWithError(error.message);
  redirect("/");
}

export async function deleteHabit(formData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", readId(formData));

  if (error) backHomeWithError(error.message);
  redirect("/");
}
