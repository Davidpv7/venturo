import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Field, MARKDOWN_HINT, inputClasses } from "@/components/ui/field";
import { LocationMap } from "@/components/location-map";
import { SubtitleField } from "@/components/admin/subtitle-field";
import { LEASE_LENGTH_OPTIONS } from "@/lib/lease-lengths";
import { createRoom } from "./actions";

const createErrors: Record<string, string> = {
  "missing-lease-length": "Select at least one lease length option.",
};

export default async function NewRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ homeId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { homeId } = await params;
  const { error } = await searchParams;

  const home = await prisma.home.findFirst({ where: { id: homeId, deletedAt: null } });
  if (!home) notFound();

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <Link
        href={`/admin/homes/${home.id}`}
        className="text-sm text-foreground/60 hover:text-venturo-olive"
      >
        ← Back to {home.name}
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Add a Room
      </h1>

      {error && createErrors[error] && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {createErrors[error]}
        </p>
      )}

      <section className="mt-6 rounded-xl border border-venturo-olive/15 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-foreground/70">Home location</h2>
        <p className="mt-1 text-sm text-foreground/60">{home.address}</p>
        <div className="mt-3">
          <LocationMap address={home.address} />
        </div>
      </section>

      <form
        action={createRoom}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-venturo-olive/15 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="homeId" value={home.id} />
        <Field label="Title">
          <input name="title" type="text" required className={inputClasses} />
        </Field>
        <SubtitleField />
        <Field label="Weekly price (AUD)">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            className={inputClasses}
          />
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Lease length options</legend>
          <p className="text-xs text-foreground/60">
            Select at least one. If you select more than one, the tenant chooses when applying.
          </p>
          <div className="flex gap-4 text-sm text-foreground/80">
            {LEASE_LENGTH_OPTIONS.map((months) => (
              <label key={months} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={`leaseLength${months}Months`}
                  defaultChecked={months === 6}
                  className="h-4 w-4 accent-venturo-olive"
                />
                {months} months
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Description" hint={MARKDOWN_HINT}>
          <textarea name="description" required rows={4} className={inputClasses} />
        </Field>
        <Button type="submit" className="self-start">
          Create Room
        </Button>
      </form>
    </Container>
  );
}
