"use client";

import { useState } from "react";
import { shareHabit, stopSharing } from "./actions";

const linkButtonStyle = "font-medium underline-offset-2 hover:underline";

// Shown in the row's buttons while a habit is NOT shared.
export function ShareButton({ habitId, className }) {
  return (
    <form action={shareHabit}>
      <input type="hidden" name="id" value={habitId} />
      <button className={className}>Share</button>
    </form>
  );
}

// Shown under a habit while it IS shared: copy the link, or switch it off.
export function SharedLinkBar({ habitId, token }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
      <span>🔗 Anyone with the link can see this habit</span>
      <button type="button" onClick={copyLink} className={linkButtonStyle}>
        {copied ? "Copied ✓" : "Copy link"}
      </button>
      <a href={`/share/${token}`} target="_blank" rel="noreferrer" className={linkButtonStyle}>
        Preview
      </a>
      <form action={stopSharing}>
        <input type="hidden" name="id" value={habitId} />
        <button className={linkButtonStyle}>Stop sharing</button>
      </form>
    </div>
  );
}
