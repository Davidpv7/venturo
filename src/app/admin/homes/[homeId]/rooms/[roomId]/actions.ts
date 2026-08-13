"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";
import { uploadPhotos, deletePhoto, reorderPhotos } from "@/lib/admin-photos";

export async function updateRoom(formData: FormData) {
  await requireAdmin();

  const roomId = formData.get("roomId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Math.round(parseFloat(formData.get("price") as string) * 100);
  const leaseLengthMonths = parseInt(formData.get("leaseLengthMonths") as string, 10);

  await prisma.room.update({
    where: { id: roomId },
    data: { title, description, price, leaseLengthMonths },
  });

  revalidateRoomPaths();
}

export async function deleteRoom(formData: FormData) {
  await requireAdmin();

  const roomId = formData.get("roomId") as string;
  const homeId = formData.get("homeId") as string;
  // Lets callers other than the room's own edit page (e.g. the Homes &
  // Rooms dashboard listing) send the admin back to where they clicked
  // delete from, instead of always landing on this room's now-deleted page.
  const redirectBase =
    (formData.get("redirectTo") as string | null) || `/admin/homes/${homeId}/rooms/${roomId}`;
  const successRedirect = (formData.get("redirectTo") as string | null) || `/admin/homes/${homeId}`;

  // A room with a signed lease or "notify me" history keeps that history
  // live against it — point admins at archiveRoom (on the main dashboard)
  // for that case instead of trashing it.
  const [contractCount, interestCount] = await Promise.all([
    prisma.contract.count({ where: { roomId } }),
    prisma.interest.count({ where: { roomId } }),
  ]);

  if (contractCount > 0 || interestCount > 0) {
    redirect(`${redirectBase}?error=has-history`);
  }

  // Soft delete rather than a real row delete: keeps the room (and its
  // photos) around so it can be recovered from the admin Trash if this was
  // clicked by accident.
  await prisma.room.update({
    where: { id: roomId },
    data: { deletedAt: new Date() },
  });

  revalidateRoomPaths();
  redirect(successRedirect);
}

export async function restoreRoom(formData: FormData) {
  await requireAdmin();

  const roomId = formData.get("roomId") as string;

  await prisma.$transaction(async (tx) => {
    const room = await tx.room.update({
      where: { id: roomId },
      data: { deletedAt: null },
    });
    // A room deleted after its home was trashed (home deletion requires
    // zero active rooms, so this is the normal order of events) would
    // otherwise come back active under a home that's still hidden — bring
    // the home back with it so the room actually reappears in the listing.
    await tx.home.update({
      where: { id: room.homeId },
      data: { deletedAt: null },
    });
  });

  revalidateRoomPaths();
}

export async function permanentlyDeleteRoom(formData: FormData) {
  await requireAdmin();

  const roomId = formData.get("roomId") as string;

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room?.deletedAt) return; // only reachable from the Trash list

  // Belt-and-braces re-check — deleteRoom only trashes a room once this is
  // already zero, but nothing stops new history landing on it afterwards
  // outside the normal UI flow.
  const [contractCount, interestCount] = await Promise.all([
    prisma.contract.count({ where: { roomId } }),
    prisma.interest.count({ where: { roomId } }),
  ]);
  if (contractCount > 0 || interestCount > 0) {
    redirect("/admin/homes?error=has-history");
  }

  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { roomId } }),
    prisma.room.delete({ where: { id: roomId } }),
  ]);

  revalidateRoomPaths();
}

export async function uploadRoomPhotos(formData: FormData) {
  await requireAdmin();
  const roomId = formData.get("roomId") as string;

  const created = await uploadPhotos({ roomId }, formData);

  revalidateRoomPaths();
  return created;
}

export async function deleteRoomPhoto(photoId: string) {
  await requireAdmin();

  await deletePhoto(photoId);

  revalidateRoomPaths();
}

export async function reorderRoomPhotos(roomId: string, orderedPhotoIds: string[]) {
  await requireAdmin();

  await reorderPhotos({ roomId }, orderedPhotoIds);

  revalidateRoomPaths();
}
