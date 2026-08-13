import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const unreadMessageCount = await prisma.contactMessage.count({
    where: { readAt: null, archivedAt: null },
  });

  return (
    <div className="flex flex-col sm:flex-row">
      <AdminSidebar unreadMessageCount={unreadMessageCount} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
