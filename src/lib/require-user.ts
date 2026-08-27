import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Same shape as requireAdmin, minus the role check — for pages/actions that
// just need "is someone logged in" plus the Prisma User row.
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    try {
      // Self-heals a missing public."User" row — either the
      // handle_new_user trigger isn't installed/hasn't run yet, or the
      // signup-time fallback upsert failed (see signup/actions.ts).
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: (user.user_metadata?.name as string | undefined) ?? null,
        },
      });
    } catch (err) {
      // A concurrent request (e.g. two tabs) may have created the row
      // first — re-check before treating this as a real failure.
      dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) {
        // Most likely a real unique-constraint collision: this email is
        // still occupied by a stale soft-deleted row.
        console.error("[requireUser] self-heal create failed:", err);
        redirect(
          `/login?error=${encodeURIComponent("We couldn't finish setting up your account. Please try again in a moment or contact support.")}`,
        );
      }
    }
  }

  // Deleting the Supabase auth user (see deleteAccount) invalidates the
  // refresh token, but an already-issued access token stays valid until it
  // expires — so a still-live cookie could otherwise keep reaching pages as
  // this now-scrubbed account.
  if (dbUser.deletedAt) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return dbUser;
}
