"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Prisma } from "@/generated/prisma/client";

export async function revalidateRoomPaths() {
  revalidatePath("/admin");
  revalidatePath("/rent-a-room", "layout");
  revalidatePath("/", "layout");
}

// Called any time a room transitions back to AVAILABLE. Finds everyone who
// clicked "notify me" and hasn't been told yet, "sends" the email, and marks
// them notified — so a room that flips available/unavailable repeatedly
// doesn't spam the same person twice.
//
// TODO: actually send via Resend once it's wired up (same integration the
// Contact page needs) — logging for now so this is honest about what it
// does rather than silently pretending to deliver an email.
async function notifyInterestedUsers(tx: Prisma.TransactionClient, roomId: string) {
  const pending = await tx.interest.findMany({
    where: { roomId, notifiedAt: null },
    include: { user: true },
  });

  for (const interest of pending) {
    console.log("[notify-me email]", { to: interest.user.email, roomId });
  }

  if (pending.length > 0) {
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

    await tx.contract.update({
      where: { id: contract.id },
      data: { depositConfirmed: true, depositConfirmedAt: new Date() },
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

export async function setUserRole(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "ADMIN" | "USER";

  await prisma.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/admin");
}
