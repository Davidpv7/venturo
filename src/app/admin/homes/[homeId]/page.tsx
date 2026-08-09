import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { formatWeeklyPrice } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Field, inputClasses } from "@/components/ui/field";
import { PhotoManager } from "@/components/admin/photo-manager";
import { updateHome, deleteHome, uploadHomePhotos, deleteHomePhoto, updateHomePhotoOrder } from "./actions";
import type { RoomStatus } from "@/generated/prisma/client";

const statusBadge: Record<RoomStatus, string> = {
  AVAILABLE: "bg-venturo-olive/10 text-venturo-olive",
  PENDING_DEPOSIT: "bg-red-50 text-red-700",
  RENTED: "bg-foreground/80 text-white",
  ARCHIVED: "bg-foreground/5 text-foreground/40",
};

const deleteErrors: Record<string, string> = {
  "has-rooms":
    "Can't delete a home that still has rooms — delete its rooms first.",
};

export default async function EditHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ homeId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { homeId } = await params;
  const { error } = await searchParams;

  const home = await prisma.home.findUnique({
    where: { id: homeId },
    include: { rooms: { orderBy: { createdAt: "desc" } }, photos: true },
  });

  if (!home) notFound();

  return (
    <Container size="md" className="py-16 sm:py-20">
      <Link href="/admin" className="text-sm text-foreground/60 hover:text-venturo-olive">
        ← Back to admin
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {home.name}
      </h1>

      {error && deleteErrors[error] && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {deleteErrors[error]}
        </p>
      )}

      <section className="mt-8 rounded-xl border border-venturo-olive/15 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">Details</h2>
        <form action={updateHome} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="homeId" value={home.id} />
          <Field label="Name">
            <input
              name="name"
              type="text"
              defaultValue={home.name}
              required
              className={inputClasses}
            />
          </Field>
          <Field label="Address">
            <input
              name="address"
              type="text"
              defaultValue={home.address}
              required
              className={inputClasses}
            />
          </Field>
          <Field label="Description">
            <textarea
              name="description"
              defaultValue={home.description}
              required
              rows={4}
              className={inputClasses}
            />
          </Field>
          <Button type="submit" className="self-start">
            Save Changes
          </Button>
        </form>

        <form action={deleteHome} className="mt-6 border-t border-venturo-olive/10 pt-4">
          <input type="hidden" name="homeId" value={home.id} />
          <Button type="submit" variant="secondary" size="sm">
            Delete Home
          </Button>
        </form>
      </section>

      <PhotoManager
        photos={home.photos}
        parentIdField="homeId"
        parentId={home.id}
        uploadAction={uploadHomePhotos}
        deleteAction={deleteHomePhoto}
        reorderAction={updateHomePhotoOrder}
      />

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Rooms</h2>
          <ButtonLink href={`/admin/homes/${home.id}/rooms/new`} size="sm">
            Add Room
          </ButtonLink>
        </div>

        {home.rooms.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/60">No rooms yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-venturo-olive/15 text-foreground/50">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {home.rooms.map((room) => (
                  <tr key={room.id} className="border-b border-venturo-olive/10 last:border-b-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/homes/${home.id}/rooms/${room.id}`}
                        className="font-medium text-foreground hover:text-venturo-olive"
                      >
                        {room.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[room.status]}`}
                      >
                        {room.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-foreground/80">
                      {formatWeeklyPrice(room.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Container>
  );
}
