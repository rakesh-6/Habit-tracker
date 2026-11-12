"use client";

import { useState } from "react";
import { WEEKDAY_NAMES } from "@/lib/schedule";

const fieldStyle =
  "rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800";
const NEW_HABIT_DAYS = [0, 2, 4]; // Mon/Wed/Fri as a starting suggestion
const TIMES_OPTIONS = [1, 2, 3, 4, 5, 6];

// The "how often?" part of the add and edit forms. "use client" because the
// extra fields appear and disappear as you change the dropdown.
export default function ScheduleFields({ schedule }) {
  const [type, setType] = useState(schedule?.type ?? "daily");

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <select
        name="schedule_type"
        value={type}
        onChange={(event) => setType(event.target.value)}
        aria-label="How often"
        className={fieldStyle}
      >
        <option value="daily">Every day</option>
        <option value="days">On specific days</option>
        <option value="per_week">Times a week</option>
      </select>

      {type === "days" && (
        <DayPicker selected={schedule?.type === "days" ? schedule.days : NEW_HABIT_DAYS} />
      )}

      {type === "per_week" && (
        <select
          name="times_per_week"
          defaultValue={schedule?.timesPerWeek ?? 3}
          aria-label="Times per week"
          className={fieldStyle}
        >
          {TIMES_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}× a week
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// Seven toggle buttons. Each is a real checkbox (hidden) with a styled label,
// so the browser sends every ticked day as "schedule_days".
function DayPicker({ selected }) {
  return (
    <fieldset className="flex gap-1">
      <legend className="sr-only">Days</legend>
      {WEEKDAY_NAMES.map((name, index) => (
        <label key={name} className="cursor-pointer" title={name}>
          <input
            type="checkbox"
            name="schedule_days"
            value={index}
            defaultChecked={selected.includes(index)}
            className="peer sr-only"
          />
          <span className="block rounded-md border border-zinc-300 px-2 py-1 text-xs peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-400 dark:border-zinc-700 dark:peer-checked:border-white dark:peer-checked:bg-white dark:peer-checked:text-black">
            {name.slice(0, 2)}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
