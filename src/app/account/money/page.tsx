import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { getCurrentContract } from "@/lib/customer-contract";
import { getInvoiceDisplayStatus } from "@/lib/invoices";
import { formatCurrency, formatWeeklyPrice } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";

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
  const nextDueInvoice = invoices.find((invoice) => getInvoiceDisplayStatus(invoice) !== "PAID");

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
        <p className="mt-1 text-sm text-foreground/60">
          {nextDueInvoice
            ? `${formatCurrency(nextDueInvoice.amountCents)} due ${nextDueInvoice.dueDate.toLocaleDateString("en-AU")}`
            : "No upcoming invoice on file."}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Button type="button">Pay Rent</Button>
          <span className="text-xs text-foreground/50">Online payments coming soon</span>
        </div>
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
