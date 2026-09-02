import { Prisma } from "@/generated/prisma/client";
import { sendEmail, roomAvailableEmail } from "@/lib/email";

// Called any time a room transitions back to AVAILABLE. Finds everyone who
// clicked "notify me" and hasn't been told yet, emails them, and marks them
// notified — so a room that flips available/unavailable repeatedly doesn't
// spam the same person twice.
export async function notifyInterestedUsers(tx: Prisma.TransactionClient, roomId: string) {
  const pending = await tx.interest.findMany({
    where: { roomId, notifiedAt: null },
    include: { user: true },
  });

  if (pending.length > 0) {
    const room = await tx.room.findUniqueOrThrow({ where: { id: roomId }, include: { home: true } });

    for (const interest of pending) {
      const { subject, html, text } = roomAvailableEmail(
        interest.user.name,
        room.title,
        room.home.name,
        room.homeId,
        room.id,
      );
      await sendEmail({ to: interest.user.email, subject, html, text });
    }

    await tx.interest.updateMany({
      where: { id: { in: pending.map((i) => i.id) } },
      data: { notifiedAt: new Date() },
    });
  }

  return pending.length;
}
