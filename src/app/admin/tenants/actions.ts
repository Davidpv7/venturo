"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";
import { notifyInterestedUsers } from "@/lib/notify-interested-users";
import { deleteApplicationDocuments } from "@/lib/application-documents";

export async function markRentPaid(formData: FormData) {
  await requireAdmin();

  const contractId = formData.get("contractId") as string;
  const nextDueDate = formData.get("nextDueDate") as string;

  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    include: { room: true },
  });
  const paidAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.rentPayment.create({
      data: {
        contractId,
        amountCents: contract.overridePriceCents ?? contract.room.price,
        paidAt,
        dueDate: contract.nextRentDueDate ?? paidAt,
      },
    });
    await tx.contract.update({
      where: { id: contractId },
      data: {
        rentLastPaidAt: paidAt,
        rentTenantConfirmedAt: null,
        nextRentDueDate: new Date(`${nextDueDate}T00:00:00.000Z`),
      },
    });
  });

  revalidatePath("/admin/tenants");
  revalidatePath("/account/money");
}

export async function toggleChecklistItem(formData: FormData) {
  await requireAdmin();
  const itemId = formData.get("itemId") as string;
  const completed = formData.get("completed") === "true";

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { completed, completedAt: completed ? new Date() : null },
  });

  revalidatePath("/admin/tenants");
  revalidatePath("/account");
}

export async function terminateLease(formData: FormData) {
  await requireAdmin();
  const contractId = formData.get("contractId") as string;
  const reason = (formData.get("reason") as string).trim();

  const contract = await prisma.contract.findUniqueOrThrow({ where: { id: contractId } });

  await prisma.$transaction(async (tx) => {
    const claim = await tx.contract.updateMany({
      where: { id: contractId, endedAt: null },
      data: { endedAt: new Date(), terminationReason: reason || null },
    });
    if (claim.count === 0) return; // already terminated, stale click

    await tx.room.updateMany({
      where: { id: contract.roomId, status: "RENTED" },
      data: { status: "AVAILABLE" },
    });
    await notifyInterestedUsers(tx, contract.roomId);
  });

  // Storage deletion isn't transactional with Postgres, so it runs after the
  // lease-ending state change commits rather than inside the transaction —
  // the tenancy should stay ended even if the storage cleanup needs a retry.
  const application = await prisma.application.findFirst({
    where: { userId: contract.userId, roomId: contract.roomId, status: "APPROVED" },
    orderBy: { submittedAt: "desc" },
  });
  if (application) {
    await deleteApplicationDocuments(application.id);
  }

  revalidateRoomPaths();
  revalidatePath("/admin/tenants");
  revalidatePath("/admin/tenants/previous");
}
