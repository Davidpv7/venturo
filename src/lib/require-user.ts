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

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

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
