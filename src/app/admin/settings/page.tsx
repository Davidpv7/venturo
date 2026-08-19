import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const [adminCount, userCount, roomCount, overrideCount] = await Promise.all([
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.room.count({ where: { deletedAt: null } }),
    prisma.contract.count({ where: { overridePriceCents: { not: null } } }),
  ]);

  return (
    <Container size="md" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Settings
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-foreground">Team &amp; Roles</h2>
          <p className="mt-1 text-sm text-foreground/60">
            {adminCount} admin{adminCount === 1 ? "" : "s"}, {userCount} user
            {userCount === 1 ? "" : "s"}
          </p>
          <ButtonLink href="/admin/users" size="sm" className="mt-4">
            Manage Users
          </ButtonLink>
        </Card>

        <Card>
          <h2 className="font-semibold text-foreground">Pricing</h2>
          <p className="mt-1 text-sm text-foreground/60">
            {roomCount} room{roomCount === 1 ? "" : "s"}, {overrideCount} active override
            {overrideCount === 1 ? "" : "s"}
          </p>
          <ButtonLink href="/admin/settings/pricing" size="sm" className="mt-4">
            Manage Pricing
          </ButtonLink>
        </Card>

        <Card>
          <h2 className="font-semibold text-foreground">Payment</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Bank details shown to tenants in the Pay My Rent popup
          </p>
          <ButtonLink href="/admin/settings/payment" size="sm" className="mt-4">
            Manage Payment
          </ButtonLink>
        </Card>
      </div>
    </Container>
  );
}
