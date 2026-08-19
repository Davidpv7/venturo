"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/homes", label: "Homes" },
  { href: "/admin/tenants", label: "Tenants" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/settings", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar({
  unreadMessageCount = 0,
  unreadQuestionCount = 0,
  pendingApplicationCount = 0,
  overdueRentCount = 0,
}: {
  unreadMessageCount?: number;
  unreadQuestionCount?: number;
  pendingApplicationCount?: number;
  overdueRentCount?: number;
}) {
  const pathname = usePathname();

  const badgeCounts: Record<string, number> = {
    "/admin/messages": unreadMessageCount,
    "/admin/questions": unreadQuestionCount,
    "/admin/applications": pendingApplicationCount,
    "/admin/tenants": overdueRentCount,
  };

  return (
    <nav className="shrink-0 border-b border-venturo-olive/15 bg-venturo-cream-alt sm:w-48 sm:border-b-0 sm:border-r">
      <ul className="flex gap-1 overflow-x-auto px-4 py-3 text-sm sm:flex-col sm:gap-0.5 sm:px-3 sm:py-6">
        {NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          const badge = badgeCounts[link.href] > 0 ? badgeCounts[link.href] : null;
          return (
            <li key={link.href} className="shrink-0 sm:shrink">
              <Link
                href={link.href}
                className={[
                  "flex items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-2 font-medium transition-colors",
                  active
                    ? "bg-venturo-olive/10 text-venturo-olive"
                    : "text-foreground/70 hover:bg-venturo-olive/5 hover:text-venturo-olive",
                ].join(" ")}
              >
                {link.label}
                {badge !== null && (
                  <span className="rounded-full bg-venturo-olive px-1.5 py-0.5 text-xs font-semibold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
