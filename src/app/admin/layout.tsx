import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const unreadMessageCount = await prisma.contactMessage.count({
    where: { readAt: null, archivedAt: null },
  });
  const unreadQuestionCount = await prisma.roomQuestion.count({
    where: { readAt: null, archivedAt: null },
  });
  const pendingApplicationCount = await prisma.application.count({
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
  });
  const overdueRentCount = await prisma.contract.count({
    where: {
      depositConfirmed: true,
      nextRentDueDate: { lt: new Date() },
      room: { status: "RENTED" },
    },
  });
  const signedLeaseAwaitingDepositCount = await prisma.contract.count({
    where: {
      leaseSigned: true,
      depositConfirmed: false,
      room: { status: "PENDING_DEPOSIT" },
    },
  });

  return (
    <div className="flex flex-col sm:flex-row">
      <AdminSidebar
        unreadMessageCount={unreadMessageCount}
        unreadQuestionCount={unreadQuestionCount}
        pendingApplicationCount={pendingApplicationCount}
        overdueRentCount={overdueRentCount}
        signedLeaseAwaitingDepositCount={signedLeaseAwaitingDepositCount}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
