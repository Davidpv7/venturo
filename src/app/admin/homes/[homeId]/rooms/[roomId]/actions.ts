"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/app/admin/actions";
import { uploadPhotos, deletePhoto, updatePhotoOrder } from "@/lib/admin-photos";

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

  // Contract and Interest both carry FK RESTRICT on roomId — a room with
  // either a signed lease or "notify me" history can't be deleted at the DB
  // level. Point admins at archiveRoom (on the main /admin page) instead.
  const [contractCount, interestCount] = await Promise.all([
    prisma.contract.count({ where: { roomId } }),
    prisma.interest.count({ where: { roomId } }),
  ]);

  if (contractCount > 0 || interestCount > 0) {
    redirect(`/admin/homes/${homeId}/rooms/${roomId}?error=has-history`);
  }

  // Photo.roomId is ON DELETE SET NULL, not CASCADE — without this, deleting
  // the room would leave orphaned Photo rows with no home/room reference.
  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { roomId } }),
    prisma.room.delete({ where: { id: roomId } }),
  ]);

  revalidateRoomPaths();
  redirect(`/admin/homes/${homeId}`);
}

export async function uploadRoomPhotos(formData: FormData) {
  await requireAdmin();
  const roomId = formData.get("roomId") as string;

  await uploadPhotos({ roomId }, formData);

  revalidateRoomPaths();
}

export async function deleteRoomPhoto(formData: FormData) {
  await requireAdmin();
  const photoId = formData.get("photoId") as string;

  await deletePhoto(photoId);

  revalidateRoomPaths();
}

export async function updateRoomPhotoOrder(formData: FormData) {
  await requireAdmin();
  const photoId = formData.get("photoId") as string;
  const order = Number(formData.get("order"));

  await updatePhotoOrder(photoId, order);

  revalidateRoomPaths();
}
