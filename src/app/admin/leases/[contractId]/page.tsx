import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { formatFullName } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { LeaseDocument } from "@/components/lease/lease-document";

export default async function AdminLeaseDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  await requireAdmin();
  const { contractId } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { room: { include: { home: true } }, user: true },
  });
  if (!contract) notFound();

  const [application, paymentSettings] = await Promise.all([
    prisma.application.findFirst({
      where: { userId: contract.userId, roomId: contract.roomId, status: "APPROVED" },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.paymentSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {formatFullName(contract.user) ?? contract.user.email}&apos;s Lease
      </h1>
      <p className="mt-1 text-foreground/60">
        {contract.room.title} — {contract.room.home.name}
      </p>

      {!contract.leaseSigned ? (
        <Card className="mt-8">
          <p className="text-sm text-foreground/70">
            This tenant hasn&apos;t signed their lease yet.
            {contract.expiresAt && (
              <> Due by {contract.expiresAt.toLocaleString("en-AU")}.</>
            )}
          </p>
        </Card>
      ) : (
        <Card className="mt-8">
          <LeaseDocument
            mode="signed"
            room={contract.room}
            contract={contract}
            application={
              application ?? {
                legalFirstName: contract.user.name,
                legalLastName: contract.user.lastName,
                dateOfBirth: null,
                phone: contract.user.phone,
                email: contract.user.email,
                employerName: null,
                employerContact: null,
              }
            }
            user={contract.user}
            bankDetails={paymentSettings?.bankDetails ?? null}
          />
        </Card>
      )}
    </Container>
  );
}
