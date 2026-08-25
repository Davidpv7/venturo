import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Field, MARKDOWN_HINT, inputClasses } from "@/components/ui/field";
import { AddressAutocompleteField } from "@/components/admin/address-autocomplete-field";
import { createHome } from "./actions";

export default async function NewHomePage() {
  await requireAdmin();

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <Link href="/admin/homes" className="text-sm text-foreground/60 hover:text-venturo-olive">
        ← Back to homes
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Add a Home
      </h1>

      <form
        action={createHome}
        className="mt-8 flex flex-col gap-4 rounded-xl border border-venturo-olive/15 bg-white p-6 shadow-sm"
      >
        <Field label="Name">
          <input name="name" type="text" required className={inputClasses} />
        </Field>
        <AddressAutocompleteField />
        <Field label="Description" hint={MARKDOWN_HINT}>
          <textarea name="description" required rows={4} className={inputClasses} />
        </Field>
        <Button type="submit" className="self-start">
          Create Home
        </Button>
      </form>
    </Container>
  );
}
