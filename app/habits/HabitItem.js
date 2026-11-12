"use client";

import { useState } from "react";
import { deleteHabit, toggleCompletion, updateHabit } from "./actions";
import HistoryCalendar from "./HistoryCalendar";
import ScheduleFields from "./ScheduleFields";
import { ShareButton, SharedLinkBar } from "./ShareControls";
import StreakSummary from "./StreakSummary";
import TimeZoneInput from "./TimeZoneInput";
import { useToday } from "./useToday";
import { describeSchedule, scheduleOf } from "@/lib/schedule";

const buttonStyle =
  "rounded-lg border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";
const inputStyle =
  "rounded-lg border border-zinc-300 px-3 py-1 dark:border-zinc-700 dark:bg-zinc-800";

// "use client" because switching between viewing and editing is
// browser-side state. Saving and deleting still run on the server.
export default function HabitItem({ habit }) {
  const [isEditing, setIsEditing] = useState(false);
  const today = useToday();
  const schedule = scheduleOf(habit);
  const doneDates = habit.completions.map((c) => c.completed_on);
  const isDoneToday = doneDates.includes(today);

  if (isEditing) {
    return (
      <li className="flex flex-wrap items-center gap-2 py-3">
        <form action={updateHabit} className="flex flex-1 flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={habit.id} />
          <TimeZoneInput />
          <input
            name="name"
            defaultValue={habit.name}
            required
            maxLength={100}
            autoFocus
            aria-label="Habit name"
            className={`min-w-40 flex-1 ${inputStyle}`}
          />
          <input
            name="reminder_time"
            type="time"
            // Postgres returns "07:30:00"; the time picker wants "07:30".
            defaultValue={habit.reminder_time?.slice(0, 5) ?? ""}
            aria-label="Reminder time (optional)"
            className={inputStyle}
          />
          <button className={buttonStyle}>Save</button>
          <ScheduleFields schedule={schedule} />
        </form>
        <button onClick={() => setIsEditing(false)} className={buttonStyle}>
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-2 py-3">
      <CheckOffButton habit={habit} today={today} isDone={isDoneToday} />
      <div className="flex-1">
        <span className={isDoneToday ? "text-zinc-500 line-through" : ""}>{habit.name}</span>
        {schedule.type !== "daily" && (
          <span className="ml-2 text-sm text-zinc-500">📅 {describeSchedule(schedule)}</span>
        )}
        {habit.reminder_time && (
          <span className="ml-2 text-sm text-zinc-500">⏰ {formatTime(habit.reminder_time)}</span>
        )}
        {today && (
          <>
            <StreakSummary doneDates={doneDates} today={today} schedule={schedule} />
            <HistoryCalendar doneDates={doneDates} today={today} schedule={schedule} />
          </>
        )}
        {habit.share_token && <SharedLinkBar habitId={habit.id} token={habit.share_token} />}
      </div>
      <button onClick={() => setIsEditing(true)} className={buttonStyle}>
        Edit
      </button>
      {!habit.share_token && <ShareButton habitId={habit.id} className={buttonStyle} />}
      <form action={deleteHabit}>
        <input type="hidden" name="id" value={habit.id} />
        <button onClick={confirmDelete(habit.name)} className={buttonStyle}>
          Delete
        </button>
      </form>
    </li>
  );
}

// The round checkbox. It's disabled for a split second on first load,
// until the browser has worked out today's date.
function CheckOffButton({ habit, today, isDone }) {
  const label = isDone ? `Undo "${habit.name}" for today` : `Mark "${habit.name}" done for today`;

  return (
    <form action={toggleCompletion}>
      <input type="hidden" name="id" value={habit.id} />
      <input type="hidden" name="completed_on" value={today ?? ""} />
      <input type="hidden" name="done" value={String(isDone)} />
      <button
        disabled={!today}
        aria-label={label}
        title={label}
        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold disabled:opacity-50 ${
          isDone
            ? "border-green-600 bg-green-600 text-white"
            : "border-zinc-400 hover:border-green-600 dark:border-zinc-600"
        }`}
      >
        {isDone ? "✓" : ""}
      </button>
    </form>
  );
}

function confirmDelete(name) {
  return (event) => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) {
      event.preventDefault();
    }
  };
}

// "07:30:00" → "7:30 AM"
function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours < 12 ? "AM" : "PM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
