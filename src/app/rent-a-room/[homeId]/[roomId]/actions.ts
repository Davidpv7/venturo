"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUser } from "@/lib/require-verified-user";

// Finds the applicant's existing in-progress application for this room, if
// any, rather than creating a duplicate — but only among active statuses,
// so a previously REJECTED (or already APPROVED) application doesn't block
// starting a fresh one.
export async function startOrResumeApplication(formData: FormData) {
  const roomId = formData.get("roomId") as string;

  const dbUser = await requireVerifiedUser();

  const existing = await prisma.application.findFirst({
    where: { userId: dbUser.id, roomId, status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] } },
  });

  const application =
    existing ?? (await prisma.application.create({ data: { userId: dbUser.id, roomId } }));

  redirect(`/apply/${application.id}/personal`);
}
