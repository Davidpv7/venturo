import { DashboardNav, type DashboardNavLink } from "@/components/ui/dashboard-nav";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/homes", label: "Homes" },
  { href: "/admin/tenants", label: "Tenants" },
  { href: "/admin/finance", label: "Finance" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar({
  unreadMessageCount = 0,
  unreadQuestionCount = 0,
  pendingApplicationCount = 0,
  overdueRentCount = 0,
  signedLeaseAwaitingDepositCount = 0,
}: {
  unreadMessageCount?: number;
  unreadQuestionCount?: number;
  pendingApplicationCount?: number;
  overdueRentCount?: number;
  signedLeaseAwaitingDepositCount?: number;
}) {
  const badgeCounts: Record<string, number> = {
    "/admin/messages": unreadMessageCount,
    "/admin/questions": unreadQuestionCount,
    "/admin/applications": pendingApplicationCount,
    "/admin/tenants": overdueRentCount,
    "/admin/homes": signedLeaseAwaitingDepositCount,
  };

  const links: DashboardNavLink[] = NAV_LINKS.map((link) => ({
    ...link,
    exact: link.href === "/admin",
    badge: badgeCounts[link.href] > 0 ? badgeCounts[link.href] : null,
  }));

  return <DashboardNav links={links} />;
}
