import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { formatCurrency } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { HomeCostEditor } from "@/components/admin/home-cost-editor";
import { updateHomeCosts } from "./actions";
import type { RoomStatus } from "@/generated/prisma/client";

const ACTIVE_ROOM_STATUSES: RoomStatus[] = ["AVAILABLE", "PENDING_DEPOSIT", "RENTED"];

function profitClass(cents: number) {
  return cents < 0 ? "text-red-600" : "text-foreground";
}

export default async function AdminFinancePage() {
  await requireAdmin();

  const homes = await prisma.home.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      weeklyCostCents: true,
      weeklyServiceCostCents: true,
      rooms: {
        where: { deletedAt: null },
        select: { price: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const homeFinances = homes.map((home) => {
    const potentialWeeklyIncomeCents = home.rooms
      .filter((room) => ACTIVE_ROOM_STATUSES.includes(room.status))
      .reduce((sum, room) => sum + room.price, 0);
    const currentWeeklyIncomeCents = home.rooms
      .filter((room) => room.status === "RENTED")
      .reduce((sum, room) => sum + room.price, 0);
    const costsCents = (home.weeklyCostCents ?? 0) + (home.weeklyServiceCostCents ?? 0);

    return {
      ...home,
      potentialWeeklyIncomeCents,
      currentWeeklyIncomeCents,
      costsCents,
      potentialProfitCents: potentialWeeklyIncomeCents - costsCents,
      currentProfitCents: currentWeeklyIncomeCents - costsCents,
    };
  });

  const totalPotentialProfitCents = homeFinances.reduce(
    (sum, home) => sum + home.potentialProfitCents,
    0,
  );
  const totalCurrentProfitCents = homeFinances.reduce(
    (sum, home) => sum + home.currentProfitCents,
    0,
  );

  return (
    <Container size="lg" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Finance
      </h1>
      <p className="mt-2 text-sm text-foreground/60">
        Weekly profit per house: room income (from listed prices, not actual payments
        received) minus what the house costs to run.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatTile
          label="Total weekly profit (fully rented)"
          value={formatCurrency(totalPotentialProfitCents)}
          hint="If every active room were rented"
        />
        <StatTile
          label="Total weekly profit (current)"
          value={formatCurrency(totalCurrentProfitCents)}
          hint="Based on rooms actually marked RENTED"
        />
      </div>

      <div className="mt-10 space-y-6">
        {homeFinances.length === 0 ? (
          <Card className="p-6 text-sm text-foreground/60">No homes yet.</Card>
        ) : (
          homeFinances.map((home) => (
            <Card key={home.id} className="p-6">
              <h2 className="text-lg font-semibold text-foreground">{home.name}</h2>

              <HomeCostEditor
                homeId={home.id}
                weeklyCostCents={home.weeklyCostCents}
                weeklyServiceCostCents={home.weeklyServiceCostCents}
                updateAction={updateHomeCosts}
              />

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-venturo-olive/15 text-foreground/50">
                      <th className="py-2 pr-4 font-medium">Income (fully rented)</th>
                      <th className="py-2 pr-4 font-medium">Income (current)</th>
                      <th className="py-2 pr-4 font-medium">Costs</th>
                      <th className="py-2 pr-4 font-medium">Profit (fully rented)</th>
                      <th className="py-2 font-medium">Profit (current)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 pr-4 text-foreground/70">
                        {formatCurrency(home.potentialWeeklyIncomeCents)}/week
                      </td>
                      <td className="py-3 pr-4 text-foreground/70">
                        {formatCurrency(home.currentWeeklyIncomeCents)}/week
                      </td>
                      <td className="py-3 pr-4 text-foreground/70">
                        {formatCurrency(home.costsCents)}/week
                      </td>
                      <td className={`py-3 pr-4 font-semibold ${profitClass(home.potentialProfitCents)}`}>
                        {formatCurrency(home.potentialProfitCents)}/week
                      </td>
                      <td className={`py-3 font-semibold ${profitClass(home.currentProfitCents)}`}>
                        {formatCurrency(home.currentProfitCents)}/week
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
}
