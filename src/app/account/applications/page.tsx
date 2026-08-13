import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/application-status-badge";

export default async function ApplicationsPage() {
  const dbUser = await requireUser();

  const applications = await prisma.application.findMany({
    where: { userId: dbUser.id },
    include: { room: { include: { home: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Applications
      </h1>

      {applications.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/60">
          You haven&apos;t started any applications yet —{" "}
          <Link href="/rent-a-room" className="font-medium text-venturo-olive hover:underline">
            browse available rooms
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {applications.map((application) => (
            <Card
              key={application.id}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-semibold text-foreground">{application.room.title}</h2>
                <p className="text-sm text-foreground/60">{application.room.home.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <ApplicationStatusBadge status={application.status} />
                <ButtonLink
                  href={
                    application.status === "DRAFT"
                      ? `/apply/${application.id}/personal`
                      : `/account/applications/${application.id}`
                  }
                  size="sm"
                  variant="secondary"
                >
                  {application.status === "DRAFT" ? "Resume" : "View"}
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
