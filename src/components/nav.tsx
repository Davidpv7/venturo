import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions";

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

  return (
    <header className="border-b border-venturo-olive/20 bg-venturo-cream">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-venturo-olive">
          Venturo
        </Link>
        <ul className="flex items-center gap-6 text-sm font-medium">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-venturo-olive">
                {link.label}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              {dbUser?.role === "ADMIN" && (
                <li>
                  <Link href="/admin" className="hover:text-venturo-olive">
                    Admin
                  </Link>
                </li>
              )}
              <li className="text-foreground/60">{user.email}</li>
              <li>
                <form action={logout}>
                  <button type="submit" className="hover:text-venturo-olive">
                    Log out
                  </button>
                </form>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className="hover:text-venturo-olive">
                Log in
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
