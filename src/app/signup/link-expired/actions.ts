"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

// No supabase.auth.getUser() guard here on purpose — unlike
// verify-email/actions.ts's resendConfirmation, the person landing here has
// no session (their signup confirmation never succeeded), so there's no
// user to look up. Supabase's own anti-enumeration behavior means resend()
// is safe to call with an email that doesn't exist or is already confirmed;
// it just returns an error we surface below instead of a generic success.
export async function resendConfirmation(formData: FormData) {
  const email = (formData.get("email") as string).trim();

  if (!email) {
    redirect(`/signup/link-expired?error=${encodeURIComponent("Enter your email address.")}`);
  }

  const captchaToken = formData.get("cf-turnstile-response") as string | null;

  const verified = await verifyTurnstileToken(captchaToken);
  if (!verified) {
    redirect(
      `/signup/link-expired?error=${encodeURIComponent("Verification failed. Please try again.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    redirect(`/signup/link-expired?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/signup/check-email");
}
