"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

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

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "APPROVED", reviewedAt: new Date() },
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function rejectApplication(formData: FormData) {
  await requireAdmin();
  const applicationId = formData.get("applicationId") as string;

  const deleteAfter = new Date();
  deleteAfter.setDate(deleteAfter.getDate() + 60);

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED", rejectedAt: new Date(), reviewedAt: new Date(), deleteAfter },
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
}
