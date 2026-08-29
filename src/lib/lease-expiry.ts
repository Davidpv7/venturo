import { prisma } from "@/lib/prisma";
import { sendEmail, leaseExpiredEmail } from "@/lib/email";
import { notifyInterestedUsers } from "@/lib/notify-interested-users";

// A room still PENDING_DEPOSIT past its Contract's expiresAt is
// unambiguously incomplete — confirmDeposit requires leaseSigned before it
// will flip the room to RENTED, so no separate leaseSigned/depositConfirmed
// check is needed here.
export async function releaseExpiredPendingLeases() {
  const expired = await prisma.contract.findMany({
    where: { expiresAt: { lte: new Date() }, endedAt: null, room: { status: "PENDING_DEPOSIT" } },
    include: { room: { include: { home: true } }, user: true },
  });

  for (const contract of expired) {
    await prisma.$transaction(async (tx) => {
      const claim = await tx.room.updateMany({
        where: { id: contract.roomId, status: "PENDING_DEPOSIT" },
        data: { status: "AVAILABLE", pendingSince: null },
      });

      if (claim.count === 0) return; // stale — already handled by a manual releaseRoom/confirmDeposit

      await tx.contract.update({
        where: { id: contract.id },
        data: { endedAt: new Date(), terminationReason: "Lease/deposit window expired" },
      });

      await notifyInterestedUsers(tx, contract.roomId);
    });

    const { subject, html, text } = leaseExpiredEmail(contract.room.title, contract.room.home.name);
    await sendEmail({ to: contract.user.email, subject, html, text });
  }

  return expired.length;
}
