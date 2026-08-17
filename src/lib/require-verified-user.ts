import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Same shape as requireUser/requireAdmin, plus a check on top: the tenant
// application flow additionally requires a confirmed email address. Checked
// here (called from both the /apply layout and every step action) rather
// than relying on Supabase's own "Confirm email" setting alone, since that's
// dashboard config that could change — same reasoning as requireAdmin's role
// check not being inferred from what the UI renders.
export async function requireVerifiedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/verify-email");

  return prisma.user.findUniqueOrThrow({ where: { id: user.id } });
}
