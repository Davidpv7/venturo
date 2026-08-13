import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import { formatFullName } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

const FILTERS = [
  { value: "needs-review", label: "Needs review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

function whereForFilter(filter: FilterValue): Prisma.ApplicationWhereInput {
  switch (filter) {
    case "needs-review":
      return { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } };
    case "approved":
      return { status: "APPROVED" };
    case "rejected":
      return { status: "REJECTED" };
    case "all":
      return { status: { not: "DRAFT" } };
  }
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = FILTERS.find((f) => f.value === status)?.value ?? "needs-review";

  const applications = await prisma.application.findMany({
    where: whereForFilter(filter),
    include: { user: true, room: { include: { home: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container size="md" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Applications
      </h1>
      <p className="mt-4 max-w-xl text-foreground/80">
        Review submitted rental applications and approve or reject them. Drafts aren&apos;t
        shown here — they&apos;re still in progress.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "needs-review" ? "/admin/applications" : `/admin/applications?status=${f.value}`}
            className={`rounded-full px-3 py-1 font-medium ${
              filter === f.value
                ? "bg-venturo-olive/10 text-venturo-olive"
                : "text-foreground/60 hover:text-venturo-olive"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {applications.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/60">No applications here.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {applications.map((application) => (
            <Card
              key={application.id}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-semibold text-foreground">
                  {formatFullName(application.user) ?? application.user.email}
                </h2>
                <p className="text-sm text-foreground/60">
                  {application.room.title} — {application.room.home.name}
                </p>
                <p className="text-xs text-foreground/50">
                  Submitted {application.submittedAt?.toLocaleDateString("en-AU") ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ApplicationStatusBadge status={application.status} />
                <ButtonLink
                  href={`/admin/applications/${application.id}`}
                  size="sm"
                  variant="secondary"
                >
                  Review
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
