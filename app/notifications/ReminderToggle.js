"use client";

import { useEffect, useState } from "react";
import { removeSubscription, saveSubscription } from "./actions";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const buttonStyle =
  "rounded-lg border border-zinc-300 px-3 py-1 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800";

const STATUS_TEXT = {
  loading: "Checking notification settings…",
  unsupported: "This browser can't show reminders.",
  missingKey: "Reminders aren't set up yet: the VAPID public key is missing.",
  blocked: "Notifications are blocked. Allow them in your browser's site settings, then reload.",
  off: "Get a notification at each habit's reminder time.",
  on: "Reminders are on for this browser.",
};

export default function ReminderToggle() {
  // loading | unsupported | missingKey | blocked | off | on
  const [status, setStatus] = useState("loading");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkStatus()
      .then(setStatus)
      .catch((err) => {
        setError(err.message);
        setStatus("unsupported");
      });
  }, []);

  async function enable() {
    await run(async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return permission === "denied" ? "blocked" : "off";

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // browsers require every push to show a notification
        applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY),
      });
      await saveOrThrow(subscription);
      return "on";
    });
  }

  async function disable() {
    await run(async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const { error } = await removeSubscription(subscription.endpoint);
        if (error) throw new Error(error);
        await subscription.unsubscribe();
      }
      return "off";
    });
  }

  // Shared wrapper: disables the button while working and shows any error.
  async function run(task) {
    setIsWorking(true);
    setError("");
    try {
      setStatus(await task());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <p className="flex-1 text-zinc-600 dark:text-zinc-400">{STATUS_TEXT[status]}</p>
      {status === "off" && (
        <button onClick={enable} disabled={isWorking} className={buttonStyle}>
          🔔 Enable reminders
        </button>
      )}
      {status === "on" && (
        <button onClick={disable} disabled={isWorking} className={buttonStyle}>
          🔕 Turn off
        </button>
      )}
      {error && <p className="w-full text-red-600">Couldn&apos;t update reminders: {error}</p>}
    </section>
  );
}

async function checkStatus() {
  const isSupported =
    "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (!isSupported) return "unsupported";
  if (!VAPID_PUBLIC_KEY) return "missingKey";

  // updateViaCache: "none" makes the browser always fetch the latest sw.js.
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  if (Notification.permission === "denied") return "blocked";

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return "off";

  // Save again in case this browser was subscribed under a different account.
  try {
    await saveOrThrow(subscription);
    return "on";
  } catch {
    return "off";
  }
}

async function saveOrThrow(subscription) {
  // toJSON() turns the browser object into plain data a server action can receive.
  const { error } = await saveSubscription(subscription.toJSON());
  if (error) throw new Error(error);
}

// VAPID keys are written in "base64url"; the browser wants raw bytes.
function base64UrlToBytes(base64Url) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}
