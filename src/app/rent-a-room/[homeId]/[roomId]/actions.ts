"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUser } from "@/lib/require-verified-user";

// Placeholder until the real T&Cs document exists (per project handoff notes)
// — every contract signed under the current terms gets tagged with this so
// future versions can change without rewriting history.
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

export async function signContract(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const homeId = formData.get("homeId") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Conditional update + create, both inside one transaction: the `where`
  // clause only matches if the room is still AVAILABLE, so if two people
  // submit at the same moment, exactly one `updateMany` reports count: 1 —
  // the other reports 0 and backs off instead of double-booking the room.
  const contract = await prisma.$transaction(async (tx) => {
    const claim = await tx.room.updateMany({
      where: { id: roomId, status: "AVAILABLE", deletedAt: null },
      data: { status: "PENDING_DEPOSIT", pendingSince: new Date() },
    });

    if (claim.count === 0) {
      return null;
    }

    const room = await tx.room.findUniqueOrThrow({ where: { id: roomId } });

    const newContract = await tx.contract.create({
      data: {
        userId: user.id,
        roomId,
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

    return newContract;
  });

  revalidatePath(`/rent-a-room/${homeId}/${roomId}`);
  revalidatePath(`/rent-a-room/${homeId}`);
  revalidatePath("/rent-a-room");
  revalidatePath("/", "layout");

  if (!contract) {
    redirect(`/rent-a-room/${homeId}/${roomId}?error=unavailable`);
  }

  redirect(`/rent-a-room/${homeId}/${roomId}?signed=1`);
}

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
