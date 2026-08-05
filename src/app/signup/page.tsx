import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-3xl font-bold text-venturo-olive">Sign Up</h1>

      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={signup} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input
            name="name"
            type="text"
            className="rounded border border-venturo-olive/30 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded border border-venturo-olive/30 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="rounded border border-venturo-olive/30 bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded bg-venturo-olive px-4 py-2 font-medium text-white"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-venturo-olive underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
