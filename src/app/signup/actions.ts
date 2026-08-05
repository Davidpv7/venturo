"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  // `options.data` becomes `raw_user_meta_data` on the auth.users row — the
  // Postgres trigger (supabase/sql/001_handle_new_user.sql) reads this to
  // fill in the matching public."User".name.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // With "Confirm email" off, Supabase returns an active session immediately
  // and the user is already logged in. With it on, there's no session yet —
  // they need to click the emailed link first.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  redirect("/signup/check-email");
}
