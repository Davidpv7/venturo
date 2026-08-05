import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { sendContactMessage } from "./actions";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <Container className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Contact
      </h1>
      <p className="mt-4 max-w-xl text-foreground/80">
        Questions about a room, a lease, or anything else — reach out directly
        or use the form below.
      </p>

      <div className="mt-6 flex flex-col gap-2 text-sm">
        <a
          href="mailto:venturo.coliving@gmail.com"
          className="font-medium text-venturo-olive hover:underline"
        >
          venturo.coliving@gmail.com
        </a>
        <a href="tel:0434682864" className="font-medium text-venturo-olive hover:underline">
          0434 682 864
        </a>
      </div>

      {sent && (
        <p className="mt-6 max-w-sm rounded-md border border-venturo-olive/25 bg-venturo-cream-alt px-4 py-3 text-sm text-venturo-olive">
          Thanks — your message has been sent. We&apos;ll get back to you soon.
        </p>
      )}

      <form action={sendContactMessage} className="mt-10 flex max-w-sm flex-col gap-4">
        <Field label="Name">
          <input name="name" type="text" required className={inputClasses} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClasses} />
        </Field>
        <Field label="Message">
          <textarea name="message" required rows={4} className={inputClasses} />
        </Field>
        <Button type="submit" className="mt-1 self-start">
          Send Message
        </Button>
      </form>
    </Container>
  );
}
