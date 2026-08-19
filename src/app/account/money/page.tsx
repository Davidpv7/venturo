import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getCurrentContract } from "@/lib/customer-contract";
import { getInvoiceDisplayStatus } from "@/lib/invoices";
import { formatCurrency, formatWeeklyPrice } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModalTrigger } from "@/components/ui/modal";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
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

  const { room, invoices } = contract;
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
              {contract.rentTenantConfirmedAt ? (
                <p className="text-sm text-venturo-olive">
                  Thanks — you confirmed payment on{" "}
                  {contract.rentTenantConfirmedAt.toLocaleDateString("en-AU")}. We&apos;ll mark
                  this paid once it&apos;s received.
                </p>
              ) : (
                <form action={confirmRentPayment} className="flex items-center gap-3">
                  <Button type="submit" variant="secondary">
                    I&apos;ve Paid
                  </Button>
                  <span className="text-xs text-foreground/50">
                    Click once you&apos;ve sent the transfer above.
                  </span>
                </form>
              )}
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

      <section className="mt-10">
        <h2 className="font-semibold text-foreground">Payment History</h2>
        {invoices.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">No invoices yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-venturo-olive/15 bg-white p-4 text-sm shadow-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{invoice.number}</p>
                  <p className="text-foreground/60">
                    {formatCurrency(invoice.amountCents)} — due{" "}
                    {invoice.dueDate.toLocaleDateString("en-AU")}
                  </p>
                </div>
                <InvoiceStatusBadge status={getInvoiceDisplayStatus(invoice)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
