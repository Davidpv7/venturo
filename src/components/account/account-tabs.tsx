"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/account", label: "My Stay" },
  { href: "/account/applications", label: "Applications" },
  { href: "/account/money", label: "My Money" },
  { href: "/account/documents", label: "Documents" },
  { href: "/account/announcements", label: "Announcements" },
  { href: "/account/profile", label: "Account" },
];

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 border-b border-venturo-olive/15 bg-venturo-cream-alt sm:w-48 sm:border-b-0 sm:border-r">
      <ul className="flex gap-1 overflow-x-auto px-4 py-3 text-sm sm:flex-col sm:gap-0.5 sm:px-3 sm:py-6">
        {NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href);
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
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
