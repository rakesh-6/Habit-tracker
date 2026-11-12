"use client";

import { useEffect, useRef, useState } from "react";
import { formatPercent, formatShortDate } from "./format";

const HEIGHT = 168;
const PAD = { top: 12, right: 44, bottom: 24, left: 36 }; // room for labels
const TICKS = [0, 0.5, 1];

// Weekly completion rate as a line. Weeks with nothing to measure (rate null)
// leave a gap instead of pretending to be 0%.
export default function TrendChart({ weeks }) {
  const [boxRef, width] = useElementWidth();
  const [active, setActive] = useState(null);

  const plotWidth = Math.max(width - PAD.left - PAD.right, 0);
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (i * plotWidth) / Math.max(weeks.length - 1, 1);
  const y = (rate) => PAD.top + (1 - rate) * plotHeight;
  const lastIndex = weeks.findLastIndex((week) => week.rate !== null);

  // Snap the pointer to the nearest week: readers aim at a date, not a 2px line.
  function handlePointerMove(event) {
    const left = event.currentTarget.getBoundingClientRect().left;
    const step = plotWidth / Math.max(weeks.length - 1, 1);
    const i = Math.round((event.clientX - left - PAD.left) / step);
    setActive(Math.min(Math.max(i, 0), weeks.length - 1));
  }

  function handleKeyDown(event) {
    const moves = { ArrowLeft: -1, ArrowRight: 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const from = active ?? weeks.length - 1;
    setActive(Math.min(Math.max(from + moves[event.key], 0), weeks.length - 1));
  }

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      aria-label={`Weekly completion rate for the last ${weeks.length} weeks. Use the left and right arrow keys to read each week.`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setActive(null)}
      onFocus={() => setActive(weeks.length - 1)}
      onBlur={() => setActive(null)}
      onKeyDown={handleKeyDown}
      className="relative rounded outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      style={{ height: HEIGHT }}
    >
      {width > 0 && (
        <svg width={width} height={HEIGHT} aria-hidden="true" className="overflow-visible">
          {TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={PAD.left + plotWidth}
                y1={y(tick)}
                y2={y(tick)}
                style={{ stroke: tick === 0 ? "var(--viz-axis)" : "var(--viz-grid)" }}
                strokeWidth={1}
              />
              <text x={PAD.left - 6} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-zinc-500 text-[11px] tabular-nums">
                {formatPercent(tick)}
              </text>
            </g>
          ))}

          {xLabelIndexes(weeks.length).map((i) => (
            <text key={i} x={x(i)} y={HEIGHT - 6} textAnchor={i === 0 ? "start" : i === weeks.length - 1 ? "end" : "middle"} className="fill-zinc-500 text-[11px]">
              {i === weeks.length - 1 ? "This week" : formatShortDate(weeks[i].weekStart)}
            </text>
          ))}

          <path
            d={linePath(weeks, x, y)}
            fill="none"
            style={{ stroke: "var(--viz-accent)" }}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotHeight} style={{ stroke: "var(--viz-axis)" }} strokeWidth={1} />
          )}

          {/* End dot + its value: the one label the line carries. */}
          {lastIndex >= 0 && (
            <>
              <Dot cx={x(lastIndex)} cy={y(weeks[lastIndex].rate)} />
              <text x={x(lastIndex) + 8} y={y(weeks[lastIndex].rate)} dy="0.32em" className="fill-current text-xs font-medium">
                {formatPercent(weeks[lastIndex].rate)}
              </text>
            </>
          )}

          {active !== null && weeks[active].rate !== null && active !== lastIndex && (
            <Dot cx={x(active)} cy={y(weeks[active].rate)} />
          )}
        </svg>
      )}

      {active !== null && <Tooltip week={weeks[active]} left={x(active)} width={width} />}
    </div>
  );
}

// 8px dot with a 2px ring in the page colour, so it stays crisp on the line.
function Dot({ cx, cy }) {
  return <circle cx={cx} cy={cy} r={4} style={{ fill: "var(--viz-accent)", stroke: "var(--background)" }} strokeWidth={2} />;
}

function Tooltip({ week, left, width }) {
  const clampedLeft = Math.min(Math.max(left, 70), width - 70); // keep it inside the box
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-200 bg-background px-2 py-1 text-xs shadow-sm dark:border-zinc-800"
      style={{ left: clampedLeft }}
    >
      <strong className="text-sm">{formatPercent(week.rate)}</strong>{" "}
      <span className="text-zinc-500">
        {week.rate === null ? "nothing to measure" : `${week.done} of ${week.possible} done`} · week of{" "}
        {formatShortDate(week.weekStart)}
      </span>
    </div>
  );
}

// "M x y L x y …", starting a new piece (M) after every gap.
function linePath(weeks, x, y) {
  let path = "";
  let drawing = false;
  weeks.forEach((week, i) => {
    if (week.rate === null) {
      drawing = false;
      return;
    }
    path += `${drawing ? "L" : "M"}${x(i)},${y(week.rate)} `;
    drawing = true;
  });
  return path;
}

// Label only the first, middle and last week so dates never collide.
function xLabelIndexes(count) {
  return [...new Set([0, Math.floor((count - 1) / 2), count - 1])];
}

// Measures an element's width, and re-measures when the window resizes.
function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
