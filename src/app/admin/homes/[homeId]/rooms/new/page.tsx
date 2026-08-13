import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Field, inputClasses } from "@/components/ui/field";
import { createRoom } from "./actions";

export default async function NewRoomPage({
  params,
}: {
  params: Promise<{ homeId: string }>;
}) {
  await requireAdmin();
  const { homeId } = await params;

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

      <form
        action={createRoom}
        className="mt-8 flex flex-col gap-4 rounded-xl border border-venturo-olive/15 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="homeId" value={home.id} />
        <Field label="Title">
          <input name="title" type="text" required className={inputClasses} />
        </Field>
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
        <Field label="Lease length (months)">
          <input
            name="leaseLengthMonths"
            type="number"
            step="1"
            min="1"
            required
            className={inputClasses}
          />
        </Field>
        <Field label="Description">
          <textarea name="description" required rows={4} className={inputClasses} />
        </Field>
        <Button type="submit" className="self-start">
          Create Room
        </Button>
      </form>
    </Container>
  );
}
