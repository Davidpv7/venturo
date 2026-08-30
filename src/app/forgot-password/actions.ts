"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  const captchaToken = formData.get("cf-turnstile-response") as string | null;

  const verified = await verifyTurnstileToken(captchaToken);
  if (!verified) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("Verification failed. Please try again.")}`,
    );
  }

  const headersList = await headers();
  const origin = `${headersList.get("x-forwarded-proto") ?? "http"}://${headersList.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  // Supabase intentionally does not error when the email isn't registered
  // (anti-enumeration) — only surface unexpected failures here (rate limit,
  // upstream outage), never "not found".
  if (error) {
    console.error("[forgot-password] resetPasswordForEmail failed:", error);
    const message =
      error.status && error.status >= 500
        ? "Something went wrong sending the reset email. Please try again in a moment."
        : error.message;
    redirect(`/forgot-password?error=${encodeURIComponent(message)}`);
  }

  redirect("/forgot-password?sent=1");
}
