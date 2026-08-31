import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { PasswordField } from "@/components/auth/password-field";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { TermsModalTrigger, PrivacyModalTrigger } from "@/components/auth/legal-modal-triggers";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-venturo-olive/15 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign Up</h1>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={signup} className="mt-6 flex flex-col gap-4">
          <Field label="Full name">
            <input name="fullName" type="text" required className={inputClasses} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required className={inputClasses} />
          </Field>
          <PasswordField />

          <label className="flex items-start gap-2 text-sm text-foreground">
            <input
              name="terms"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 rounded border-venturo-olive/40 text-venturo-olive focus:ring-venturo-olive/30"
            />
            <span>
              I agree to the <TermsModalTrigger /> and <PrivacyModalTrigger />.
            </span>
          </label>

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
          )}

          <Button
            type="submit"
            className="mt-1"
            disabled={!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          >
            Sign Up
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3 text-xs text-foreground/50">
          <div className="h-px flex-1 bg-venturo-olive/15" />
          or
          <div className="h-px flex-1 bg-venturo-olive/15" />
        </div>

        <div className="mt-6">
          <GoogleAuthButton />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-foreground/70">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-venturo-olive hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
