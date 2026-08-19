"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";
import { sendEmail, roomAvailableEmail } from "@/lib/email";
import { Prisma } from "@/generated/prisma/client";

// Called any time a room transitions back to AVAILABLE. Finds everyone who
// clicked "notify me" and hasn't been told yet, emails them, and marks them
// notified — so a room that flips available/unavailable repeatedly doesn't
// spam the same person twice.
async function notifyInterestedUsers(tx: Prisma.TransactionClient, roomId: string) {
  const pending = await tx.interest.findMany({
    where: { roomId, notifiedAt: null },
    include: { user: true },
  });

  if (pending.length > 0) {
    const room = await tx.room.findUniqueOrThrow({ where: { id: roomId }, include: { home: true } });
    const { subject, html, text } = roomAvailableEmail(room.title, room.home.name, room.homeId, room.id);

    for (const interest of pending) {
      await sendEmail({ to: interest.user.email, subject, html, text });
    }

    await tx.interest.updateMany({
      where: { id: { in: pending.map((i) => i.id) } },
      data: { notifiedAt: new Date() },
    });
  }

  return pending.length;
}

export async function confirmDeposit(formData: FormData) {
  await requireAdmin();
  const roomId = formData.get("roomId") as string;

  await prisma.$transaction(async (tx) => {
    const room = await tx.room.findUniqueOrThrow({ where: { id: roomId } });
    if (room.status !== "PENDING_DEPOSIT") return; // stale click, ignore

    const contract = await tx.contract.findFirstOrThrow({
      where: { roomId, depositConfirmed: false },
      orderBy: { agreedAt: "desc" },
    });

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

  // Deliberately left as a manual admin action rather than an automated
  // 12-hour job — matches the project's "fine to check manually at this
  // scale" decision. The unconfirmed Contract row is left in place as
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

  // The `in: [...]` guard is the business rule from the schema notes: never
  // archive mid-transaction out of PENDING_DEPOSIT.
  await prisma.room.updateMany({
    where: { id: roomId, status: { in: ["AVAILABLE", "RENTED"] } },
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
