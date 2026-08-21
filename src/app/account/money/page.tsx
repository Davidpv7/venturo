import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getCurrentContract } from "@/lib/customer-contract";
import { getRentDueStatus } from "@/lib/rent-status";
import { formatCurrency, formatWeeklyPrice } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { ModalTrigger } from "@/components/ui/modal";
import { RentDueBadge } from "@/components/rent-due-badge";
import { RentPaymentStatus } from "@/components/rent-payment-status";
import { confirmRentPayment } from "./actions";

export default async function MyMoneyPage() {
  const dbUser = await requireUser();
  const contract = await getCurrentContract(dbUser.id);

  if (!contract) {
    return (
      <Container size="sm" className="py-16 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          My Money
        </h1>
        <p className="mt-4 text-sm text-foreground/60">
          You don&apos;t have a lease yet —{" "}
          <Link href="/rent-a-room" className="font-medium text-venturo-olive hover:underline">
            browse available rooms
          </Link>
          .
        </p>
      </Container>
    );
  }

  const { room, rentPayments } = contract;
  const rentCents = contract.overridePriceCents ?? room.price;
  const paymentSettings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        My Money
      </h1>

      <Card className="mt-8">
        <h2 className="font-semibold text-foreground">Rent</h2>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatWeeklyPrice(rentCents)}
        </p>

        {contract.depositConfirmed ? (
          <>
            <p className="mt-1 text-sm text-foreground/60">
              {contract.nextRentDueDate
                ? `Next due ${contract.nextRentDueDate.toLocaleDateString("en-AU")}`
                : "No due date set yet — contact us."}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <ModalTrigger
                label="Pay My Rent"
                title="Pay My Rent"
                triggerClassName="inline-flex items-center justify-center rounded-md bg-venturo-olive px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-venturo-olive/90 cursor-pointer"
              >
                <div className="flex flex-col gap-4 text-sm text-foreground">
                  <p>
                    Pay <span className="font-semibold">{formatWeeklyPrice(rentCents)}</span> by
                    bank transfer to the account below
                    {contract.nextRentDueDate
                      ? ` — next due ${contract.nextRentDueDate.toLocaleDateString("en-AU")}.`
                      : "."}
                  </p>
                  {paymentSettings ? (
                    <pre className="whitespace-pre-wrap rounded-md border border-venturo-olive/15 bg-venturo-cream-alt p-4 font-sans text-sm text-foreground">
                      {paymentSettings.bankDetails}
                    </pre>
                  ) : (
                    <p className="text-foreground/60">
                      Bank details haven&apos;t been set up yet — contact your host directly.
                    </p>
                  )}
                  <p className="text-xs text-foreground/50">
                    Once you&apos;ve made the transfer, close this and click &quot;I&apos;ve
                    Paid&quot; below.
                  </p>
                </div>
              </ModalTrigger>
            </div>

            <div className="mt-4 border-t border-venturo-olive/10 pt-4">
              <RentPaymentStatus
                rentTenantConfirmedAt={contract.rentTenantConfirmedAt}
                confirmAction={confirmRentPayment}
              />
            </div>

            <div className="mt-3">
              <ModalTrigger
                label="Pay History & Upcoming"
                title="Pay History & Upcoming"
                triggerClassName="text-xs font-medium text-venturo-olive hover:underline cursor-pointer"
              >
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-foreground/40">
                    Upcoming
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground">
                      {contract.nextRentDueDate
                        ? `Next due ${contract.nextRentDueDate.toLocaleDateString("en-AU")}`
                        : "No due date set yet"}
                    </span>
                    {contract.rentTenantConfirmedAt ? (
                      <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Pending confirmation
                      </span>
                    ) : (
                      <RentDueBadge status={getRentDueStatus(contract.nextRentDueDate)} />
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-foreground/40">
                    History
                  </h3>
                  {rentPayments.length === 0 ? (
                    <p className="mt-2 text-sm text-foreground/60">No payments recorded yet.</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-3">
                      {rentPayments.map((payment) => (
                        <li key={payment.id} className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatCurrency(payment.amountCents)} paid{" "}
                              {payment.paidAt.toLocaleDateString("en-AU")}
                            </p>
                            <p className="text-xs text-foreground/50">
                              For the period due {payment.dueDate.toLocaleDateString("en-AU")}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-venturo-olive/10 px-2.5 py-1 text-xs font-medium text-venturo-olive">
                            Paid
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </ModalTrigger>
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-foreground/60">
            Rent payments open up once your deposit is confirmed — see below.
          </p>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">Deposit</h2>
        <p className="mt-2 text-sm text-foreground">
          {contract.depositConfirmed ? (
            <>
              Held — confirmed{" "}
              {contract.depositConfirmedAt?.toLocaleDateString("en-AU") ?? ""}
            </>
          ) : (
            "Not yet confirmed"
          )}
        </p>
      </Card>
    </Container>
  );
}
