// Milestone badges. Pure functions: no database, no React.
//
// Badges are earned by the BEST streak, so they're kept forever, even after
// a streak breaks. "N times a week" habits count streaks in weeks, so their
// milestones are in weeks (about 1 month, 3 months, 6 months).

const MILESTONES = {
  day: [
    { goal: 7, icon: "🥉" },
    { goal: 30, icon: "🥈" },
    { goal: 100, icon: "🥇" },
  ],
  week: [
    { goal: 4, icon: "🥉" },
    { goal: 12, icon: "🥈" },
    { goal: 26, icon: "🥇" },
  ],
};

export function streakUnit(schedule) {
  return schedule.type === "per_week" ? "week" : "day";
}

export function earnedBadges(best, unit) {
  return MILESTONES[unit].filter((milestone) => best >= milestone.goal);
}

// The next badge not yet earned, and how far the CURRENT streak is from it.
// null once every badge is earned.
export function nextBadge(best, current, unit) {
  const next = MILESTONES[unit].find((milestone) => best < milestone.goal);
  return next ? { ...next, toGo: next.goal - current } : null;
}
