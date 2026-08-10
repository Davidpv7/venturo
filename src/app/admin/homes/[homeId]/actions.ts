"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/app/admin/actions";
import { uploadPhotos, deletePhoto, reorderPhotos } from "@/lib/admin-photos";

export async function updateHome(formData: FormData) {
  await requireAdmin();

  const homeId = formData.get("homeId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;

  await prisma.home.update({
    where: { id: homeId },
    data: { name, description, address },
  });

  revalidateRoomPaths();
}

export async function deleteHome(formData: FormData) {
  await requireAdmin();

  const homeId = formData.get("homeId") as string;

  // Rooms carry lease/interest history via FK RESTRICT, so a home can't be
  // deleted out from under them — archive/delete its rooms first instead.
  const roomCount = await prisma.room.count({ where: { homeId } });
  if (roomCount > 0) {
    redirect(`/admin/homes/${homeId}?error=has-rooms`);
  }

  // Photo.homeId is ON DELETE SET NULL, not CASCADE — without this, deleting
  // the home would leave orphaned Photo rows with no home/room reference.
  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { homeId } }),
    prisma.home.delete({ where: { id: homeId } }),
  ]);

  revalidateRoomPaths();
  redirect("/admin");
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
