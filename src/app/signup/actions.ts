"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isPasswordValid } from "@/lib/password";

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
      captchaToken: captchaToken || undefined,
    },
  });

  if (error) {
    // error.message can be a useless "{}" when the failure is a raw network
    // error rather than a normal Supabase API error response — this is what
    // shows up unredacted in server logs when that happens, since the
    // redirect's ?error= param alone doesn't tell us anything in that case.
    console.error("[signup] supabase.auth.signUp failed:", error);
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Normally the Postgres trigger (supabase/sql/001_handle_new_user.sql)
  // has already inserted the matching public."User" row by the time signUp
  // resolves. Upsert instead of update so signup doesn't hard-fail if that
  // trigger is missing or hasn't run yet in this environment.
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

  // With "Confirm email" off, Supabase can return an active session
  // immediately — but only treat that as "done" if the email is actually
  // confirmed too, so a future settings change can't skip verification.
  if (data.session && data.user?.email_confirmed_at) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  redirect("/signup/check-email");
}
