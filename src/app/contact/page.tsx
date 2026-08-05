import { sendContactMessage } from "./actions";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold text-venturo-olive">Contact</h1>
      <p className="mt-4 text-foreground/80">
        Questions about a room, a lease, or anything else — reach out directly
        or use the form below.
      </p>

      <div className="mt-6 flex flex-col gap-1 text-sm">
        <a href="mailto:venturo.coliving@gmail.com" className="text-venturo-olive underline">
          venturo.coliving@gmail.com
        </a>
        <a href="tel:0434682864" className="text-venturo-olive underline">
          0434 682 864
        </a>
      </div>

      {sent && (
        <p className="mt-6 rounded bg-venturo-cream-alt px-3 py-2 text-sm text-venturo-olive">
          Thanks — your message has been sent. We&apos;ll get back to you soon.
        </p>
      )}

      <form action={sendContactMessage} className="mt-8 flex max-w-sm flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input
            name="name"
            type="text"
            required
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
          Message
          <textarea
            name="message"
            required
            rows={4}
            className="rounded border border-venturo-olive/30 bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded bg-venturo-olive px-4 py-2 font-medium text-white"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
