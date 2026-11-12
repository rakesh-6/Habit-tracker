import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

// Supabase client for server code (pages, server actions).
// The login session lives in cookies, so the client reads and writes them.
export async function createClient() {
  // Supabase checks session expiry with Date.now(). This tells Next.js to run
  // Supabase code only for a real request, never while prerendering/prefetching.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Pages can't set cookies, only server actions can.
            // That's fine: proxy.js refreshes the session cookie on every request.
          }
        },
      },
    }
  );
}
