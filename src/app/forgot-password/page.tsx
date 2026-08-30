import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { requestPasswordReset } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-venturo-olive/15 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">
          Enter the email address on your account and we&apos;ll send you a link to reset your
          password.
        </p>

        {sent && (
          <p className="mt-4 rounded-md bg-venturo-olive/10 px-3 py-2.5 text-sm text-venturo-olive">
            If that email is registered, we&apos;ve sent a password reset link.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <form action={requestPasswordReset} className="mt-6 flex flex-col gap-4">
          <Field label="Email">
            <input name="email" type="email" required className={inputClasses} />
          </Field>

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
          )}

          <Button type="submit" className="mt-1">
            Send reset link
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-foreground/70">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-venturo-olive hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
