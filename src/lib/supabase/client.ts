import { createBrowserClient } from "@supabase/ssr";

// Use this inside Client Components ("use client"). It reads/writes the
// auth session via cookies in the browser, so the session stays in sync
// with the server-side client below.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
