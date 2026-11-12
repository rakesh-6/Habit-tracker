import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Runs before every page request. It does two things:
// 1. Refreshes the Supabase session cookie so users stay logged in.
// 2. Sends logged-out visitors to /login (and logged-in ones away from it).
export async function proxy(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Copy refreshed cookies onto both the request (for this render)
          // and the response (so the browser saves them).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  // Share links are meant for people without an account.
  const isPublicPage = request.nextUrl.pathname.startsWith("/share/");

  if (!isLoggedIn && !isLoginPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// Skip static files and images; they don't need a login check.
// sw.js is skipped too: browsers refuse a service worker that redirects to /login.
// api/send-reminders is called by a scheduler, not a logged-in user; it checks
// its own password (CRON_SECRET) instead.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|api/send-reminders|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
