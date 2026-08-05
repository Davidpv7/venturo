import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Checked in the admin page AND every admin server action — not just the
// page. Server actions are directly callable endpoints once deployed; hiding
// the "Confirm Deposit" button from non-admins in the UI doesn't stop
// someone from invoking the action itself, so the real check has to live
// here, not in what's rendered.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");

  return dbUser;
}
