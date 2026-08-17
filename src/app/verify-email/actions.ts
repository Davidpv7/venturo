"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resendConfirmation() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!user.email) redirect("/verify-email?error=no-email-on-file");

  const { error } = await supabase.auth.resend({ type: "signup", email: user.email });

  if (error) {
    redirect(`/verify-email?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/verify-email?sent=1");
}
