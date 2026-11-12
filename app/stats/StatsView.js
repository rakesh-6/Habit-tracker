"use client";

import { useState } from "react";
import { useToday } from "@/app/habits/useToday";
import { fromDayNumber, toDayNumber, toLocalDateString } from "@/lib/dates";
import { scheduleOf, WEEKDAY_NAMES } from "@/lib/schedule";
import { checkOffCount, combinedRate, weekdayCounts, weeklyCompletion } from "@/lib/stats";
import { formatPercent, formatShortDate, plural } from "./format";
import TrendChart from "./TrendChart";
import WeekdayChart from "./WeekdayChart";

const CHART_WEEKS = 12;
const PERIOD_WEEKS = 4;

// "use client" because the numbers depend on today's date in YOUR time zone,
// which only the browser knows.
export default function StatsView({ habits }) {
  const today = useToday();
  const [habitId, setHabitId] = useState("all");

  if (!today) return <p className="text-zinc-500">Loading stats…</p>;

  const selected = habitId === "all" ? habits : habits.filter((h) => h.id === habitId);
  const statsHabits = selected.map(toStatsHabit);
  const weeks = weeklyCompletion(statsHabits, today, CHART_WEEKS);
  const dayCounts = weekdayCounts(statsHabits, today, CHART_WEEKS);

  return (
    <div className="flex flex-col gap-6">
      {/* One filter, above everything it changes. */}
      <label className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Showing</span>
        <select
          value={habitId}
          onChange={(event) => setHabitId(event.target.value)}
          className="rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="all">All habits</option>
          {habits.map((habit) => (
            <option key={habit.id} value={habit.id}>
              {habit.name}
            </option>
          ))}
        </select>
      </label>

      <StatTiles weeks={weeks} statsHabits={statsHabits} today={today} dayCounts={dayCounts} />

      <ChartCard title="Best weekdays" subtitle={`Check-offs on each weekday, last ${CHART_WEEKS} weeks`}>
        <WeekdayChart counts={dayCounts} />
        <TableView>
          <SimpleTable
            headers={["Day", "Check-offs"]}
            rows={WEEKDAY_NAMES.map((name, i) => [name, dayCounts[i]])}
          />
        </TableView>
      </ChartCard>

      <ChartCard title="Weekly completion" subtitle="Share of scheduled check-offs done each week">
        <TrendChart weeks={weeks} />
        <TableView>
          <SimpleTable
            headers={["Week of", "Done", "Possible", "Rate"]}
            rows={weeks.map((w) => [formatShortDate(w.weekStart), w.done, w.possible, formatPercent(w.rate)])}
          />
        </TableView>
      </ChartCard>
    </div>
  );
}

// ---- The three number tiles ----

function StatTiles({ weeks, statsHabits, today, dayCounts }) {
  const rate = combinedRate(weeks.slice(-PERIOD_WEEKS));
  const previousRate = combinedRate(weeks.slice(-2 * PERIOD_WEEKS, -PERIOD_WEEKS));

  // Check-offs: the last 28 days vs the 28 days before, so both windows are the same length.
  const todayNumber = toDayNumber(today);
  const periodDays = PERIOD_WEEKS * 7;
  const checkOffs = checkOffCount(statsHabits, fromDayNumber(todayNumber - periodDays + 1), today);
  const previousCheckOffs = checkOffCount(
    statsHabits,
    fromDayNumber(todayNumber - 2 * periodDays + 1),
    fromDayNumber(todayNumber - periodDays)
  );

  const best = Math.max(...dayCounts);
  const bestDay = best > 0 ? WEEKDAY_NAMES[dayCounts.indexOf(best)] : "–";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatTile
        label="Completion rate"
        value={formatPercent(rate)}
        note={`Last ${PERIOD_WEEKS} weeks`}
        delta={rate !== null && previousRate !== null && <Delta change={Math.round((rate - previousRate) * 100)} unit="pts" />}
      />
      <StatTile
        label="Check-offs"
        value={checkOffs}
        note={`Last ${periodDays} days`}
        delta={previousCheckOffs > 0 && <Delta change={checkOffs - previousCheckOffs} unit="" />}
      />
      <StatTile
        label="Best weekday"
        value={bestDay}
        note={best > 0 ? `${plural(best, "check-off")} in ${CHART_WEEKS} weeks` : "No check-offs yet"}
      />
    </div>
  );
}

function StatTile({ label, value, note, delta }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{note}</p>
      {delta}
    </div>
  );
}

// "▲ 12 pts vs previous" in green, "▼ 3 vs previous" in red. The arrow and
// words carry the meaning too, so it never relies on colour alone.
function Delta({ change, unit }) {
  const suffix = unit ? ` ${unit}` : "";
  if (change === 0) return <p className="mt-1 text-xs text-zinc-500">Same as previous period</p>;

  const isUp = change > 0;
  return (
    <p className="mt-1 text-xs font-medium" style={{ color: isUp ? "var(--viz-good)" : "var(--viz-bad)" }}>
      {isUp ? "▲" : "▼"} {Math.abs(change)}
      {suffix} {isUp ? "up" : "down"} vs previous
    </p>
  );
}

// ---- Layout helpers ----

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-zinc-500">{subtitle}</p>
      {children}
    </section>
  );
}

// Every chart has a table twin, so no value is only reachable by hovering.
function TableView({ children }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-zinc-500 hover:text-foreground">Show as table</summary>
      <div className="mt-2 overflow-x-auto">{children}</div>
    </details>
  );
}

function SimpleTable({ headers, rows }) {
  return (
    <table className="w-full text-left tabular-nums">
      <thead className="text-zinc-500">
        <tr>
          {headers.map((header) => (
            <th key={header} className="py-1 pr-4 font-normal">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]} className="border-t border-zinc-200 dark:border-zinc-800">
            {row.map((cell, i) => (
              <td key={i} className="py-1 pr-4">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// A database row → what lib/stats.js needs. The habit "starts" on the local
// day it was created, or its earliest check-off if that's earlier.
function toStatsHabit(habit) {
  const doneDates = habit.completions.map((c) => c.completed_on);
  const createdOn = toLocalDateString(new Date(habit.created_at));
  const startDate = [createdOn, ...doneDates].sort()[0];
  return { schedule: scheduleOf(habit), doneDates, startDate };
}
