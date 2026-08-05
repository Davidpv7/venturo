import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
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
          <Field label="Name">
            <input name="name" type="text" className={inputClasses} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required className={inputClasses} />
          </Field>
          <Field label="Password">
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className={inputClasses}
            />
          </Field>
          <Button type="submit" className="mt-1">
            Sign Up
          </Button>
        </form>
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
