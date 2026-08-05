"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Placeholder until the real T&Cs document exists (per project handoff notes)
// — every contract signed under the current terms gets tagged with this so
// future versions can change without rewriting history.
const CONTRACT_VERSION = "v1.0";

export async function signContract(formData: FormData) {
  const roomId = formData.get("roomId") as string;

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
      where: { id: roomId, status: "AVAILABLE" },
      data: { status: "PENDING_DEPOSIT", pendingSince: new Date() },
    });

    if (claim.count === 0) {
      return null;
    }

    const room = await tx.room.findUniqueOrThrow({ where: { id: roomId } });

    return tx.contract.create({
      data: {
        userId: user.id,
        roomId,
        contractVersion: CONTRACT_VERSION,
        leaseLengthMonths: room.leaseLengthMonths,
      },
    });
  });

  revalidatePath(`/rent-a-room/${roomId}`);
  revalidatePath("/rent-a-room");
  revalidatePath("/", "layout");

  if (!contract) {
    redirect(`/rent-a-room/${roomId}?error=unavailable`);
  }

  redirect(`/rent-a-room/${roomId}?signed=1`);
}
