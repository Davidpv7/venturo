import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Use this inside Server Components, Server Actions, and Route Handlers.
// It reads the auth session from the request's cookies so you can tell
// who's logged in without a client-side round trip.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components can't set cookies — safe to ignore here as
            // long as middleware is refreshing the session (added when we
            // build the protected admin routes).
          }
        },
      },
    },
  );
}
