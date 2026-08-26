"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";
import { uploadPhotos, deletePhoto, reorderPhotos } from "@/lib/admin-photos";
import { truncateToWords } from "@/lib/format";

export async function updateRoom(formData: FormData) {
  await requireAdmin();

  const roomId = formData.get("roomId") as string;
  const title = formData.get("title") as string;
  const subtitleRaw = ((formData.get("subtitle") as string) ?? "").trim();
  const subtitle = truncateToWords(subtitleRaw, 15) || null;
  const description = formData.get("description") as string;
  const price = Math.round(parseFloat(formData.get("price") as string) * 100);
  const leaseLengthMonths = parseInt(formData.get("leaseLengthMonths") as string, 10);

  await prisma.room.update({
    where: { id: roomId },
    data: { title, subtitle, description, price, leaseLengthMonths },
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

  // An active lease keeps this room's tenant relying on it — point admins at
  // Tenants to terminate the lease first. Notify-me interest and terminated
  // lease history never block a soft delete: the room row (and that history)
  // stays intact in Trash either way.
  const activeContractCount = await prisma.contract.count({
    where: { roomId, endedAt: null },
  });

  if (activeContractCount > 0) {
    redirect(`${redirectBase}?error=active-lease`);
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

  // Belt-and-braces re-check — deleteRoom only trashes a room once the active
  // lease check below is clear, but nothing stops new history landing on it
  // afterwards outside the normal UI flow.
  const activeContractCount = await prisma.contract.count({
    where: { roomId, endedAt: null },
  });
  if (activeContractCount > 0) {
    redirect("/admin/homes?error=active-lease");
  }

  // Terminated leases are exactly the tenant record admins want kept —
  // Contract.roomId is a RESTRICT foreign key, so this room can't be hard-
  // deleted while any lease history still points at it. Notify-me interest
  // has no such history value, so it's cleared below instead of blocking.
  const historicalContractCount = await prisma.contract.count({ where: { roomId } });
  if (historicalContractCount > 0) {
    redirect("/admin/homes?error=has-history");
  }

  await prisma.$transaction([
    prisma.interest.deleteMany({ where: { roomId } }),
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

function revalidateCustomerAccountPaths() {
  revalidatePath("/account");
  revalidatePath("/account/money");
  revalidatePath("/account/documents");
}

export async function createInvoice(formData: FormData) {
  await requireAdmin();

  const contractId = formData.get("contractId") as string;
  const number = formData.get("number") as string;
  const amountCents = Math.round(parseFloat(formData.get("amount") as string) * 100);
  const dueDate = new Date(formData.get("dueDate") as string);

  await prisma.invoice.create({
    data: { contractId, number, amountCents, dueDate },
  });

  revalidateCustomerAccountPaths();
}

export async function markInvoicePaid(formData: FormData) {
  await requireAdmin();

  const invoiceId = formData.get("invoiceId") as string;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID", paidAt: new Date() },
  });

  revalidateCustomerAccountPaths();
}

export async function toggleChecklistItem(formData: FormData) {
  await requireAdmin();

  const itemId = formData.get("itemId") as string;
  const item = await prisma.checklistItem.findUniqueOrThrow({ where: { id: itemId } });

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: {
      completed: !item.completed,
      completedAt: item.completed ? null : new Date(),
    },
  });

  revalidateCustomerAccountPaths();
}
