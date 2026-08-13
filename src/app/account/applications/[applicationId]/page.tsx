import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import type { ApplicationStatus } from "@/generated/prisma/client";

const STATUS_MESSAGE: Record<ApplicationStatus, string> = {
  DRAFT: "You haven't finished this application yet.",
  SUBMITTED: "Your application has been submitted. We'll review it soon.",
  UNDER_REVIEW: "Your application is currently under review.",
  APPROVED:
    "Congratulations — your application has been approved! We'll be in touch about next steps.",
  REJECTED: "This application wasn't successful this time.",
};

export default async function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const dbUser = await requireUser();
  const { applicationId } = await params;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { room: { include: { home: true } } },
  });
  if (!application || application.userId !== dbUser.id) notFound();

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {application.room.title}
      </h1>
      <p className="mt-1 text-foreground/60">{application.room.home.name}</p>

      <Card className="mt-8">
        <div className="flex items-center gap-3">
          <ApplicationStatusBadge status={application.status} />
        </div>
        <p className="mt-4 leading-relaxed text-foreground/80">
          {STATUS_MESSAGE[application.status]}
        </p>

        {application.status === "REJECTED" && (
          <p className="mt-2 text-sm text-foreground/60">
            You&apos;re welcome to apply for another room whenever you&apos;re ready.
          </p>
        )}

        {application.status === "DRAFT" && (
          <ButtonLink href={`/apply/${application.id}/personal`} className="mt-6">
            Resume Application
          </ButtonLink>
        )}

        {application.status === "REJECTED" && (
          <ButtonLink href="/rent-a-room" variant="secondary" className="mt-6">
            Browse Other Rooms
          </ButtonLink>
        )}
      </Card>
    </Container>
  );
}
