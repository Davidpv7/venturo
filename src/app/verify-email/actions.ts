"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!user.email) redirect("/verify-email?error=no-email-on-file");

  const captchaToken = formData.get("cf-turnstile-response") as string | null;

  const verified = await verifyTurnstileToken(captchaToken);
  if (!verified) {
    redirect(
      `/verify-email?error=${encodeURIComponent("Verification failed. Please try again.")}`,
    );
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
  });

  if (error) {
    redirect(`/verify-email?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/verify-email?sent=1");
}
