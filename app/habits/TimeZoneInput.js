"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getBrowserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const getServerTimeZone = () => "";

// A hidden form field holding the browser's time zone (e.g. "Asia/Kolkata").
// Only the browser knows it; the server-rendered HTML starts empty and the
// browser fills it in, without a hydration mismatch.
export default function TimeZoneInput() {
  const timeZone = useSyncExternalStore(subscribe, getBrowserTimeZone, getServerTimeZone);
  return <input type="hidden" name="time_zone" value={timeZone} />;
}
