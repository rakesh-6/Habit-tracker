"use client";

import { useSyncExternalStore } from "react";
import { toLocalDateString } from "@/lib/dates";

const subscribe = () => () => {};
const getBrowserToday = () => toLocalDateString(new Date());

// Today's date in the browser's own time zone, as "YYYY-MM-DD".
// The server can't know it, so while rendering on the server this is null.
export function useToday() {
  return useSyncExternalStore(subscribe, getBrowserToday, () => null);
}
