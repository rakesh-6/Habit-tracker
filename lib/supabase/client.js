import { createBrowserClient } from "@supabase/ssr";

// Supabase client for code that runs in the browser ("use client" components).
// Not used by Feature 1 yet; later features will use it.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
