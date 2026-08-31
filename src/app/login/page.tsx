import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string; reset?: string }>;
}) {
  const { error, deleted, reset } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-venturo-olive/15 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Log In</h1>

        {deleted && (
          <p className="mt-4 rounded-md bg-venturo-olive/10 px-3 py-2.5 text-sm text-venturo-olive">
            Your account has been deleted.
          </p>
        )}

        {reset && (
          <p className="mt-4 rounded-md bg-venturo-olive/10 px-3 py-2.5 text-sm text-venturo-olive">
            Your password has been reset. Log in with your new password.
          </p>
        )}

        {error === "email-not-confirmed" ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
            You need to confirm your email before logging in.{" "}
            <Link href="/signup/link-expired" className="font-medium underline">
              Resend the confirmation email
            </Link>
            .
          </p>
        ) : (
          error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )
        )}

        <form action={login} className="mt-6 flex flex-col gap-4">
          <Field label="Email">
            <input name="email" type="email" required className={inputClasses} />
          </Field>
          <Field label="Password">
            <input name="password" type="password" required className={inputClasses} />
          </Field>

          <Link
            href="/forgot-password"
            className="-mt-2 self-end text-xs font-medium text-venturo-olive hover:underline"
          >
            Forgot password?
          </Link>

          <Button type="submit" className="mt-1">
            Log In
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
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-venturo-olive hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
