export default function CheckEmailPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-venturo-olive/15 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">
          We&apos;ve sent a confirmation link to your email address. Click it to
          activate your account, then come back and log in.
        </p>
      </div>
    </div>
  );
}
