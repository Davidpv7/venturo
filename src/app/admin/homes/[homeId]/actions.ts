"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";
import { uploadPhotos, deletePhoto, reorderPhotos } from "@/lib/admin-photos";

export async function updateHome(formData: FormData) {
  await requireAdmin();

  const homeId = formData.get("homeId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const wifiPassword = (formData.get("wifiPassword") as string).trim();
  const binDay = (formData.get("binDay") as string).trim();

  await prisma.home.update({
    where: { id: homeId },
    data: {
      name,
      description,
      address,
      wifiPassword: wifiPassword || null,
      binDay: binDay || null,
    },
  });

  revalidateRoomPaths();
}

export async function deleteHome(formData: FormData) {
  await requireAdmin();

  const homeId = formData.get("homeId") as string;
  // Lets callers other than the home's own edit page (e.g. the Homes &
  // Rooms dashboard listing) send the admin back to where they clicked
  // delete from, instead of always landing on this home's now-deleted page.
  const redirectBase = (formData.get("redirectTo") as string | null) || `/admin/homes/${homeId}`;

  // A home can't be trashed out from under its still-active rooms — archive
  // or delete its rooms first instead.
  const roomCount = await prisma.room.count({ where: { homeId, deletedAt: null } });
  if (roomCount > 0) {
    redirect(`${redirectBase}?error=has-rooms`);
  }

  // Soft delete rather than a real row delete: keeps the row (and its
  // photos) around so it can be recovered from the admin Trash if this was
  // clicked by accident.
  await prisma.home.update({
    where: { id: homeId },
    data: { deletedAt: new Date() },
  });

  revalidateRoomPaths();
  redirect("/admin/homes");
}

export async function restoreHome(formData: FormData) {
  await requireAdmin();

  const homeId = formData.get("homeId") as string;

  await prisma.home.update({
    where: { id: homeId },
    data: { deletedAt: null },
  });

  revalidateRoomPaths();
}

export async function permanentlyDeleteHome(formData: FormData) {
  await requireAdmin();

  const homeId = formData.get("homeId") as string;

  const home = await prisma.home.findUnique({ where: { id: homeId } });
  if (!home?.deletedAt) return; // only reachable from the Trash list

  // A home can only reach Trash once its rooms are all trashed too (see
  // deleteHome above and restoreRoom's cascade), so any rooms still under
  // it here are themselves already-trashed and safe to take with it. Any
  // *live* room means something's inconsistent — refuse rather than
  // orphan it.
  const liveRoomCount = await prisma.room.count({ where: { homeId, deletedAt: null } });
  if (liveRoomCount > 0) {
    redirect("/admin/homes?error=has-rooms");
  }

  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { OR: [{ homeId }, { room: { homeId } }] } }),
    prisma.room.deleteMany({ where: { homeId } }),
    prisma.home.delete({ where: { id: homeId } }),
  ]);

  revalidateRoomPaths();
}

export async function uploadHomePhotos(formData: FormData) {
  await requireAdmin();
  const homeId = formData.get("homeId") as string;

  const created = await uploadPhotos({ homeId }, formData);

  revalidateRoomPaths();
  return created;
}

export async function deleteHomePhoto(photoId: string) {
  await requireAdmin();

  await deletePhoto(photoId);

  revalidateRoomPaths();
}

export async function reorderHomePhotos(homeId: string, orderedPhotoIds: string[]) {
  await requireAdmin();

  await reorderPhotos({ homeId }, orderedPhotoIds);

  revalidateRoomPaths();
}
