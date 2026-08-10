import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Field, inputClasses } from "@/components/ui/field";
import { PhotoManager } from "@/components/admin/photo-manager";
import {
  updateRoom,
  deleteRoom,
  uploadRoomPhotos,
  deleteRoomPhoto,
  reorderRoomPhotos,
} from "./actions";
import type { RoomStatus } from "@/generated/prisma/client";

const statusBadge: Record<RoomStatus, string> = {
  AVAILABLE: "bg-venturo-olive/10 text-venturo-olive",
  PENDING_DEPOSIT: "bg-red-50 text-red-700",
  RENTED: "bg-foreground/80 text-white",
  ARCHIVED: "bg-foreground/5 text-foreground/40",
};

const deleteErrors: Record<string, string> = {
  "has-history":
    "Can't delete a room with a signed lease or notify-me history — use Archive on the admin dashboard instead.",
};

export default async function EditRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ homeId: string; roomId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { homeId, roomId } = await params;
  const { error } = await searchParams;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { home: true, photos: true },
  });

  if (!room || room.homeId !== homeId) notFound();

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <Link
        href={`/admin/homes/${homeId}`}
        className="text-sm text-foreground/60 hover:text-venturo-olive"
      >
        ← Back to {room.home.name}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {room.title}
        </h1>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[room.status]}`}
        >
          {room.status.replace("_", " ")}
        </span>
      </div>
      <p className="mt-2 text-sm text-foreground/50">
        To change availability status, use the actions on the{" "}
        <Link href="/admin" className="text-venturo-olive hover:underline">
          admin dashboard
        </Link>
        .
      </p>

      {error && deleteErrors[error] && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {deleteErrors[error]}
        </p>
      )}

      <section className="mt-8 rounded-xl border border-venturo-olive/15 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">Details</h2>
        <form action={updateRoom} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="roomId" value={room.id} />
          <Field label="Title">
            <input
              name="title"
              type="text"
              defaultValue={room.title}
              required
              className={inputClasses}
            />
          </Field>
          <Field label="Weekly price (AUD)">
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={room.price / 100}
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
              defaultValue={room.leaseLengthMonths}
              required
              className={inputClasses}
            />
          </Field>
          <Field label="Description">
            <textarea
              name="description"
              defaultValue={room.description}
              required
              rows={4}
              className={inputClasses}
            />
          </Field>
          <Button type="submit" className="self-start">
            Save Changes
          </Button>
        </form>

        <form action={deleteRoom} className="mt-6 border-t border-venturo-olive/10 pt-4">
          <input type="hidden" name="roomId" value={room.id} />
          <input type="hidden" name="homeId" value={homeId} />
          <Button type="submit" variant="secondary" size="sm">
            Delete Room
          </Button>
        </form>
      </section>

      <PhotoManager
        photos={room.photos}
        parentIdField="roomId"
        parentId={room.id}
        uploadAction={uploadRoomPhotos}
        deleteAction={deleteRoomPhoto}
        reorderAction={reorderRoomPhotos}
      />
    </Container>
  );
}
