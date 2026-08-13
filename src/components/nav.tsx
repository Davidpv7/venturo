import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions";
import { ButtonLink } from "@/components/ui/button";
import { NavMobileMenu } from "@/components/nav-mobile-menu";

const links = [
  { href: "/", label: "Home" },
  { href: "/rent-a-room", label: "Rent a Room" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = user
    ? await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
    : null;
  const isAdmin = dbUser?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-20 border-b border-venturo-olive/15 bg-venturo-cream/95 backdrop-blur supports-[backdrop-filter]:bg-venturo-cream/80">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-venturo-olive">
          Venturo
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-medium sm:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-foreground/80 transition-colors hover:text-venturo-olive"
              >
                {link.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className="rounded-full bg-venturo-olive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-venturo-olive"
              >
                Admin
              </Link>
            </li>
          )}
          {user ? (
            <>
              <li>
                <Link
                  href="/account"
                  className="text-foreground/60 transition-colors hover:text-venturo-olive"
                >
                  {user.email}
                </Link>
              </li>
              <li>
                <form action={logout}>
                  <button
                    type="submit"
                    className="cursor-pointer text-foreground/80 transition-colors hover:text-venturo-olive"
                  >
                    Log out
                  </button>
                </form>
              </li>
            </>
          ) : (
            <li>
              <ButtonLink href="/login">Log in</ButtonLink>
            </li>
          )}
        </ul>

        <NavMobileMenu
          links={links}
          isAdmin={isAdmin}
          email={user?.email ?? null}
          onLogout={logout}
        />
      </div>
    </header>
  );
}
