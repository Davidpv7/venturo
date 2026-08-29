"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";
import { sendEmail, applicationApprovedEmail, applicationRejectedEmail } from "@/lib/email";
import { LEASE_VERSION } from "@/lib/lease-content";

// Both must be completed within this window (see lease-expiry cron) or the
// room is released back to AVAILABLE.
const LEASE_SIGN_WINDOW_HOURS = 24;

const MOVE_IN_CHECKLIST_ITEMS = [
  "Keys handed over",
  "Welcome pack & house rules reviewed",
  "Utilities & WiFi confirmed",
];

const MOVE_OUT_CHECKLIST_ITEMS = [
  "Final inspection completed",
  "Keys returned",
  "Deposit refunded",
];

export async function markUnderReview(formData: FormData) {
  await requireAdmin();
  const applicationId = formData.get("applicationId") as string;

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "UNDER_REVIEW" },
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function approveApplication(formData: FormData) {
  await requireAdmin();
  const applicationId = formData.get("applicationId") as string;

  const bondDollars = Number(formData.get("bondDollars"));
  const leaseStartDateRaw = formData.get("leaseStartDate") as string;
  const leaseStartDate = leaseStartDateRaw ? new Date(leaseStartDateRaw) : null;

  if (!Number.isFinite(bondDollars) || bondDollars <= 0 || !leaseStartDate || Number.isNaN(leaseStartDate.getTime())) {
    redirect(`/admin/applications/${applicationId}?error=invalid-bond-or-date`);
  }
  const bondCents = Math.round(bondDollars * 100);

  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: { user: true, room: { include: { home: true } } },
  });

  const expiresAt = new Date(Date.now() + LEASE_SIGN_WINDOW_HOURS * 60 * 60 * 1000);

  // Conditional update + create, both inside one transaction: the `where`
  // clause only matches if the room is still AVAILABLE, so approving into a
  // room another approved applicant already claimed backs off instead of
  // double-booking it.
  const contract = await prisma.$transaction(async (tx) => {
    const claim = await tx.room.updateMany({
      where: { id: application.roomId, status: "AVAILABLE", deletedAt: null },
      data: { status: "PENDING_DEPOSIT", pendingSince: new Date() },
    });

    if (claim.count === 0) {
      return null;
    }

    const newContract = await tx.contract.create({
      data: {
        userId: application.userId,
        roomId: application.roomId,
        contractVersion: LEASE_VERSION,
        leaseLengthMonths: application.intendedStayMonths!,
        bondCents,
        leaseStartDate,
        expiresAt,
      },
    });

    await tx.checklistItem.createMany({
      data: [
        ...MOVE_IN_CHECKLIST_ITEMS.map((label) => ({
          contractId: newContract.id,
          stage: "MOVE_IN" as const,
          label,
        })),
        ...MOVE_OUT_CHECKLIST_ITEMS.map((label) => ({
          contractId: newContract.id,
          stage: "MOVE_OUT" as const,
          label,
        })),
      ],
    });

    await tx.application.update({
      where: { id: applicationId },
      data: { status: "APPROVED", reviewedAt: new Date() },
    });

    return newContract;
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidateRoomPaths();

  if (!contract) {
    redirect(`/admin/applications/${applicationId}?error=room-unavailable`);
  }

  const { subject, html, text } = applicationApprovedEmail(
    application.room.title,
    application.room.home.name,
    expiresAt,
  );
  await sendEmail({ to: application.user.email, subject, html, text });
}

export async function rejectApplication(formData: FormData) {
  await requireAdmin();
  const applicationId = formData.get("applicationId") as string;

  const deleteAfter = new Date();
  deleteAfter.setDate(deleteAfter.getDate() + 60);

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED", rejectedAt: new Date(), reviewedAt: new Date(), deleteAfter },
    include: { user: true, room: { include: { home: true } } },
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);

  const { subject, html, text } = applicationRejectedEmail(
    application.room.title,
    application.room.home.name,
  );
  await sendEmail({ to: application.user.email, subject, html, text });
}
