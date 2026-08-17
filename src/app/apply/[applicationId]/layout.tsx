import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUser } from "@/lib/require-verified-user";
import { Container } from "@/components/ui/container";
import { ApplicationStepNav } from "@/components/apply/application-step-nav";

export default async function ApplyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ applicationId: string }>;
}) {
  const dbUser = await requireVerifiedUser();
  const { applicationId } = await params;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { room: { include: { home: true } } },
  });
  if (!application) notFound();

  // The wizard is draft-only — once submitted, editing happens nowhere in
  // this session, so redirect straight to the status screen instead.
  if (application.userId !== dbUser.id || application.status !== "DRAFT") {
    redirect(`/account/applications/${applicationId}`);
  }

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Rental Application
      </h1>
      <p className="mt-2 text-foreground/60">
        {application.room.title} — {application.room.home.name}
      </p>

      <div className="mt-8 flex flex-col gap-8 sm:flex-row">
        <ApplicationStepNav applicationId={applicationId} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
