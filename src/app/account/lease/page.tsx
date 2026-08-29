import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getCurrentContract } from "@/lib/customer-contract";
import { formatCurrency } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeaseDocument } from "@/components/lease/lease-document";
import { signLease } from "./actions";

const SIGN_ERRORS: Record<string, string> = {
  expired: "This lease offer has expired — the room has been released.",
  "missing-fields": "Please fill in every required field before signing.",
};

export default async function LeaseAgreementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const dbUser = await requireUser();
  const contract = await getCurrentContract(dbUser.id);
  const { error } = await searchParams;

  if (!contract) {
    return (
      <Container size="sm" className="py-16 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Lease Agreement
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

  const expired = !contract.leaseSigned && contract.endedAt != null;

  if (expired) {
    return (
      <Container size="sm" className="py-16 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Lease Agreement
        </h1>
        <p className="mt-4 text-sm text-foreground/60">
          This lease offer has expired and the room has been released. Please{" "}
          <Link href="/rent-a-room" className="font-medium text-venturo-olive hover:underline">
            browse available rooms
          </Link>{" "}
          to apply again.
        </p>
      </Container>
    );
  }

  const [application, paymentSettings] = await Promise.all([
    prisma.application.findFirst({
      where: { userId: dbUser.id, roomId: contract.roomId, status: "APPROVED" },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.paymentSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  const documentProps = {
    room: contract.room,
    contract,
    application: application ?? {
      legalFirstName: dbUser.name,
      legalLastName: dbUser.lastName,
      dateOfBirth: null,
      phone: dbUser.phone,
      email: dbUser.email,
      employerName: null,
      employerContact: null,
    },
    user: dbUser,
    bankDetails: paymentSettings?.bankDetails ?? null,
  };

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Lease Agreement
      </h1>

      {!contract.leaseSigned && contract.expiresAt && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          Sign this lease and send the deposit before{" "}
          <strong>{contract.expiresAt.toLocaleString("en-AU")}</strong>, or the room will be
          released.
        </p>
      )}

      {error && SIGN_ERRORS[error] && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {SIGN_ERRORS[error]}
        </p>
      )}

      {contract.leaseSigned && (
        <p className="mt-3 rounded-md bg-venturo-olive/10 px-3 py-2.5 text-sm text-venturo-olive">
          Signed {contract.leaseSignedAt?.toLocaleString("en-AU")}.{" "}
          {contract.depositConfirmed ? "Deposit confirmed — you're all set." : "Deposit still needed — see below."}
        </p>
      )}

      <Card className="mt-6">
        {contract.leaseSigned ? (
          <LeaseDocument mode="signed" {...documentProps} />
        ) : (
          <form action={signLease} className="flex flex-col gap-6">
            <input type="hidden" name="contractId" value={contract.id} />
            <LeaseDocument mode="preview" {...documentProps} />
            <Button type="submit" className="self-start">
              Sign Lease Agreement
            </Button>
          </form>
        )}
      </Card>

      {!contract.depositConfirmed && (
        <Card className="mt-6">
          <h2 className="font-semibold text-foreground">Deposit</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Pay{" "}
            <span className="font-semibold text-foreground">
              {contract.bondCents != null ? formatCurrency(contract.bondCents) : "the bond amount"}
            </span>{" "}
            by bank transfer to the account below. Once received, our team will confirm it here.
          </p>
          {paymentSettings ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-md border border-venturo-olive/15 bg-venturo-cream-alt p-4 font-sans text-sm text-foreground">
              {paymentSettings.bankDetails}
            </pre>
          ) : (
            <p className="mt-3 text-sm text-foreground/60">
              Bank details haven&apos;t been set up yet — contact us directly.
            </p>
          )}
        </Card>
      )}
    </Container>
  );
}
