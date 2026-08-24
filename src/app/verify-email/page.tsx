import { redirect } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { resendConfirmation } from "./actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.email_confirmed_at) redirect("/");

  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-venturo-olive/15 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Confirm your email
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">
          You need to verify {user.email} before you can start a rental application. Check your
          inbox for the confirmation link we sent when you signed up.
        </p>

        {sent && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2.5 text-sm text-green-700">
            Confirmation email sent — check your inbox.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <form action={resendConfirmation} className="mt-6 flex flex-col gap-4">
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div
              className="cf-turnstile self-center"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            />
          )}
          <Button type="submit" variant="secondary" className="w-full">
            Resend confirmation email
          </Button>
        </form>
      </div>

      <Script src="https://challenge.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
    </div>
  );
}
