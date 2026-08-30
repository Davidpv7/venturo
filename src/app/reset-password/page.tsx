import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { createClient } from "@/lib/supabase/server";
import { resetPassword } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("That reset link is invalid or has expired. Please request a new one.")}`,
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-venturo-olive/15 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Set a new password
        </h1>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <form action={resetPassword} className="mt-6 flex flex-col gap-4">
          <PasswordField />

          <Button type="submit" className="mt-1">
            Set new password
          </Button>
        </form>
      </div>
    </div>
  );
}
