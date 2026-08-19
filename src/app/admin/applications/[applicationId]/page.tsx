import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getApplicationDocumentSignedUrl } from "@/lib/application-documents";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import { EMPLOYMENT_STATUS_LABEL, APPLICATION_DOCUMENT_TYPE_LABEL } from "@/lib/application-labels";
import { formatFullName } from "@/lib/format";
import { markUnderReview, approveApplication, rejectApplication } from "../actions";

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between">
      <dt className="text-foreground/50">{label}</dt>
      <dd className="font-medium text-foreground sm:text-right">{value || "—"}</dd>
    </div>
  );
}

export default async function AdminApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { applicationId } = await params;
  const { error } = await searchParams;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { user: true, room: { include: { home: true } }, documents: true },
  });
  if (!application) notFound();

  const documentsWithUrls = await Promise.all(
    application.documents.map(async (doc) => ({
      ...doc,
      signedUrl: await getApplicationDocumentSignedUrl(doc),
    })),
  );

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {formatFullName(application.user) ?? application.user.email}
      </h1>
      <p className="mt-1 text-foreground/60">
        Applying for {application.room.title} — {application.room.home.name}
      </p>
      <div className="mt-4">
        <ApplicationStatusBadge status={application.status} />
      </div>

      {error === "room-unavailable" && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          This room is no longer available — someone else&apos;s application
          already claimed it. Reject this application or pick a different
          room.
        </p>
      )}

      <Card className="mt-8">
        <h2 className="font-semibold text-foreground">Personal details</h2>
        <dl className="mt-3 divide-y divide-venturo-olive/10 text-sm">
          <SummaryRow
            label="Name"
            value={[application.legalFirstName, application.legalLastName]
              .filter(Boolean)
              .join(" ")}
          />
          <SummaryRow
            label="Date of birth"
            value={application.dateOfBirth?.toLocaleDateString("en-AU") ?? null}
          />
          <SummaryRow label="Phone" value={application.phone} />
          <SummaryRow label="Email" value={application.email} />
          <SummaryRow label="Current address" value={application.currentAddress} />
          <SummaryRow
            label="Preferred move-in"
            value={application.preferredMoveIn?.toLocaleDateString("en-AU") ?? null}
          />
          <SummaryRow
            label="Intended stay"
            value={application.intendedStayMonths ? `${application.intendedStayMonths} months` : null}
          />
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">Identity verification</h2>
        <dl className="mt-3 divide-y divide-venturo-olive/10 text-sm">
          <SummaryRow
            label="Australian citizen / PR"
            value={
              application.isAustralianCitizen === null
                ? null
                : application.isAustralianCitizen
                  ? "Yes"
                  : "No"
            }
          />
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">Income &amp; employment</h2>
        <dl className="mt-3 divide-y divide-venturo-olive/10 text-sm">
          <SummaryRow
            label="Employment status"
            value={
              application.employmentStatus ? EMPLOYMENT_STATUS_LABEL[application.employmentStatus] : null
            }
          />
          <SummaryRow label="Employer" value={application.employerName} />
          <SummaryRow label="Employer contact" value={application.employerContact} />
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">Rental history &amp; references</h2>
        <dl className="mt-3 divide-y divide-venturo-olive/10 text-sm">
          <SummaryRow label="Previous address" value={application.previousAddress} />
          <SummaryRow label="Landlord / agent contact" value={application.landlordContact} />
          <SummaryRow label="Reason for leaving" value={application.reasonForLeaving} />
          <SummaryRow
            label="Reference 1"
            value={[application.reference1Name, application.reference1Phone, application.reference1Email]
              .filter(Boolean)
              .join(" · ")}
          />
          <SummaryRow
            label="Reference 2"
            value={[application.reference2Name, application.reference2Phone, application.reference2Email]
              .filter(Boolean)
              .join(" · ")}
          />
          <SummaryRow label="About me" value={application.aboutMe} />
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">Documents</h2>
        {documentsWithUrls.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">No documents uploaded.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {documentsWithUrls.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-venturo-olive hover:underline"
                >
                  {APPLICATION_DOCUMENT_TYPE_LABEL[doc.type]} — {doc.fileName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">Decision</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {application.status === "SUBMITTED" && (
            <form action={markUnderReview}>
              <input type="hidden" name="applicationId" value={application.id} />
              <Button type="submit" variant="secondary">
                Mark Under Review
              </Button>
            </form>
          )}
          {(application.status === "SUBMITTED" || application.status === "UNDER_REVIEW") && (
            <>
              <form action={approveApplication}>
                <input type="hidden" name="applicationId" value={application.id} />
                <Button type="submit">Approve</Button>
              </form>
              <form action={rejectApplication}>
                <input type="hidden" name="applicationId" value={application.id} />
                <Button type="submit" variant="danger">
                  Reject
                </Button>
              </form>
            </>
          )}
          {application.status === "APPROVED" && (
            <p className="text-sm text-foreground/60">This application has been approved.</p>
          )}
          {application.status === "REJECTED" && (
            <p className="text-sm text-foreground/60">
              Rejected {application.rejectedAt?.toLocaleDateString("en-AU")} — data will be
              deleted after {application.deleteAfter?.toLocaleDateString("en-AU")}.
            </p>
          )}
        </div>
      </Card>
    </Container>
  );
}
