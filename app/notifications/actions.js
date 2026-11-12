"use server";

import { createClient } from "@/lib/supabase/server";

// These are called directly from the browser (not from a <form>),
// so they return { error } instead of redirecting.

export async function saveSubscription(subscription) {
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (!endpoint?.startsWith("https://") || !p256dh || !auth) {
    return { error: "The browser sent an invalid push subscription." };
  }

  const supabase = await createClient();
  // Upsert: saving the same browser again just refreshes its keys.
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ endpoint, p256dh, auth }, { onConflict: "user_id,endpoint" });

  return { error: error?.message ?? null };
}

export async function removeSubscription(endpoint) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", String(endpoint ?? ""));

  return { error: error?.message ?? null };
}
