import { DashboardNav, type DashboardNavLink } from "@/components/ui/dashboard-nav";

const NAV_LINKS: DashboardNavLink[] = [
  { href: "/account", label: "My Stay", exact: true },
  { href: "/account/applications", label: "Applications" },
  { href: "/account/lease", label: "Lease Agreement" },
  { href: "/account/money", label: "My Money" },
  { href: "/account/documents", label: "Documents" },
  { href: "/account/announcements", label: "Announcements" },
  { href: "/account/profile", label: "Account" },
];

export function AccountTabs() {
  return <DashboardNav links={NAV_LINKS} />;
}
