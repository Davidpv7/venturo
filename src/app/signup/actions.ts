"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isPasswordValid } from "@/lib/password";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const fullName = (formData.get("fullName") as string).trim();
  const termsAccepted = formData.get("terms") === "on";
  const captchaToken = formData.get("cf-turnstile-response") as string | null;

  if (!isPasswordValid(password)) {
    redirect(
      `/signup?error=${encodeURIComponent("Password must be at least 8 characters and include a number.")}`,
    );
  }

  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent("Passwords don't match.")}`);
  }

  if (!termsAccepted) {
    redirect(
      `/signup?error=${encodeURIComponent("You must agree to the Terms of Service and Privacy Policy.")}`,
    );
  }

  const verified = await verifyTurnstileToken(captchaToken);
  if (!verified) {
    redirect(`/signup?error=${encodeURIComponent("Verification failed. Please try again.")}`);
  }

  // "Jane Doe Smith" -> name: "Jane", lastName: "Doe Smith". Both columns
  // stay editable separately afterward via /account/profile.
  const [name, ...rest] = fullName.split(/\s+/);
  const lastName = rest.join(" ");

  const supabase = await createClient();

  // `options.data` becomes `raw_user_meta_data` on the auth.users row — the
  // Postgres trigger (supabase/sql/001_handle_new_user.sql) reads this to
  // fill in the matching public."User".name.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    console.error("[signup] supabase.auth.signUp failed:", error);
    // 5xx errors come from GoTrue/network failures upstream and can carry a
    // useless message (even a literal "{}"); only 4xx messages (weak
    // password, already registered, etc.) are meant for the user to read.
    const message =
      error.status && error.status >= 500
        ? "Something went wrong creating your account. Please try again in a moment."
        : error.message;
    redirect(`/signup?error=${encodeURIComponent(message)}`);
  }

  // Normally the Postgres trigger (supabase/sql/001_handle_new_user.sql)
  // has already inserted the matching public."User" row by the time signUp
  // resolves. Upsert instead of update so signup doesn't hard-fail if that
  // trigger is missing or hasn't run yet in this environment.
  try {
    await prisma.user.upsert({
      where: { id: data.user!.id },
      update: { lastName: lastName || null, termsAcceptedAt: new Date() },
      create: {
        id: data.user!.id,
        email,
        name,
        lastName: lastName || null,
        termsAcceptedAt: new Date(),
      },
    });
  } catch (err) {
    // supabase.auth.signUp above already created the auth user and sent the
    // confirmation email — that's irreversible from here, so a failure in
    // this fallback upsert (e.g. a stale soft-deleted row still holding this
    // email, or a transient DB error) must not crash the signup flow.
    // requireUser() self-heals the missing public."User" row on first
    // login/profile visit instead (see require-user.ts).
    console.error("[signup] prisma.user.upsert failed:", err);
    redirect("/signup/check-email");
  }

  // With "Confirm email" off, Supabase can return an active session
  // immediately — but only treat that as "done" if the email is actually
  // confirmed too, so a future settings change can't skip verification.
  if (data.session && data.user?.email_confirmed_at) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  redirect("/signup/check-email");
}
