"use client";

import { useState } from "react";
import { WEEKDAY_NAMES } from "@/lib/schedule";
import { plural } from "./format";

const PLOT_HEIGHT = 128; // px

// Check-offs per weekday as columns. The best day is the accent colour and
// labelled; the rest are grey context. Hover or Tab onto a column for its value.
export default function WeekdayChart({ counts }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...counts);
  const best = max > 0 ? counts.indexOf(max) : -1;
  const ticks = niceTicks(max);
  const top = ticks.at(-1);

  return (
    <div>
      <div className="relative ml-8" style={{ height: PLOT_HEIGHT }}>
        {ticks.map((tick) => (
          <Gridline key={tick} percent={(tick / top) * 100} label={tick} isBaseline={tick === 0} />
        ))}

        <div className="absolute inset-0 flex">
          {counts.map((count, i) => (
            <div
              key={WEEKDAY_NAMES[i]}
              tabIndex={0}
              aria-label={`${WEEKDAY_NAMES[i]}: ${plural(count, "check-off")}`}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="relative flex flex-1 items-end justify-center rounded outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <Column count={count} top={top} isBest={i === best} isActive={i === active} />
              {active === i && <Tooltip count={count} day={WEEKDAY_NAMES[i]} percent={(count / top) * 100} />}
            </div>
          ))}
        </div>
      </div>

      <div className="ml-8 mt-1 flex text-xs text-zinc-500" aria-hidden="true">
        {WEEKDAY_NAMES.map((name) => (
          <span key={name} className="flex-1 text-center">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function Column({ count, top, isBest, isActive }) {
  const percent = (count / top) * 100;
  return (
    <>
      {isBest && (
        <span
          className="absolute text-xs font-medium"
          style={{ bottom: `calc(${percent}% + 4px)` }}
          aria-hidden="true"
        >
          {count}
        </span>
      )}
      <span
        className="w-3/5 max-w-6 rounded-t transition-opacity"
        style={{
          height: `${percent}%`,
          background: isBest ? "var(--viz-accent)" : "var(--viz-context)",
          opacity: isActive ? 0.75 : 1,
        }}
      />
    </>
  );
}

function Tooltip({ count, day, percent }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-zinc-200 bg-background px-2 py-1 text-xs shadow-sm dark:border-zinc-800"
      style={{ bottom: `calc(${percent}% + 22px)` }}
    >
      <strong className="text-sm">{count}</strong>{" "}
      <span className="text-zinc-500">
        {count === 1 ? "check-off" : "check-offs"} · {day}
      </span>
    </div>
  );
}

// A hairline across the plot at `percent` height, with its value on the left.
export function Gridline({ percent, label, isBaseline }) {
  return (
    <div className="absolute inset-x-0" style={{ bottom: `${percent}%` }} aria-hidden="true">
      <div
        className="h-px w-full"
        style={{ background: isBaseline ? "var(--viz-axis)" : "var(--viz-grid)" }}
      />
      <span className="absolute -left-8 w-7 -translate-y-1/2 text-right text-[11px] tabular-nums text-zinc-500">
        {label}
      </span>
    </div>
  );
}

// Three clean whole-number ticks from 0, e.g. max 7 → [0, 4, 8].
function niceTicks(max) {
  const step = Math.max(1, Math.ceil(max / 2));
  return [0, step, step * 2];
}
