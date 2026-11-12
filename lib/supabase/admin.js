import { createClient } from "@supabase/supabase-js";

// Supabase client that BYPASSES Row Level Security, using the secret key.
// Only for trusted server jobs (like sending everyone's reminders) — never
// use it to handle a normal user's request. The key has no NEXT_PUBLIC_
// prefix, so Next.js never sends it to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    requireEnv("SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env.local`);
  return value;
}
