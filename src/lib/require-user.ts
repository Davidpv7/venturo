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

  return prisma.user.findUniqueOrThrow({ where: { id: user.id } });
}
