import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { formatFullName, formatWeeklyPrice, toDateInputValue } from "@/lib/format";
import { getRentDueStatus } from "@/lib/rent-status";
import { getApplicationDocumentSignedUrl } from "@/lib/application-documents";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import { RentDueBadge } from "@/components/rent-due-badge";
import { TenantActionsMenu } from "@/components/admin/tenant-actions-menu";
import { markRentPaid, terminateLease, toggleChecklistItem } from "./actions";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default async function AdminTenantsPage() {
  await requireAdmin();

  const rooms = await prisma.room.findMany({
    where: { status: "RENTED", deletedAt: null },
    include: {
      home: true,
      contracts: {
        where: { depositConfirmed: true },
        orderBy: { agreedAt: "desc" },
        take: 1,
        include: {
          user: true,
          checklistItems: true,
          rentPayments: { orderBy: { paidAt: "desc" } },
        },
      },
    },
    orderBy: [{ home: { name: "asc" } }, { title: "asc" }],
  });

  const tenants = rooms
    .map((room) => ({ room, contract: room.contracts[0] }))
    .filter((entry): entry is { room: (typeof rooms)[number]; contract: NonNullable<(typeof rooms)[number]["contracts"][number]> } =>
      Boolean(entry.contract),
    );

  const tenantsWithDocuments = await Promise.all(
    tenants.map(async ({ room, contract }) => {
      const application = await prisma.application.findFirst({
        where: { userId: contract.userId, roomId: contract.roomId, status: "APPROVED" },
        orderBy: { submittedAt: "desc" },
        include: { documents: true },
      });

      const documents = await Promise.all(
        (application?.documents ?? []).map(async (doc) => ({
          id: doc.id,
          type: doc.type,
          fileName: doc.fileName,
          downloadUrl: await getApplicationDocumentSignedUrl(doc, { download: true }),
        })),
      );

      return { room, contract, documents };
    }),
  );

  return (
    <Container size="lg" className="py-16 sm:py-20">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Tenants
        </h1>
        <Link href="/admin/tenants/previous" className="text-sm text-venturo-olive hover:underline">
          View previous tenants →
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/60">
        Current tenants and their rent status. Tenants pay by manual bank transfer and can mark
        themselves as paid, but you have final say — nothing here is marked Paid until you click
        it yourself.
      </p>

      {tenantsWithDocuments.length === 0 ? (
        <p className="mt-8 rounded-xl border border-venturo-olive/15 bg-white p-6 text-sm text-foreground/60 shadow-sm">
          No current tenants.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-venturo-olive/15 text-foreground/50">
                <th className="px-5 py-3 font-medium">Tenant</th>
                <th className="px-5 py-3 font-medium">Room</th>
                <th className="px-5 py-3 font-medium">Weekly rent</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Next due date</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {tenantsWithDocuments.map(({ room, contract, documents }) => {
                const rentCents = contract.overridePriceCents ?? room.price;
                const status = getRentDueStatus(contract.nextRentDueDate);
                const defaultNextDueDate = toDateInputValue(
                  addDays(contract.nextRentDueDate ?? new Date(), 7),
                );

                return (
                  <tr key={contract.id} className="border-b border-venturo-olive/10 align-top last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {formatFullName(contract.user) ?? contract.user.email}
                      </div>
                      <div className="text-xs text-foreground/50">{contract.user.email}</div>
                      {contract.rentTenantConfirmedAt && (
                        <div className="mt-1 text-xs font-medium text-venturo-olive">
                          Tenant marked paid on{" "}
                          {contract.rentTenantConfirmedAt.toLocaleDateString("en-AU")}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-foreground/70">
                      {room.title}
                      <div className="text-xs text-foreground/50">{room.home.name}</div>
                    </td>
                    <td className="px-5 py-4 text-foreground/70">{formatWeeklyPrice(rentCents)}</td>
                    <td className="px-5 py-4">
                      <RentDueBadge status={status} />
                    </td>
                    <td className="px-5 py-4 text-foreground/70">
                      {contract.nextRentDueDate
                        ? contract.nextRentDueDate.toLocaleDateString("en-AU")
                        : "Not set"}
                    </td>
                    <td className="px-5 py-4">
                      <form action={markRentPaid} className="flex items-center gap-2">
                        <input type="hidden" name="contractId" value={contract.id} />
                        <input
                          name="nextDueDate"
                          type="date"
                          required
                          defaultValue={defaultNextDueDate}
                          className={`${inputClasses} w-40 py-1.5`}
                        />
                        <Button type="submit" size="sm">
                          Mark Paid
                        </Button>
                      </form>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <TenantActionsMenu
                        tenantName={formatFullName(contract.user) ?? contract.user.email}
                        contractId={contract.id}
                        documents={documents}
                        rentOverdue={status === "OVERDUE"}
                        checklistItems={contract.checklistItems}
                        incompleteMoveOutItems={contract.checklistItems
                          .filter((item) => item.stage === "MOVE_OUT" && !item.completed)
                          .map((item) => item.label)}
                        rentPayments={contract.rentPayments}
                        nextRentDueDate={contract.nextRentDueDate}
                        terminateAction={terminateLease}
                        toggleChecklistItemAction={toggleChecklistItem}
                      />
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
