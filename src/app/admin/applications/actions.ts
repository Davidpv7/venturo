"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";
import { sendEmail, applicationApprovedEmail, applicationRejectedEmail } from "@/lib/email";

// Placeholder until the real T&Cs document exists — every contract approved
// under the current terms gets tagged with this so future versions can
// change without rewriting history.
const CONTRACT_VERSION = "v1.0";

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

  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: { user: true, room: { include: { home: true } } },
  });

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

    const room = await tx.room.findUniqueOrThrow({ where: { id: application.roomId } });

    const newContract = await tx.contract.create({
      data: {
        userId: application.userId,
        roomId: application.roomId,
        contractVersion: CONTRACT_VERSION,
        leaseLengthMonths: room.leaseLengthMonths,
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
    application.room.homeId,
    application.roomId,
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
