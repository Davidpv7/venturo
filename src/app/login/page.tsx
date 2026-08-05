import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-3xl font-bold text-venturo-olive">Log In</h1>

      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={login} className="mt-6 flex flex-col gap-4">
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
            className="rounded border border-venturo-olive/30 bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded bg-venturo-olive px-4 py-2 font-medium text-white"
        >
          Log In
        </button>
      </form>

      <p className="mt-4 text-sm">
        No account yet?{" "}
        <Link href="/signup" className="text-venturo-olive underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
