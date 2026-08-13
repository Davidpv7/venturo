import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { formatCurrency } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { StatTile } from "@/components/ui/stat-tile";
import { ROOM_STATUS_LABEL } from "@/components/admin/room-status-badge";
import { OverviewCharts } from "@/components/admin/overview-charts";
import type { RoomStatus } from "@/generated/prisma/client";

const STATUS_ORDER: RoomStatus[] = ["AVAILABLE", "PENDING_DEPOSIT", "RENTED", "ARCHIVED"];

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [homeCount, statusCounts, homes, rentedIncome] = await Promise.all([
    prisma.home.count({ where: { deletedAt: null } }),
    prisma.room.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.home.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        rooms: { where: { deletedAt: null }, select: { status: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.room.aggregate({
      where: { status: "RENTED", deletedAt: null },
      _sum: { price: true },
    }),
  ]);

  const countByStatus = new Map(statusCounts.map((s) => [s.status, s._count._all]));
  const statusData = STATUS_ORDER.map((status) => ({
    status,
    label: ROOM_STATUS_LABEL[status],
    count: countByStatus.get(status) ?? 0,
  }));

  const homeData = homes.map((home) => {
    const counts: Record<RoomStatus, number> = {
      AVAILABLE: 0,
      PENDING_DEPOSIT: 0,
      RENTED: 0,
      ARCHIVED: 0,
    };
    for (const room of home.rooms) counts[room.status]++;
    return { homeId: home.id, homeName: home.name, ...counts };
  });

  const activeRooms =
    (countByStatus.get("AVAILABLE") ?? 0) +
    (countByStatus.get("PENDING_DEPOSIT") ?? 0) +
    (countByStatus.get("RENTED") ?? 0);
  const rentedCount = countByStatus.get("RENTED") ?? 0;
  const occupancyPct = activeRooms > 0 ? Math.round((rentedCount / activeRooms) * 100) : null;

  const weeklyIncomeCents = rentedIncome._sum.price ?? 0;
  const monthlyIncomeCents = Math.round((weeklyIncomeCents * 52) / 12);

  return (
    <Container size="lg" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Overview
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Homes" value={String(homeCount)} />
        <StatTile label="Active rooms" value={String(activeRooms)} hint="Excludes archived" />
        <StatTile label="Occupancy" value={occupancyPct === null ? "—" : `${occupancyPct}%`} />
        <StatTile
          label="Est. weekly income"
          value={formatCurrency(weeklyIncomeCents)}
          hint="Estimated from RENTED rooms' listed price — not actual payments received"
        />
        <StatTile
          label="Est. monthly income"
          value={formatCurrency(monthlyIncomeCents)}
          hint="Estimated from RENTED rooms' listed price — not actual payments received"
        />
      </div>

      <OverviewCharts statusData={statusData} homeData={homeData} />
    </Container>
  );
}
