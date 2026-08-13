"use client";

import { useState } from "react";
import Link from "next/link";

type NavLink = { href: string; label: string };

export function NavMobileMenu({
  links,
  isAdmin,
  email,
  onLogout,
}: {
  links: NavLink[];
  isAdmin: boolean;
  email: string | null;
  onLogout: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-venturo-olive transition-colors hover:bg-venturo-olive/10"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-venturo-olive/15 bg-venturo-cream px-6 py-4 shadow-sm">
          <ul className="flex flex-col gap-1 text-sm font-medium">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block rounded px-2 py-2 text-foreground/80 hover:bg-venturo-olive/5 hover:text-venturo-olive"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  onClick={close}
                  className="block rounded px-2 py-2 font-semibold text-venturo-olive hover:bg-venturo-olive/5"
                >
                  Admin
                </Link>
              </li>
            )}
            {email ? (
              <>
                <li>
                  <Link
                    href="/account"
                    onClick={close}
                    className="block rounded px-2 py-2 text-foreground/60 hover:bg-venturo-olive/5 hover:text-venturo-olive"
                  >
                    {email}
                  </Link>
                </li>
                <li>
                  <form action={onLogout}>
                    <button
                      type="submit"
                      className="block w-full cursor-pointer rounded px-2 py-2 text-left text-foreground/80 hover:bg-venturo-olive/5 hover:text-venturo-olive"
                    >
                      Log out
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/login"
                  onClick={close}
                  className="block rounded px-2 py-2 text-foreground/80 hover:bg-venturo-olive/5 hover:text-venturo-olive"
                >
                  Log in
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
