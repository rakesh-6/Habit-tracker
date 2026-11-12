// Small display helpers shared by the stats page.

// 0.857 → "86%", null → "–"
export function formatPercent(rate) {
  return rate === null ? "–" : `${Math.round(rate * 100)}%`;
}

// "2026-11-02" → "2 Nov" (in the viewer's own language settings)
export function formatShortDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

// "1 check-off" / "3 check-offs"
export function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
