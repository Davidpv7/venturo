import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { setUserRole } from "./actions";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <Container size="lg" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Users
      </h1>

      <div className="mt-8 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-venturo-olive/15 text-foreground/50">
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-venturo-olive/10 last:border-b-0">
                <td className="px-5 py-3 text-foreground">{user.email}</td>
                <td className="px-5 py-3 text-foreground/70">{user.name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-venturo-olive/10 text-venturo-olive"
                        : "bg-foreground/5 text-foreground/50"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-foreground/70">
                  {user.createdAt.toLocaleDateString("en-AU")}
                </td>
                <td className="px-5 py-3">
                  <form action={setUserRole}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input
                      type="hidden"
                      name="role"
                      value={user.role === "ADMIN" ? "USER" : "ADMIN"}
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      {user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
