"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";
import { notifyInterestedUsers } from "@/lib/notify-interested-users";

export async function confirmDeposit(formData: FormData) {
  await requireAdmin();
  const roomId = formData.get("roomId") as string;

  const room = await prisma.room.findUniqueOrThrow({ where: { id: roomId } });
  if (room.status !== "PENDING_DEPOSIT") return; // stale click, ignore

  const contract = await prisma.contract.findFirstOrThrow({
    where: { roomId, depositConfirmed: false },
    orderBy: { agreedAt: "desc" },
  });

  // The room can't go RENTED without a signed lease on file, even if an
  // admin clicks this before the tenant has signed — defense in depth,
  // same reasoning requireAdmin's own comment gives for checks living
  // inside the action itself.
  if (!contract.leaseSigned) {
    redirect("/admin/homes?error=lease-not-signed");
  }

  await prisma.$transaction(async (tx) => {
    const now = new Date();
    const nextRentDueDate = new Date(now);
    nextRentDueDate.setDate(nextRentDueDate.getDate() + 7);

    await tx.contract.update({
      where: { id: contract.id },
      data: { depositConfirmed: true, depositConfirmedAt: now, nextRentDueDate },
    });

    await tx.room.update({
      where: { id: roomId },
      data: { status: "RENTED", pendingSince: null },
    });
  });

  revalidateRoomPaths();
}

export async function releaseRoom(formData: FormData) {
  await requireAdmin();
  const roomId = formData.get("roomId") as string;

  // The lease-expiry cron (src/lib/lease-expiry.ts) now handles this
  // automatically once a Contract's expiresAt passes — this stays as a
  // manual override so an admin can release a room early without waiting
  // on the deadline. The unconfirmed Contract row is left in place as
  // history, same as Interest rows never get deleted.
  await prisma.$transaction(async (tx) => {
    const claim = await tx.room.updateMany({
      where: { id: roomId, status: "PENDING_DEPOSIT" },
      data: { status: "AVAILABLE", pendingSince: null },
    });
    if (claim.count > 0) {
      await notifyInterestedUsers(tx, roomId);
    }
  });

  revalidateRoomPaths();
}

export async function markRoomAvailable(formData: FormData) {
  await requireAdmin();
  const roomId = formData.get("roomId") as string;

  // For a RENTED room going back on the market — e.g. a tenant moved out —
  // as opposed to releaseRoom, which is specifically the deposit-window-
  // expired path out of PENDING_DEPOSIT.
  await prisma.$transaction(async (tx) => {
    const claim = await tx.room.updateMany({
      where: { id: roomId, status: "RENTED" },
      data: { status: "AVAILABLE" },
    });
    if (claim.count > 0) {
      await notifyInterestedUsers(tx, roomId);
    }
  });

  revalidateRoomPaths();
}

export async function archiveRoom(formData: FormData) {
  await requireAdmin();
  const roomId = formData.get("roomId") as string;

  const room = await prisma.room.findUniqueOrThrow({ where: { id: roomId } });
  if (room.status === "RENTED") {
    redirect("/admin/homes?error=active-lease");
  }

  // The `status: "AVAILABLE"` guard is the business rule from the schema
  // notes: never archive mid-transaction out of PENDING_DEPOSIT, and never
  // archive out from under an active lease (checked above).
  await prisma.room.updateMany({
    where: { id: roomId, status: "AVAILABLE" },
    data: { status: "ARCHIVED" },
  });

  revalidateRoomPaths();
}

export async function unarchiveRoom(formData: FormData) {
  await requireAdmin();
  const roomId = formData.get("roomId") as string;

  await prisma.$transaction(async (tx) => {
    const claim = await tx.room.updateMany({
      where: { id: roomId, status: "ARCHIVED" },
      data: { status: "AVAILABLE" },
    });
    if (claim.count > 0) {
      await notifyInterestedUsers(tx, roomId);
    }
  });

  revalidateRoomPaths();
}
