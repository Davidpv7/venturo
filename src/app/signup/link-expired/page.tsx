import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { resendConfirmation } from "./actions";

export default async function LinkExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-venturo-olive/15 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Link expired
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">
          That confirmation link is invalid or has expired. Enter your email below and
          we&apos;ll send you a new one.
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <form action={resendConfirmation} className="mt-6 flex flex-col gap-4 text-left">
          <Field label="Email">
            <input name="email" type="email" required className={inputClasses} />
          </Field>
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="self-center">
              <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
            </div>
          )}
          <Button type="submit" className="w-full">
            Send new link
          </Button>
        </form>
      </div>
    </div>
  );
}
