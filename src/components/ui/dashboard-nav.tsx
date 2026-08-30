"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type DashboardNavLink = {
  href: string;
  label: string;
  // Section roots (e.g. "/admin", "/account") must match exactly — every
  // other link matches its own href plus any nested route beneath it.
  exact?: boolean;
  badge?: number | null;
};

function isActive(pathname: string, link: DashboardNavLink) {
  if (link.exact) return pathname === link.href;
  return pathname === link.href || pathname.startsWith(link.href + "/");
}

function NavBadge({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-venturo-olive px-1.5 py-0.5 text-xs font-semibold text-white">
      {count}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={["h-4 w-4 shrink-0 transition-transform", open ? "rotate-180" : ""].join(" ")}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Shared by the admin sidebar and the tenant account tabs — both are a
// vertical link list on desktop, but on mobile a sideways-scrolling pill row
// gave no hint there was more to scroll to. This swaps that for a button
// showing the current section that expands into a full-width dropdown.
export function DashboardNav({ links }: { links: DashboardNavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const current = links.find((link) => isActive(pathname, link)) ?? links[0];

  return (
    <nav className="shrink-0 border-b border-venturo-olive/15 bg-venturo-cream-alt sm:w-48 sm:border-b-0 sm:border-r">
      <div className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-venturo-olive"
        >
          <span className="flex items-center gap-2">
            {current.label}
            {!!current.badge && <NavBadge count={current.badge} />}
          </span>
          <ChevronIcon open={open} />
        </button>

        {open && (
          <ul className="absolute inset-x-0 top-full z-10 flex flex-col gap-0.5 border-t border-venturo-olive/15 bg-venturo-cream-alt px-3 py-2 text-sm shadow-md">
            {links.map((link) => {
              const active = isActive(pathname, link);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className={[
                      "flex items-center justify-between gap-2 rounded-md px-3 py-2.5 font-medium transition-colors",
                      active
                        ? "bg-venturo-olive/10 text-venturo-olive"
                        : "text-foreground/70 hover:bg-venturo-olive/5 hover:text-venturo-olive",
                    ].join(" ")}
                  >
                    {link.label}
                    {!!link.badge && <NavBadge count={link.badge} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ul className="hidden text-sm sm:flex sm:flex-col sm:gap-0.5 sm:px-3 sm:py-6">
        {links.map((link) => {
          const active = isActive(pathname, link);
          return (
            <li key={link.href}>
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
                {!!link.badge && <NavBadge count={link.badge} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
