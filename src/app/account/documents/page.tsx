import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getCurrentContract } from "@/lib/customer-contract";
import { getLeaseEndDate } from "@/lib/lease";
import { getInvoiceDisplayStatus } from "@/lib/invoices";
import { formatCurrency, formatWeeklyPrice } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import type { DocumentType } from "@/generated/prisma/client";

const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  HOUSE_RULES: "House rules",
  LEASE_TEMPLATE: "Lease template",
  OTHER: "Other",
};

export default async function DocumentsPage() {
  const dbUser = await requireUser();
  const [contract, documents] = await Promise.all([
    getCurrentContract(dbUser.id),
    prisma.document.findMany({ orderBy: [{ type: "asc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Documents
      </h1>

      {contract ? (
        <Card className="mt-8">
          <h2 className="font-semibold text-foreground">Your Lease</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-foreground/50">Room</dt>
              <dd className="mt-0.5 font-medium text-foreground">{contract.room.title}</dd>
            </div>
            <div>
              <dt className="text-foreground/50">Rent</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {formatWeeklyPrice(contract.overridePriceCents ?? contract.room.price)}
              </dd>
            </div>
            <div>
              <dt className="text-foreground/50">Lease term</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {contract.leaseLengthMonths} months
              </dd>
            </div>
            <div>
              <dt className="text-foreground/50">Signed</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {contract.agreedAt.toLocaleDateString("en-AU")}
              </dd>
            </div>
            <div>
              <dt className="text-foreground/50">Ends</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {getLeaseEndDate(contract.agreedAt, contract.leaseLengthMonths).toLocaleDateString(
                  "en-AU",
                )}
              </dd>
            </div>
            <div>
              <dt className="text-foreground/50">Contract version</dt>
              <dd className="mt-0.5 font-medium text-foreground">{contract.contractVersion}</dd>
            </div>
          </dl>
        </Card>
      ) : (
        <p className="mt-4 text-sm text-foreground/60">
          You don&apos;t have a lease yet —{" "}
          <Link href="/rent-a-room" className="font-medium text-venturo-olive hover:underline">
            browse available rooms
          </Link>
          .
        </p>
      )}

      {contract && (
        <section className="mt-10">
          <h2 className="font-semibold text-foreground">Receipts &amp; Invoices</h2>
          {contract.invoices.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/60">No invoices yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-venturo-olive/15 text-foreground/50">
                    <th className="px-5 py-3 font-medium">Invoice #</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-venturo-olive/10 last:border-b-0">
                      <td className="px-5 py-3 font-medium text-foreground">{invoice.number}</td>
                      <td className="px-5 py-3 text-foreground/70">
                        {formatCurrency(invoice.amountCents)}
                      </td>
                      <td className="px-5 py-3">
                        <InvoiceStatusBadge status={getInvoiceDisplayStatus(invoice)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-semibold text-foreground">House Documents</h2>
        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">No documents yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {documents.map((document) => (
              <li
                key={document.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-venturo-olive/15 bg-white p-4 text-sm shadow-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{document.title}</p>
                  <p className="text-foreground/60">{DOCUMENT_TYPE_LABEL[document.type]}</p>
                </div>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-venturo-olive hover:underline"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
