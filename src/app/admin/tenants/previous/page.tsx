import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { formatFullName, formatWeeklyPrice } from "@/lib/format";
import { Container } from "@/components/ui/container";

export default async function AdminPreviousTenantsPage() {
  await requireAdmin();

  const contracts = await prisma.contract.findMany({
    where: { endedAt: { not: null } },
    include: { user: true, room: { include: { home: true } } },
    orderBy: { endedAt: "desc" },
  });

  return (
    <Container size="lg" className="py-16 sm:py-20">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Previous Tenants
        </h1>
        <Link href="/admin/tenants" className="text-sm text-venturo-olive hover:underline">
          ← Back to current tenants
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/60">
        Archived tenancy history. Uploaded documents are deleted when a lease is terminated —
        this is a record of who rented what and when, not a place to find their files.
      </p>

      {contracts.length === 0 ? (
        <p className="mt-8 rounded-xl border border-venturo-olive/15 bg-white p-6 text-sm text-foreground/60 shadow-sm">
          No previous tenants yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-venturo-olive/15 text-foreground/50">
                <th className="px-5 py-3 font-medium">Tenant</th>
                <th className="px-5 py-3 font-medium">Room</th>
                <th className="px-5 py-3 font-medium">Weekly rent</th>
                <th className="px-5 py-3 font-medium">Lease started</th>
                <th className="px-5 py-3 font-medium">Lease ended</th>
                <th className="px-5 py-3 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => {
                const rentCents = contract.overridePriceCents ?? contract.room.price;

                return (
                  <tr key={contract.id} className="border-b border-venturo-olive/10 align-top last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {formatFullName(contract.user) ?? contract.user.email}
                      </div>
                      <div className="text-xs text-foreground/50">{contract.user.email}</div>
                    </td>
                    <td className="px-5 py-4 text-foreground/70">
                      {contract.room.title}
                      <div className="text-xs text-foreground/50">{contract.room.home.name}</div>
                    </td>
                    <td className="px-5 py-4 text-foreground/70">{formatWeeklyPrice(rentCents)}</td>
                    <td className="px-5 py-4 text-foreground/70">
                      {contract.agreedAt.toLocaleDateString("en-AU")}
                    </td>
                    <td className="px-5 py-4 text-foreground/70">
                      {contract.endedAt?.toLocaleDateString("en-AU")}
                    </td>
                    <td className="px-5 py-4 text-foreground/70">
                      {contract.terminationReason || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
